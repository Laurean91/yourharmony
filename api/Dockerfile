FROM python:3.12-slim

WORKDIR /code

# Установка pip зависимостей
COPY pyproject.toml ./
RUN pip install --no-cache-dir \
    "fastapi==0.115.*" \
    "uvicorn[standard]==0.32.*" \
    "sqlalchemy[asyncio]==2.0.*" \
    "asyncpg==0.30.*" \
    "pydantic==2.*" \
    "pydantic-settings==2.*" \
    "python-jose[cryptography]==3.3.*" \
    "passlib[bcrypt]==1.7.*" \
    "python-multipart==0.0.*"

COPY . ./api/

EXPOSE 8000
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
