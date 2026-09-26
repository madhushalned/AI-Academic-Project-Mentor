from connection import get_db
from models import GeneratedDocument

db = get_db()

def save_document_metadata(document: GeneratedDocument):
    return db.generated_documents.insert_one(document.model_dump()).inserted_id

def get_documents_for_student(student_id: str):
    cursor = db.generated_documents.find(
        {"student_id": student_id}
    ).sort("generated_at", -1)
    return list(cursor)

def get_document_by_type(student_id: str, document_type: str):
    return db.generated_documents.find_one(
        {"student_id": student_id, "document_type": document_type},
        sort=[("generated_at", -1)]
    )