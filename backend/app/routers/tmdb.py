import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.config import settings
from app.dependencies import get_admin_user
from app.schemas.apiResponse import ApiResponse

router = APIRouter(prefix="/tmdb", tags=["TMDB"], dependencies=[Depends(get_admin_user)])

TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_HEADERS = {
    "accept": "application/json",
    "Authorization": f"Bearer {settings.TMDB_API_KEY}",
}


def fetch_tmdb_details(tmdb_id: int, media_type: str = "movie") -> dict:
    """Fetch movie or TV series details from TMDB."""
    url = f"{TMDB_BASE_URL}/{media_type}/{tmdb_id}"
    response = httpx.get(
        url,
        headers=TMDB_HEADERS,
        params={"language": "fr-FR"},
        timeout=10.0,
    )
    response.raise_for_status()
    return response.json()


def search_tmdb(name: str) -> list[dict]:
    """Search TMDB for movies and TV shows only (excluding persons)."""
    url = f"{TMDB_BASE_URL}/search/multi"
    response = httpx.get(
        url,
        headers=TMDB_HEADERS,
        params={"query": name, "language": "fr-FR"},
        timeout=10.0,
    )
    response.raise_for_status()
    results = response.json().get("results", [])
    return [item for item in results if item.get("media_type") in ("movie", "tv")]


@router.get("/get-details/{tmdb_id}", response_model=ApiResponse)
def get_tmdb_details(
    tmdb_id: int,
    media_type: str = Query(default="movie", pattern="^(movie|tv)$"),
):
    """Fetch media details from TMDB."""
    try:
        data = fetch_tmdb_details(tmdb_id, media_type=media_type)
        return ApiResponse(
            success=True,
            message="TMDB details fetched successfully",
            data=data,
        )
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"TMDB API error: {e.response.text}",
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        ) from e


@router.get("/search/{name}", response_model=ApiResponse)
def search_on_tmdb(name: str):
    """Search movies and TV shows on TMDB."""
    try:
        data = search_tmdb(name)
        return ApiResponse(
            success=True,
            message="TMDB search results fetched successfully",
            data=data,
        )
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"TMDB API error: {e.response.text}",
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        ) from e
