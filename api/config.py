from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="../.env",
        extra="ignore",
    )

    FASTAPI_DATABASE_URL: str = ""  # postgresql+asyncpg://... — set in .env
    DATABASE_URL: str = ""          # fallback: existing Prisma URL (psycopg2 scheme)

    ADMIN_USER: str
    ADMIN_PASSWORD: str

    FASTAPI_SECRET_KEY: str = "change-me-in-production-use-openssl-rand-hex-32"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"

    @property
    def async_database_url(self) -> str:
        """Return asyncpg-compatible URL."""
        if self.FASTAPI_DATABASE_URL:
            return self.FASTAPI_DATABASE_URL
        # Auto-convert postgresql:// → postgresql+asyncpg://
        url = self.DATABASE_URL
        if url.startswith("postgresql://") or url.startswith("postgres://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        return url


settings = Settings()
