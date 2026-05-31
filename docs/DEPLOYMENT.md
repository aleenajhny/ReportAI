# Deployment Guide

## Production Checklist

- Set a strong `JWT_SECRET_KEY`.
- Use managed PostgreSQL with automated backups.
- Use S3, R2, MinIO, or another S3-compatible bucket for uploads and generated artifacts.
- Install TeX Live with `latexmk`, `pdflatex`, and `xelatex` in the backend image or a separate compiler worker.
- Run `alembic upgrade head` during deployment.
- Configure CORS to the production frontend origin.
- Add rate limiting for authentication, file upload, AI generation, and PDF compilation endpoints.
- Run long jobs in a worker queue before launch.

## Docker

```bash
cp .env.example .env
docker compose up --build
```

## Backend

The backend exposes OpenAPI docs at `/docs`. In production, deploy behind TLS and restrict docs if required by university or enterprise policy.

Useful commands:

```bash
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Frontend

Build with:

```bash
npm run build
npm run start
```

Set:

```bash
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api/v1
```

## Workers

For high-volume usage, create worker processes for:

- Document extraction
- Template learning
- AI section generation
- Citation search
- LaTeX compilation
- AI LaTeX error repair
- Quality analysis

Each worker should update report/project status fields so the frontend can show live progress.
