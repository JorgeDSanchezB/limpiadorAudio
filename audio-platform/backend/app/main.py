from fastapi import FastAPI
from app.infrastructure.database import lifespan
from app.api.routes import router
import uvicorn

app = FastAPI(title="Audio Processing API", version="1.0.0", lifespan=lifespan)
app.include_router(router)


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
