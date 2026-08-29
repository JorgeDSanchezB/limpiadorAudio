# Arquitectura

La aplicación se ejecuta íntegramente en el ordenador del usuario:

1. La ventana de escritorio (React + Tauri) permite elegir el audio y ver el avance.
2. En el empaquetado, Tauri inicia un servicio local de Python (sidecar). En desarrollo, `scripts/start-local.ps1` lo arranca por separado.
3. El servicio guarda una copia temporal del audio, la procesa con FFmpeg (RNNoise `arnndn` para quitar ruido de fondo, filtros de banda de voz, limitador y normalización de volumen) y crea un MP3.
4. La copia resultante se escucha y se descarga; el original nunca se modifica.

No se requiere cuenta, internet ni una base de datos para el flujo principal. El servidor sólo escucha en `127.0.0.1`, por lo que no queda expuesto a otros equipos de la red.

## Estructura del backend

- `app/main.py`: crea la aplicación FastAPI y sólo escucha en `127.0.0.1:8000`.
- `app/sidecar.py`: punto de entrada para empaquetar el servidor con PyInstaller.
- `app/api/routes.py`: validación de formatos, guardado temporal, limpieza con FFmpeg y descarga. Contiene toda la lógica del flujo principal.

## Principios

- Procesamiento local y privado.
- Operaciones explícitas y recuperables.
- Errores legibles: formatos no soportados, dependencia faltante o falta de espacio.
- El resultado se identifica claramente como una copia procesada.