import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // --- SEGURIDAD RACKNERD: Captura de IP del atacante ---
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'desconocida';
  
  // Si vemos intentos raros, esto nos dirá quién es
  if (path.includes('lrt') || path.includes('NaN')) {
    console.error(`🚨 [ALERTA DE SEGURIDAD] Intento detectado desde IP: ${ip} | Path: ${path}`);
  }

  // Only protect API routes
  if (path.startsWith('/api')) {
    // Skip some public API routes if needed
    // For now, let's protect everything in /api
    
    const apiKey = request.headers.get('x-api-key');
    const secureApiKey = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY;

    if (!secureApiKey) {
      console.warn('Neither API_KEY nor NEXT_PUBLIC_API_KEY is set in environment variables. API routes are unprotected.');
      return NextResponse.next();
    }

    if (apiKey !== secureApiKey) {
      console.log(`[Middleware] Unauthorized request to ${request.nextUrl.pathname}. Received: ${apiKey ? '***' + apiKey.slice(-4) : 'MISSING'}`);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
