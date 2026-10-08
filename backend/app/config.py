from pathlib import Path

from pydantic import AliasChoices, Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DB_NAME: str = ""
    EXEC_ENV: str = ""
    WORKER_URL: str = ""
    PORT: int = Field(default=0, validation_alias=AliasChoices("PORT", "BACKEND_PORT"))
    ADMIN_USERNAME: str = ""
    ADMIN_PASSWORD: str = ""
    ADMIN_MAIL: str = ""
    JWT_SECRET: str = ""
    JWT_ALGORITHM: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 0
    TMDB_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=(
            Path(__file__).resolve().parent.parent / ".env",
            Path(__file__).resolve().parent.parent.parent / ".env",
        ),
        extra="ignore",
    )

    @model_validator(mode="after")
    def validate_non_empty(self) -> "Settings":
        """Crash the application if any setting remains empty ('') or zero (0)."""
        invalid_fields = []
        for field_name in self.__class__.model_fields:
            value = getattr(self, field_name)
            if value == "" or value == 0 or value is None:
                invalid_fields.append(field_name)

        if invalid_fields:
            error_msg = (
                f"FATAL: Application configuration failure! "
                f"The following environment variable(s) must not be empty or 0: "
                f"{', '.join(invalid_fields)}. Please check your .env configuration."
            )
            raise RuntimeError(error_msg)
        return self

    @property
    def data_dir(self) -> Path:
        path = Path(__file__).resolve().parent.parent / "data"
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def db_path(self) -> Path:
        return self.data_dir / self.DB_NAME


settings = Settings()
