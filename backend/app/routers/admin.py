import sqlite3

from fastapi import APIRouter, Depends, HTTPException, status

from app.database import get_db
from app.dependencies import get_admin_user
from app.schemas.apiResponse import ApiResponse
from app.schemas.user import UserCreate
from app.utils.security import hash_password

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(get_admin_user)])


@router.post("/create-user", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, db: sqlite3.Connection = Depends(get_db)):
    existing = db.execute(
        "SELECT id FROM users WHERE email = ? OR username = ?", (payload.email, payload.username)
    ).fetchone()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email or username already exists",
        )

    hashed = hash_password(payload.password)
    cursor = db.execute(
        "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
        (payload.username, payload.email, hashed),
    )
    db.commit()

    new_user = db.execute(
        "SELECT id, username, email, is_admin, created_at FROM users WHERE id = ?",
        (cursor.lastrowid,),
    ).fetchone()

    return ApiResponse(
        message="User registered successfully",
        data=dict(new_user),
    )


@router.get("/users", response_model=ApiResponse)
def get_users(db: sqlite3.Connection = Depends(get_db)):
    rows = db.execute(
        "SELECT id, username, email, is_admin, created_at FROM users ORDER BY created_at DESC"
    ).fetchall()

    return ApiResponse(
        message="Users retrieved successfully",
        data=[dict(row) for row in rows],
    )
