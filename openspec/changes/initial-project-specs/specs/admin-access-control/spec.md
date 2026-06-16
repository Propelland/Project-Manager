## ADDED Requirements

### Requirement: Autenticación de Administrador por Entorno
El acceso al panel de administración DEBE estar protegido por las credenciales definidas en `NEXT_PUBLIC_ADMIN_USERNAME` y `NEXT_PUBLIC_ADMIN_PASSWORD`.

#### Scenario: Acceso concedido con credenciales correctas
- **WHEN** un usuario intenta acceder al panel admin con el username y password de las variables de entorno
- **THEN** el sistema permite el acceso a las funciones administrativas

#### Scenario: Acceso denegado con credenciales incorrectas
- **WHEN** un usuario intenta acceder con credenciales que no coinciden con las variables de entorno
- **THEN** el sistema deniega el acceso con un error 401
