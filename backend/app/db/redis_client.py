import redis
import json
from app.core.config import settings

redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)


def cache_set(key: str, value: dict, ttl: int = 300):
    try:
        redis_client.setex(key, ttl, json.dumps(value))
    except Exception:
        pass


def cache_get(key: str):
    try:
        data = redis_client.get(key)
        return json.loads(data) if data else None
    except Exception:
        return None


def cache_delete(key: str):
    try:
        redis_client.delete(key)
    except Exception:
        pass
