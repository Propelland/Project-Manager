## Context

Este proyecto es una aplicación Next.js que actúa como integrador entre un sistema de gestión de proyectos y Kimai. La infraestructura ha sido blanco de ataques de criptominería en el pasado, lo que requiere un enfoque de "seguridad por diseño".

## Goals / Non-Goals

**Goals:**
- Establecer conexiones seguras y concurrentes a dos bases de datos MySQL.
- Proteger la aplicación contra ataques de inyección y ejecución de código malicioso.
- Implementar un control de acceso administrativo basado en secretos de entorno.
- Asegurar los endpoints de la API mediante validación de claves.

**Non-Goals:**
- Migrar datos entre las bases de datos (solo lectura/escritura integrada).
- Implementar un sistema de usuarios complejo (RBAC) más allá del acceso administrativo básico por ahora.

## Decisions

### 1. Dual Database Access con Prisma
- **Decisión**: Utilizar dos instancias de Prisma Client (o un ORM compatible con múltiples fuentes) para manejar `projectmanagerdb` y `kimai`.
- **Razón**: Permite mantener esquemas separados y conexiones aisladas, facilitando el mantenimiento y la seguridad.
- **Alternativas**: Usar un solo cliente con SQL nativo (demasiado propenso a errores y menos seguro) o migrar todo a una base de datos (fuera de alcance).

### 2. Middleware de Seguridad en Next.js
- **Decisión**: Implementar un Middleware global que verifique el `x-api-key` en rutas bajo `/api/` y valide la sesión administrativa en `/admin/`.
- **Razón**: Centraliza la seguridad y evita que los desarrolladores olviden aplicar protecciones en endpoints individuales.
- **Alternativas**: Validar en cada página/endpoint (propenso a omisiones).

### 3. Content Security Policy (CSP) Estricto
- **Decisión**: Configurar cabeceras CSP vía `next.config.js` o middleware que solo permitan scripts del dominio propio y fuentes de confianza explícitas.
- **Razón**: Mitigación directa contra la inyección de scripts de minería (como Coinhive o similares).
- **Alternativas**: Depender solo de saneamiento de inputs (insuficiente contra XSS persistente).

## Risks / Trade-offs

- **[Riesgo] Exposición de variables de entorno** → **Mitigación**: Uso de secretos protegidos en el entorno de despliegue y nunca subirlos al repositorio.
- **[Riesgo] Latencia por doble conexión** → **Mitigación**: Implementar connection pooling adecuado y asegurar que los servidores de BD estén en la misma red o tengan baja latencia.
- **[Riesgo] Falsos positivos en CSP** → **Mitigación**: Probar exhaustivamente en entorno de staging antes de pasar a producción.
