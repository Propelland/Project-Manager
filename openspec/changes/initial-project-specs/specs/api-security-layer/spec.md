## ADDED Requirements

### Requirement: Validación de API Key en Endpoints Internos
Todas las solicitudes a los endpoints internos de la API DEBEN incluir un encabezado `x-api-key` que coincida con el valor de `API_KEY`.

#### Scenario: Solicitud con API Key válida
- **WHEN** un cliente realiza una solicitud a un endpoint interno con el encabezado `x-api-key` correcto
- **THEN** la solicitud es procesada con éxito

#### Scenario: Solicitud sin API Key o con Key inválida
- **WHEN** un cliente realiza una solicitud sin el encabezado `x-api-key` o con una clave incorrecta
- **THEN** la solicitud es rechazada con un error 403 Forbidden
