## Why

Este proyecto de Next.js es la pieza central para la gestión de proyectos de Propelland. Debido a ataques previos dirigidos a la infraestructura para minería de criptomonedas (crypto-mining), es imperativo documentar y asegurar cada funcionalidad. El proyecto necesita conectarse a dos bases de datos distintas: una para la gestión de proyectos interna y otra para la sincronización con Kimai (herramienta de control de tiempo). La seguridad, el control de acceso y la protección de los endpoints de la API son la máxima prioridad para evitar intrusiones y el abuso de recursos del servidor.

## What Changes

- **Conectividad a Base de Datos Dual**: Implementación de una arquitectura que maneje conexiones concurrentes y seguras a `projectmanagerdb` y `kimai`.
- **Panel de Administración Protegido**: Creación de una interfaz de administración accesible solo mediante credenciales robustas configuradas en variables de entorno.
- **Protección de API Endpoints**: Aseguramiento de todas las rutas internas mediante claves de API (`API_KEY`) para evitar ejecuciones no autorizadas.
- **Hardening de Seguridad**: Medidas específicas de prevención de inyección de código y ejecución de scripts maliciosos que podrían ser usados para minería.

## Capabilities

### New Capabilities
- `database-connectivity`: Gestión de conexiones seguras y eficientes a los servidores MySQL de Project Manager y Kimai.
- `admin-access-control`: Sistema de autenticación y autorización para el panel administrativo basado en variables de entorno.
- `api-security-layer`: Middleware de validación de API Keys para proteger los endpoints de la aplicación.
- `security-hardening`: Configuración de cabeceras de seguridad, validación de inputs y monitoreo para prevenir ataques de minería.

## Impact

- **Backend**: Configuración de Prisma u otro ORM para manejar múltiples fuentes de datos.
- **Infraestructura**: Monitoreo de uso de CPU/Memoria para detectar picos inusuales (posible minería).
- **Seguridad**: Revisión de todas las dependencias para evitar vulnerabilidades conocidas.
- **Configuración**: Dependencia crítica de variables de entorno seguras (.env).
