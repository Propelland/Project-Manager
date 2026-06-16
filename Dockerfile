# --- STAGE 1: Base ---
FROM node:20 AS base
RUN apt-get update && apt-get install -y openssl libc6 && rm -rf /var/lib/apt/lists/*

# --- STAGE 2: Dependencies ---
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
# Install dependencies (including devDependencies for the build)
RUN npm install
# Generate Prisma Client
RUN npx prisma generate

# --- STAGE 3: Builder ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Argumentos de construcción para variables NEXT_PUBLIC
ARG NEXT_PUBLIC_API_KEY
ARG NEXT_PUBLIC_ADMIN_USERNAME
ARG NEXT_PUBLIC_ADMIN_PASSWORD

ENV NEXT_PUBLIC_API_KEY=$NEXT_PUBLIC_API_KEY
ENV NEXT_PUBLIC_ADMIN_USERNAME=$NEXT_PUBLIC_ADMIN_USERNAME
ENV NEXT_PUBLIC_ADMIN_PASSWORD=$NEXT_PUBLIC_ADMIN_PASSWORD

# Disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# --- STAGE 4: Runner ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Security: Make the app directory read-only for the user
# and only allow writing to necessary directories
RUN chmod -R 555 /app && \
    chmod -R 777 /app/.next && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# server.js is created by next build from the standalone output
CMD ["node", "server.js"]
