import asyncpg
from fastapi import FastAPI
from app.config import settings


class Database:
    def __init__(self):
        self._pool = None

    async def connect(self):
        self._pool = await asyncpg.create_pool(
            dsn=settings.database_url, min_size=2, max_size=10
        )
        print("DB pool connected")

    async def disconnect(self):
        if self._pool:
            await self._pool.close()

    async def fetch(self, q, *a):
        async with self._pool.acquire() as c:
            return await c.fetch(q, *a)

    async def fetchrow(self, q, *a):
        async with self._pool.acquire() as c:
            return await c.fetchrow(q, *a)

    async def execute(self, q, *a):
        async with self._pool.acquire() as c:
            return await c.execute(q, *a)


_db = None


def get_db():
    if not _db:
        raise RuntimeError("DB not initialized")
    return _db


async def lifespan(app: FastAPI):
    global _db
    _db = Database()
    await _db.connect()
    yield
    await _db.disconnect()
