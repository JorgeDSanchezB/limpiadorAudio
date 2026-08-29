# Pruebas

Las pruebas automatizadas del backend están en `audio-platform/backend/tests/` (`test_routes.py`).

## Ejecutar

```powershell
cd audio-platform/backend
.\.venv\Scripts\python.exe -m unittest discover -s tests -p "test_*.py"
```

Quedan pendientes pruebas de comunicación entre la interfaz y el servicio.