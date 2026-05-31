# ReportAI

ReportAI is a production-oriented full-stack scaffold for an AI-powered academic report generation platform. It lets students upload university report samples and guidelines, learn a report template, answer adaptive project questions, generate academic content, compile LaTeX to PDF, and export an Overleaf-ready project.

## Stack

- Frontend: Next.js 15, TypeScript, Tailwind CSS, shadcn-style components, React Query-ready API layer
- Backend: FastAPI, SQLAlchemy 2, Alembic, PostgreSQL
- Database/Auth/Storage: Firebase Authentication, Firestore, Firebase Storage
- AI: OpenAI-compatible service layer with prompt boundaries for report content, citations, diagrams, and LaTeX repair
- Documents: PyMuPDF, pdfplumber, python-docx, Pandoc/PyLaTeX-ready service boundaries
- Storage: S3-compatible object storage
- PDF: latexmk/pdflatex/xelatex compatible compiler service

## Folder Structure

```text
reportai/
  backend/
    alembic/
    app/
      api/v1/routes/
      core/
      db/
      models/
      schemas/
      services/
      main.py
    tests/
  frontend/
    src/app/
    src/components/
    src/lib/
  docs/
  docker-compose.yml
  .env.example
```

## Local Development

### One-command Windows runner

From the project root:

```powershell
.\run-reportai.bat
```

Then open http://127.0.0.1:3000.

If PowerShell scripts are allowed on your machine, this also works:

```powershell
.\run-reportai.ps1
```

The runner installs frontend dependencies when missing and starts the Next.js development server.

## Firebase Setup

Create a Firebase project and enable:

- Authentication: Email/password provider
- Firestore Database
- Firebase Storage

Copy `frontend/.env.example` to `frontend/.env.local` and fill:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Security rules are included:

- `frontend/firestore.rules`
- `frontend/storage.rules`

## Hosting

Frontend on Vercel:

```bash
cd frontend
vercel --prod
```

Backend on Render:

- Use `render.yaml` from the repository root, or create a Python web service with root directory `backend`.
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Set `FRONTEND_URL` to your Vercel URL and configure the required API/storage secrets.

### Full stack with Docker

1. Copy `.env.example` to `.env` and set secrets.
2. Start infrastructure and apps:

```bash
docker compose up --build
```

3. Open:

- Frontend: http://localhost:3000
- API docs: http://localhost:8000/docs
- MinIO console: http://localhost:9001

## Backend Commands

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -e ".[dev]"
alembic upgrade head
uvicorn app.main:app --reload
```

## Frontend Commands

```bash
cd frontend
npm install
npm run dev
```

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the system design, bounded contexts, data model, and processing pipeline.

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for Docker, environment, object storage, database migrations, and production rollout guidance.
