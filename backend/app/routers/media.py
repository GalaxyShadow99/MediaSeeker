import sqlite3
from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, status

from app.database import get_db
from app.dependencies import get_current_user
from app.routers.tmdb import fetch_tmdb_details
from app.schemas.apiResponse import ApiResponse
from app.schemas.media import MediaCreate, MediaStatus, MediaType, MediaUpdate

router = APIRouter(prefix="/media", tags=["Medias"], dependencies=[Depends(get_current_user)])


def determine_media_status(tmdb_status: str | None, release_date_str: str | None) -> MediaStatus:
    """Determine whether the media is released or upcoming based on TMDB metadata."""
    today_str = date.today().isoformat()
    if release_date_str and str(release_date_str) <= today_str:
        return MediaStatus.RELEASED
    if tmdb_status and str(tmdb_status).lower() in ("released", "ended", "returning series"):
        return MediaStatus.RELEASED
    return MediaStatus.UPCOMING


@router.get("", response_model=ApiResponse)
def get_medias(
    type: MediaType | None = None,
    status: MediaStatus | None = None,
    db: sqlite3.Connection = Depends(get_db),
):
    query = "SELECT * FROM medias WHERE 1=1"
    params = []

    if type:
        query += " AND media_type = ?"
        params.append(type.value)
    if status:
        query += " AND status = ?"
        params.append(status.value)

    query += " ORDER BY created_at DESC"
    rows = db.execute(query, params).fetchall()
    return ApiResponse(
        message="Medias retrieved successfully",
        data=[dict(row) for row in rows],
    )


@router.get("/{media_id}", response_model=ApiResponse)
def get_media_by_id(media_id: int, db: sqlite3.Connection = Depends(get_db)):
    row = db.execute("SELECT * FROM medias WHERE id = ?", (media_id,)).fetchone()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media not found",
        )
    return ApiResponse(
        message="Media retrieved successfully",
        data=dict(row),
    )


@router.post("", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
def create_media(payload: MediaCreate, db: sqlite3.Connection = Depends(get_db)):
    """Fetch details from TMDB and insert the media into the database with computed status."""
    try:
        details = fetch_tmdb_details(payload.tmdb_id, media_type=payload.media_type.value)
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch media details from TMDB: {err}",
        ) from err

    # Extract fields from TMDB dictionary
    title = details.get("title") or details.get("name") or "Unknown"
    original_title = details.get("original_title") or details.get("original_name")
    poster_path = details.get("poster_path")
    overview = details.get("overview")
    release_date = details.get("release_date") or details.get("first_air_date")

    # Compute status dynamically based on release date & TMDB status
    tmdb_status = details.get("status")
    calculated_status = determine_media_status(
        tmdb_status, str(release_date) if release_date else None
    )

    try:
        cursor = db.execute(
            """
            INSERT INTO medias (
                tmdb_id, media_type, title, original_title, poster_path,
                overview, release_date, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload.tmdb_id,
                payload.media_type.value,
                title,
                original_title,
                poster_path,
                overview,
                str(release_date) if release_date else None,
                calculated_status.value,
            ),
        )
        db.commit()

        new_row = db.execute("SELECT * FROM medias WHERE id = ?", (cursor.lastrowid,)).fetchone()
        return ApiResponse(
            message="Media created successfully",
            data=dict(new_row),
        )
    except sqlite3.IntegrityError as err:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Media with this tmdb_id already exists",
        ) from err


@router.put("/{media_id}", response_model=ApiResponse)
def update_media(media_id: int, payload: MediaUpdate, db: sqlite3.Connection = Depends(get_db)):
    existing = db.execute("SELECT id FROM medias WHERE id = ?", (media_id,)).fetchone()
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media not found",
        )

    update_data = payload.model_dump(exclude_unset=True)
    if update_data:
        for key, val in update_data.items():
            if hasattr(val, "value"):
                update_data[key] = val.value
            elif isinstance(val, (date, datetime)):
                update_data[key] = str(val)

        set_clause = ", ".join(f"{key} = ?" for key in update_data)
        values = [*list(update_data.values()), media_id]

        try:
            db.execute(f"UPDATE medias SET {set_clause} WHERE id = ?", values)
            db.commit()
        except sqlite3.IntegrityError as err:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Media with this tmdb_id already exists",
            ) from err

    updated = db.execute("SELECT * FROM medias WHERE id = ?", (media_id,)).fetchone()
    return ApiResponse(
        message="Media updated successfully",
        data=dict(updated),
    )


@router.delete("/{media_id}", response_model=ApiResponse)
def delete_media(media_id: int, db: sqlite3.Connection = Depends(get_db)):
    existing = db.execute("SELECT id FROM medias WHERE id = ?", (media_id,)).fetchone()
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media not found",
        )
    db.execute("DELETE FROM medias WHERE id = ?", (media_id,))
    db.commit()
    return ApiResponse(
        message="Media deleted successfully",
        data=None,
    )
