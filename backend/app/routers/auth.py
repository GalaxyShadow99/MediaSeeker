import sqlite3

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.database import get_db
from app.limiter import limiter
from app.schemas.apiResponse import ApiResponse
from app.schemas.auth import LoginRequest
from app.utils.security import create_access_token, verify_password

router = APIRouter(tags=["Auth"])


@router.post("/login", response_model=ApiResponse)
@limiter.limit("5/minute")
def login(request: Request, payload: LoginRequest, db: sqlite3.Connection = Depends(get_db)):
    """Authenticate user with email and password and return a JWT access token."""
    user = db.execute(
        "SELECT id, username, email, password_hash, is_admin FROM users WHERE email = ?",
        (payload.email,),
    ).fetchone()

    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(
        data={"userId": user["id"], "email": user["email"], "is_admin": bool(user["is_admin"])}
    )

    return ApiResponse(
        success=True,
        message="User logged in successfully",
        data={
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "username": user["username"],
                "email": user["email"],
                "is_admin": bool(user["is_admin"]),
            },
        },
    )
