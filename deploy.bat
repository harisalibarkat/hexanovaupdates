@echo off
setlocal enabledelayedexpansion

echo ============================================
echo   HexaNovaUpdates - Windows Deploy Script
echo ============================================
echo.

REM Check Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Start Docker Desktop first.
    pause
    exit /b 1
)
echo [OK] Docker is running

REM Check .env.local exists
if not exist ".env.local" (
    echo [ERROR] .env.local not found. Copy .env.example and configure it.
    pause
    exit /b 1
)
echo [OK] .env.local found

REM Pull latest images
echo.
echo [1/5] Pulling Docker base images...
docker pull postgres:16-alpine
docker pull redis:7-alpine
docker pull node:22-alpine

REM Build and start services
echo.
echo [2/5] Building application...
docker compose build --no-cache

REM Start infrastructure (DB + Redis) first
echo.
echo [3/5] Starting PostgreSQL and Redis...
docker compose up -d postgres redis

REM Wait for DB to be ready
echo Waiting for database to be ready...
timeout /t 8 /nobreak >nul

REM Run migrations (use worker image — it has full source, unlike standalone app image)
echo.
echo [4/5] Running database migrations...
docker compose run --rm worker sh -c "npx drizzle-kit push --config=drizzle.config.ts"
if errorlevel 1 (
    echo [WARN] Migration failed or already up to date - continuing
)

REM Seed database (only first time)
echo Seeding database (safe to re-run)...
docker compose run --rm worker sh -c "npx tsx scripts/seed.ts"

REM Start all services
echo.
echo [5/5] Starting all services...
docker compose up -d

echo.
echo ============================================
echo   Deploy complete!
echo ============================================
echo.
echo   App:    http://localhost:3000
echo   Admin:  http://localhost:3000/admin
echo   Login:  (use ADMIN_EMAIL / ADMIN_PASSWORD from your .env.local)
echo.
echo   Logs:   docker compose logs -f
echo   Stop:   docker compose down
echo.
pause
