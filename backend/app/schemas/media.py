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
    media_type: MediaType
    title: str = Field(min_length=1)
    original_title: str | None = None
    poster_path: str | None = None
    overview: str | None = None
    release_date: date | None = None
    season_number: int | None = None
    episode_number: int | None = None
    next_air_date: date | None = None
    status: MediaStatus = MediaStatus.UPCOMING


class MediaUpdate(BaseModel):
    tmdb_id: int | None = Field(default=None, gt=0)
    media_type: MediaType | None = None
    title: str | None = None
    original_title: str | None = None
    poster_path: str | None = None
    overview: str | None = None
    release_date: date | None = None
    season_number: int | None = None
    episode_number: int | None = None
    next_air_date: date | None = None
    status: MediaStatus | None = None
