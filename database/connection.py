import os
from pathlib import Path

import certifi
from dotenv import load_dotenv
from pymongo import MongoClient


# ============================================================
# LOAD THE EXISTING BACKEND ENVIRONMENT
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Try backend/.env first (team convention), fall back to root .env
BACKEND_ENV = PROJECT_ROOT / "backend" / ".env"
ROOT_ENV = PROJECT_ROOT / ".env"

if BACKEND_ENV.exists():
    load_dotenv(dotenv_path=BACKEND_ENV)
else:
    load_dotenv(dotenv_path=ROOT_ENV)


# ============================================================
# DATABASE CONFIGURATION
# ============================================================

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME") or os.getenv("DB_NAME")


if not MONGO_URI:
    raise RuntimeError(
        "MONGO_URI is missing — add it to backend/.env or the project root .env"
    )

if not DATABASE_NAME:
    raise RuntimeError(
        "DATABASE_NAME (or DB_NAME) is missing — add it to backend/.env or the project root .env"
    )


# ============================================================
# MONGODB CONNECTION
# ============================================================

client = MongoClient(
    MONGO_URI,
    tlsCAFile=certifi.where()
)

db = client[DATABASE_NAME]


# ============================================================
# DATABASE ACCESS
# ============================================================

def get_db():
    return db