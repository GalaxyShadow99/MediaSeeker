from fastapi import APIRouter, Depends

from app.dependencies import get_current_user
from app.schemas.apiResponse import ApiResponse

router = APIRouter(tags=["System"], dependencies=[Depends(get_current_user)])


@router.get("/", response_model=ApiResponse)
def root():
    return ApiResponse(
        message="The backend API is running !",
        data={"status": "running"},
    )


@router.get("/health", response_model=ApiResponse)
def health():
    return ApiResponse(
        message="The backend API is healthy !",
        data={"status": "ok"},
    )
