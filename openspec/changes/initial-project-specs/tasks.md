## 1. Configuración Inicial y Entorno

- [ ] 1.1 Verificar y asegurar que todas las variables de entorno en `.env` sean correctas y seguras.
- [ ] 1.2 Configurar el entorno de desarrollo para soportar múltiples fuentes de datos Prisma (si se utiliza).

## 2. Conectividad de Base de Datos Dual

- [ ] 2.1 Implementar el cliente de base de datos para `projectmanagerdb` (DB Principal).
- [ ] 2.2 Implementar el cliente de base de datos para `kimai` (DB Externa).
- [ ] 2.3 Crear funciones de utilidad para asegurar que las conexiones se cierren correctamente y no haya fugas de recursos.

## 3. Capa de Seguridad de API

- [ ] 3.1 Crear el Middleware de Next.js para interceptar rutas de `/api/`.
- [ ] 3.2 Implementar la validación del encabezado `x-api-key` contra `API_KEY`.
- [ ] 3.3 Configurar las cabeceras Content Security Policy (CSP) en `next.config.js`.

## 4. Control de Acceso Administrativo

- [ ] 4.1 Implementar la lógica de autenticación para el panel `/admin/` usando `NEXT_PUBLIC_ADMIN_USERNAME` y `NEXT_PUBLIC_ADMIN_PASSWORD`.
- [ ] 4.2 Asegurar que las rutas administrativas estén protegidas por el Middleware de sesión.

## 5. Hardening y Validación

- [ ] 5.1 Implementar validaciones de Zod o similares para todas las entradas de la API para prevenir inyecciones.
- [ ] 5.2 Realizar una auditoría de dependencias (`npm audit`) y actualizar librerías críticas.
- [ ] 5.3 Configurar logs básicos de acceso para detectar intentos fallidos de intrusión.
