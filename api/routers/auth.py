from fastapi import APIRouter

from ..controllers.auth import login, refresh
from ..schemas.auth import LoginRequest, RefreshRequest, TokenResponse

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

router.post("/login", response_model=TokenResponse)(login)
router.post("/refresh", response_model=TokenResponse)(refresh)
