from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class TMDBFindResponse(BaseModel):
    """Result from GET /3/find/{external_id}"""

    movie_results: list[dict] = Field(default_factory=list)
    tv_results: list[dict] = Field(default_factory=list)

    model_config = ConfigDict(extra="ignore")


class TMDBMovieDetails(BaseModel):
    """Result from GET /3/movie/{movie_id}"""

    id: int
    title: str
    original_title: str | None = None
    overview: str | None = None
    poster_path: str | None = None
    release_date: date | str | None = None
    status: str | None = None
    vote_average: float = 0.0

    model_config = ConfigDict(extra="ignore")


class TMDBTVDetails(BaseModel):
    """Result from GET /3/tv/{series_id}"""

    id: int
    name: str
    original_name: str | None = None
    overview: str | None = None
    poster_path: str | None = None
    first_air_date: date | str | None = None
    number_of_seasons: int = 0
    number_of_episodes: int = 0
    next_episode_to_air: dict | None = None
    status: str | None = None
    vote_average: float = 0.0

    model_config = ConfigDict(extra="ignore")
