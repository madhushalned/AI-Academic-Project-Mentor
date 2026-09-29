from models import GeneratedDocument, ProgressUpdate
from documents import save_document_metadata, get_documents_for_student
from progress import log_progress_update, get_open_blockers, resolve_blocker

# Test document metadata
save_document_metadata(GeneratedDocument(
    student_id="23CSE4444",
    document_type="synopsis",
    content="A short project synopsis text goes here."
))
docs = get_documents_for_student("23CSE4444")
print(f"Documents stored: {len(docs)}")

# Test progress/blocker tracking
log_progress_update(ProgressUpdate(
    student_id="23CSE4444",
    week_number=3,
    update_type="blocker",
    description="API rate limit blocking testing."
))

open_blockers = get_open_blockers("23CSE4444")
print(f"Open blockers: {len(open_blockers)} (expected 1)")

resolve_blocker("23CSE4444", 3, "API rate limit blocking testing.")
open_blockers_after = get_open_blockers("23CSE4444")
print(f"Open blockers after resolving: {len(open_blockers_after)} (expected 0)")