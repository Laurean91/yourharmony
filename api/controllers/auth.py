from fastapi import HTTPException, status

from ..schemas.auth import LoginRequest, RefreshRequest, TokenResponse
from ..services.auth import AuthService


async def login(data: LoginRequest) -> TokenResponse:
    if not AuthService.authenticate(data.username, data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return TokenResponse(
        access_token=AuthService.create_access_token(),
        refresh_token=AuthService.create_refresh_token(),
    )


async def refresh(data: RefreshRequest) -> TokenResponse:
    AuthService.verify_refresh_token(data.refresh_token)
    return TokenResponse(
        access_token=AuthService.create_access_token(),
        refresh_token=AuthService.create_refresh_token(),
    )
