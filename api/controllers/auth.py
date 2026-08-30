from fastapi import HTTPException, status

from ..schemas.auth import LoginRequest, RefreshRequest, TokenResponse
from ..services.auth import AuthService


async def login(data: LoginRequest) -> TokenResponse:
    subject = AuthService.authenticate(data.username, data.password)
    if subject is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return TokenResponse(
        access_token=AuthService.create_access_token(subject),
        refresh_token=AuthService.create_refresh_token(subject),
    )


async def refresh(data: RefreshRequest) -> TokenResponse:
    payload = AuthService.verify_refresh_token(data.refresh_token)
    subject = payload.get("sub", "admin")
    return TokenResponse(
        access_token=AuthService.create_access_token(subject),
        refresh_token=AuthService.create_refresh_token(subject),
    )
