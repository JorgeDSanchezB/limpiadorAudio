# Guía para colaboradores y agentes

## Objetivo

Construir una aplicación de escritorio para Windows que procese localmente audios de podcast, reduzca ruido y permita descargar una copia limpia sin modificar el original.

## Reglas de trabajo

- No sobrescribir ni eliminar audios originales.
- Mantener el procesamiento local: los audios no se deben subir a servicios externos.
- Documentar decisiones de arquitectura en `docs/decisions/`.
- Añadir pruebas para la lógica nueva y ejecutar las comprobaciones disponibles antes de entregar cambios.
- No cambiar archivos generados (`target/`, `gen/`, `dist/`) salvo que sea imprescindible para una distribución.

## Estructura actual

La aplicación heredada está en `audio-platform/`: interfaz React/Tauri en `frontend/` y API Python en `backend/`. La transición a la arquitectura documentada debe hacerse de forma incremental.
