from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:3001"]
    min_investment: float = 5000
    max_strategies: int = 2
    history_max_entries: int = 5
    cache_ttl_seconds: int = 60

settings = Settings()
