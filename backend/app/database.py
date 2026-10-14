import os
import certifi

from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

try:
    client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
except Exception:
    client = MongoClient(MONGO_URI)

db = client[DATABASE_NAME]

students_collection = db["students"]
skill_assessments_collection = db["skill_assessments"]
faculty_collection = db["faculty"]
projects_collection = db["projects"]