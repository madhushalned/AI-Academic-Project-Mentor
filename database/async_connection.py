import os
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

async_client = AsyncIOMotorClient(
    os.getenv("MONGO_URI"),
    tlsCAFile=certifi.where(),
    maxPoolSize=20,
    minPoolSize=5,
    serverSelectionTimeoutMS=5000
)
async_db = async_client[os.getenv("DB_NAME")]

def get_async_db():
    return async_db