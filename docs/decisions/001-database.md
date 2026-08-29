# 001 — Sin base de datos para el procesamiento local inicial

## Decisión

La primera versión funcional no requerirá PostgreSQL ni SQLite para procesar un audio.

## Motivo

El trabajo es puntual y basado en archivos. Una base de datos añadía instalación, configuración y un punto de fallo sin aportar valor al flujo principal.

## Consecuencia

El historial persistente podrá añadirse más adelante con SQLite, pero el procesamiento y la exportación deben funcionar sin ella. (Agosto de 2026: se eliminó el código heredado de PostgreSQL; el flujo principal no toca ninguna base de datos.)
