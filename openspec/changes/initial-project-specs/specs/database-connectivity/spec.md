## ADDED Requirements

### Requirement: Conexión Segura a Project Manager DB
El sistema DEBE conectarse de forma segura a la base de datos `projectmanagerdb` utilizando las credenciales proporcionadas en `DATABASE_URL`.

#### Scenario: Conexión exitosa a DB Principal
- **WHEN** la aplicación se inicia y solicita datos de gestión de proyectos
- **THEN** la conexión se establece correctamente y los datos son recuperados

### Requirement: Conexión Segura a Kimai DB
El sistema DEBE conectarse de forma segura a la base de datos de Kimai utilizando las variables `KIMAI_DB_HOST`, `KIMAI_DB_PORT`, `KIMAI_DB_USER`, `KIMAI_DB_PASSWORD` y `KIMAI_DB_NAME`.

#### Scenario: Conexión exitosa a Kimai
- **WHEN** se requiere sincronizar el tiempo trabajado desde Kimai
- **THEN** el sistema accede a la base de datos externa de Kimai sin errores
