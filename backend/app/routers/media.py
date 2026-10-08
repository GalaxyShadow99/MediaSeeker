import sqlite3
from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, status

from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.apiResponse import ApiResponse
from app.schemas.media import MediaCreate, MediaStatus, MediaType, MediaUpdate

router = APIRouter(prefix="/media", tags=["Medias"], dependencies=[Depends(get_current_user)])


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
    try:
        cursor = db.execute(
            """
            INSERT INTO medias (
                tmdb_id, media_type, title, original_title, poster_path,
                overview, release_date, season_number, episode_number, next_air_date, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload.tmdb_id,
                payload.media_type.value,
                payload.title,
                payload.original_title,
                payload.poster_path,
                payload.overview,
                str(payload.release_date) if payload.release_date else None,
                payload.season_number,
                payload.episode_number,
                str(payload.next_air_date) if payload.next_air_date else None,
                payload.status.value,
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
