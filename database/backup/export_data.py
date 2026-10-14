import os
import json
from datetime import datetime, timezone
from bson import json_util
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))
from connection import get_db

db = get_db()

BACKUP_DIR = Path(__file__).resolve().parent / "snapshots"
BACKUP_DIR.mkdir(exist_ok=True)

COLLECTIONS = [
    "students", "skill_assessments", "blueprints",
    "blueprint_history", "check_ins", "generated_documents", "progress_updates"
]

def export_all():
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    run_folder = BACKUP_DIR / timestamp
    run_folder.mkdir()

    for name in COLLECTIONS:
        documents = list(db[name].find())
        file_path = run_folder / f"{name}.json"
        with open(file_path, "w") as f:
            json.dump(documents, f, default=json_util.default, indent=2)
        print(f"Exported {len(documents)} documents from '{name}'")

    print(f"\nBackup complete: {run_folder}")

if __name__ == "__main__":
    export_all()
