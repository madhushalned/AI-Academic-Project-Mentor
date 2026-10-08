# Database Layer

MongoDB Atlas database for the AI-Guided Academic Project Mentor platform.
Owner: Suraj Agrawal

## Setup

1. Copy `.env` values into `backend/.env`:

MONGO_URI=<your connection string>
DATABASE_NAME=project_planner

2. Install dependencies: `pip install pymongo motor python-dotenv pydantic certifi`
3. Run `python3 database/setup_collections.py` once to create collections, validation, and indexes.

## Collections

| Collection | Purpose | Key Fields |
|---|---|---|
| `students` | Student identity and skill snapshot | `student_id` (unique), `skills` |
| `skill_assessments` | Historical skill survey results | `student_id`, `normalized_vector` |
| `blueprints` | Core AI-generated project plan — one per student | `student_id`, 5 agent sections, `progress_percentage` |
| `blueprint_history` | Archived snapshots before every blueprint update | `student_id`, `version` |
| `check_ins` | Weekly mentor conversation log | `student_id`, `week_number`, `status` |
| `generated_documents` | Metadata for synopsis/report files | `student_id`, `document_type` |
| `progress_updates` | Structured blockers and progress entries | `student_id`, `update_type`, `resolved` |

## Code layout

- `connection.py` / `async_connection.py` — sync and async MongoDB clients
- `models.py` — Pydantic schemas for every collection
- `setup_collections.py` — creates collections, applies validation and indexes
- `students.py`, `blueprints.py`, `checkins.py`, `documents.py`, `progress.py`, `versioning.py`, `dashboard.py` — CRUD and query functions per collection
- `async_students.py`, `async_blueprints.py` — async versions for FastAPI routes
- `backup/export_data.py` — manual backup script, exports all collections to timestamped JSON

## For backend integration

FastAPI routes should import from the **async** modules only (`async_students.py`, `async_blueprints.py`) — the sync versions are for scripts and tests, and will block an async server if used inside a route handler.

## Running tests

Each `test_*.py` file is a standalone script, run from inside `database/`:
```bash
cd database
python3 test_full_flow.py
```

## Backing up data

```bash
cd database/backup
python3 export_data.py
```
Creates a timestamped folder under `database/backup/snapshots/` with one JSON file per collection. This folder is git-ignored — back up externally if needed long-term.
