# Estado actual — 27 de agosto de 2026

## Funciona

- **Procesamiento real de audio**: `POST /api/v1/audio/process` recibe el archivo, lo valida (tamaño ≤ 500 MB y formato soportado), lo limpia con FFmpeg y devuelve la copia procesada.
- **Reducción de ruido por red neuronal (RNNoise)**: el filtro `arnndn` elimina ruido de fondo variable (tráfico, viento, música lejana) y conserva la voz. Se complementa con corte de frecuencias fuera de la voz (`highpass=80`, `lowpass=12000`), limitador y normalización de volumen. La salida es MP3 mono a 48 kHz, 192 kbps.
- **Descarga y escucha**: `GET /audio/download/{job_id}` entrega el MP3 generado; la interfaz muestra reproductor y botón de descarga con diálogo nativo "Guardar como" (plugins Tauri `dialog` y `fs`).
- **Interfaz React/Tauri**: selección de archivo, progreso (subida → procesado), lista de resultados y errores legibles para personas no técnicas.
- **Privacidad**: el servicio escucha sólo en `127.0.0.1`; los originales nunca se modifican; no se requiere cuenta, internet ni base de datos.
- **Empaquetado**: Tauri inicia el backend como sidecar de escritorio; también se puede ejecutar el backend por separado en desarrollo.
- **Pruebas**: 5 pruebas del backend en `audio-platform/backend/tests/`.

## Notas para auditoría

- Se eliminó el código heredado de PostgreSQL (carpetas `app/domain/`, `app/infrastructure/`, `app/config.py`, `alembic/`, `alembic.ini` e `init_db.sql`). El flujo actual no necesita bases de datos.
- El modelo de red neuronal `models/std.rnnn` se incluye en el proyecto y en el empaquetado; el procesamiento sigue siendo 100% local.
- Se añadió `-threads 1` al comando FFmpeg porque el filtro `arnndn` de la versión Gyan de FFmpeg falla con varios hilos.
- Dependencia externa: FFmpeg debe estar instalado en el equipo. El propio código busca la ruta de FFmpeg e informa un error comprensible si falta.
- `download/` es la carpeta prevista para los archivos de salida; los resultados temporales del servicio viven en `audio-platform/backend/data/outputs/`.