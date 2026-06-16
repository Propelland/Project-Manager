## ADDED Requirements

### Requirement: Prevención de Ejecución de Scripts Maliciosos (Anti-Minería)
El sistema DEBE implementar cabeceras de Content Security Policy (CSP) estrictas para evitar la carga de scripts de terceros no autorizados que puedan ser usados para minería.

#### Scenario: Carga de scripts bloqueada por CSP
- **WHEN** un atacante intenta inyectar un script de minería externo en la aplicación
- **THEN** el navegador bloquea la ejecución del script siguiendo la política CSP definida

### Requirement: Validación y Saneamiento de Entradas
Todas las entradas de usuario DEBEN ser validadas y saneadas antes de ser procesadas por las bases de datos para evitar inyecciones SQL.

#### Scenario: Saneamiento de entrada maliciosa
- **WHEN** un usuario introduce caracteres especiales de SQL en un campo de texto
- **THEN** el sistema escapa los caracteres o rechaza la entrada antes de enviarla a la base de datos
