from datetime import date
from enum import StrEnum

from pydantic import BaseModel, Field


class MediaType(StrEnum):
    MOVIE = "movie"
    TV = "tv"


class MediaStatus(StrEnum):
    UPCOMING = "upcoming"
    RELEASED = "released"
    AVAILABLE = "available"


class MediaCreate(BaseModel):
    tmdb_id: int = Field(gt=0, description="TMDB unique identifier")
    media_type: MediaType = MediaType.MOVIE


class MediaUpdate(BaseModel):
    title: str | None = None
    overview: str | None = None
    poster_path: str | None = None
    status: MediaStatus | None = None
    season_number: int | None = None
    episode_number: int | None = None
    next_air_date: date | None = None
