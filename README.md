# Incubation Management System

Production-oriented full-stack system for managing incubator teams, prototypes, and admin broadcast communication.

## Stack

- Backend: FastAPI + SQLAlchemy + PostgreSQL
- Frontend: React + TypeScript + Tailwind CSS (Vite)
- Auth: JWT
- Password hashing: bcrypt (via Passlib)
- Email: SMTP (Gmail-compatible)

## Project Structure

```text
backend/
  app/
    auth/
    models/
    routes/
    schemas/
    services/
    utils/
    database.py
    main.py
  requirements.txt
  .env.example

frontend/
  src/
    api/
    components/
    context/
    hooks/
    pages/
    types/
  package.json
  .env.example

docker-compose.yml
```

## Backend Setup

1. Start PostgreSQL (Docker):
   ```bash
   docker compose up -d db
   ```
2. Create and activate virtual environment:
   ```bash
   cd backend
   python -m venv .venv
   # Windows PowerShell
   .\.venv\Scripts\Activate.ps1
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create env file:
   ```bash
   copy .env.example .env
   ```
5. Update `backend/.env` values:
   - `DATABASE_URL`
   - `JWT_SECRET_KEY`
   - SMTP fields (`EMAIL_ENABLED=true` when ready)
   - If local PostgreSQL already uses 5432 on your machine, keep Docker on 5433 and use:
     `postgresql+psycopg2://postgres:postgres@127.0.0.1:5433/incubation_db`
6. Run API:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

API docs: http://localhost:8000/docs

## Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Configure env:
   ```bash
   copy .env.example .env
   ```
3. Run dev server:
   ```bash
   npm run dev
   ```

Frontend URL: http://localhost:5173

## Seed Dummy Data For Manual Testing

1. Run seed script:
   ```bash
   cd backend
   python seed_dummy_data.py
   ```
2. Demo users generated/updated by script:
   - Admin: `admin.demo@example.com` / `Admin@12345`
   - Prototyper: `prototyper.demo@example.com` / `Proto@12345`
   - Business: `business.demo@example.com` / `Business@12345`

The seed script is idempotent, so you can run it multiple times safely.

## Seed Dummy Data For Existing Gmail Users

If you already created real users with `@gmail.com`, you can attach test prototypes to those users:

```bash
cd backend
python seed_gmail_user_dummy_data.py
```

This script is idempotent and only adds missing records.

## Core API Endpoints

- `POST /api/register`
- `POST /api/login`
- `GET /api/me`
- `POST /api/prototypes` (Prototyper only)
- `GET /api/prototypes` (All authenticated users)
- `GET /api/prototypes/{id}`
- `DELETE /api/prototypes/{id}` (Owner or Admin)
- `POST /api/send-meeting-email` (Admin only)

## Gmail SMTP Notes

- Use Gmail App Password (2FA enabled account) instead of normal password.
- Set:
  - `SMTP_HOST=smtp.gmail.com`
  - `SMTP_PORT=587`
  - `SMTP_USE_TLS=true`
   - `SMTP_USERNAME=<your gmail address>`
   - `SMTP_PASSWORD=<gmail app password>`
   - `SMTP_FROM_EMAIL=<your gmail address>`
   - `EMAIL_ENABLED=true`

When SMTP credentials are missing, `POST /api/send-meeting-email` now returns `400` instead of pretending success.

## Production Notes

- Replace `JWT_SECRET_KEY` with a strong secret.
- Run behind reverse proxy (Nginx/Traefik) with HTTPS.
- Use Alembic migrations for schema lifecycle.
- Move background dispatch from FastAPI `BackgroundTasks` to Celery/RQ as traffic grows.
