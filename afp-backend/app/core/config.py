"""Environment-based configuration for the AFP backend."""

from functools import lru_cache
from pathlib import Path

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import URL


BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Validated settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    afp_db_host: str = Field(default="127.0.0.1", min_length=1)
    afp_db_port: int = Field(default=5432, ge=1, le=65535)

    afp_db_name: str = Field(min_length=1)
    afp_db_user: str = Field(min_length=1)
    afp_db_password: SecretStr = Field(min_length=1)

    @property
    def database_url(self) -> URL:
        """Build the PostgreSQL/Psycopg URL safely."""

        return URL.create(
            drivername="postgresql+psycopg",
            username=self.afp_db_user,
            password=self.afp_db_password.get_secret_value(),
            host=self.afp_db_host,
            port=self.afp_db_port,
            database=self.afp_db_name,
        )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached settings instance."""

    return Settings()