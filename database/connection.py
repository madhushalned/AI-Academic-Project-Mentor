import os
from pathlib import Path

import certifi
from dotenv import load_dotenv
from pymongo import MongoClient


# ============================================================
# LOAD THE EXISTING BACKEND ENVIRONMENT
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ENV_PATH = PROJECT_ROOT / "backend" / ".env"

load_dotenv(dotenv_path=ENV_PATH)


# ============================================================
# DATABASE CONFIGURATION
# ============================================================

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")


if not MONGO_URI:
    raise RuntimeError(
        "MONGO_URI is missing from backend/.env"
    )

if not DATABASE_NAME:
    raise RuntimeError(
        "DATABASE_NAME is missing from backend/.env"
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