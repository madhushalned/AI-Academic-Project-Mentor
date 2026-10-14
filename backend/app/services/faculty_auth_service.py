import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from dotenv import load_dotenv
from fastapi import HTTPException, status
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.database import faculty_collection

load_dotenv()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def register_faculty(
    name: str,
    email: str,
    password: str,
    department: str = "Computer Science"
) -> dict:
    """Register a new faculty member account in the faculty collection."""
    clean_email = email.strip().lower()
    clean_name = name.strip()

    if not clean_email or "@" not in clean_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid email address is required.",
        )
    if not clean_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Faculty name is required.",
        )
    if not password or len(password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters.",
        )

    existing = faculty_collection.find_one({"email": clean_email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A faculty account with this email already exists.",
        )

    hashed_pw = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    faculty_doc = {
        "name": clean_name,
        "email": clean_email,
        "password": hashed_pw,
        "department": department.strip() if department else "Computer Science",
        "role": "faculty",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    insert_result = faculty_collection.insert_one(faculty_doc)
    faculty_id = str(insert_result.inserted_id)

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    token = jwt.encode(
        {
            "sub": faculty_id,
            "email": clean_email,
            "role": "faculty",
            "iat": now,
            "exp": expires_at,
        },
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM,
    ) if (JWT_SECRET_KEY and len(JWT_SECRET_KEY.strip()) >= 32) else ""

    return {
        "message": "Faculty account created successfully",
        "access_token": token,
        "token_type": "bearer",
        "faculty": {
            "id": faculty_id,
            "email": clean_email,
            "name": clean_name,
            "department": faculty_doc["department"],
            "role": "faculty",
        },
    }


def authenticate_faculty(email: str, password: str) -> dict:
    """Verify faculty credentials against the faculty collection."""

    if not JWT_SECRET_KEY or len(JWT_SECRET_KEY.strip()) < 32:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication is not configured correctly.",
        )

    faculty = faculty_collection.find_one({
        "email": email.strip().lower()
    })

    if not faculty:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    stored_password = faculty.get("password")

    if not stored_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    try:
        password_valid = bcrypt.checkpw(
            password.encode("utf-8"),
            stored_password.encode("utf-8"),
        )
    except (ValueError, TypeError):
        password_valid = False

    if not password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if faculty.get("role") != "faculty":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is not authorized as faculty.",
        )

    faculty_id = str(faculty.get("_id"))

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    token = jwt.encode(
        {
            "sub": faculty_id,
            "email": faculty["email"],
            "role": "faculty",
            "iat": now,
            "exp": expires_at,
        },
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM,
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "faculty": {
            "id": faculty_id,
            "email": faculty["email"],
            "name": faculty.get("name", ""),
            "role": "faculty",
        },
    }

security = HTTPBearer(auto_error=False)


def get_current_faculty(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Validate the JWT and allow only authenticated faculty users."""

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Faculty authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not JWT_SECRET_KEY or len(JWT_SECRET_KEY.strip()) < 32:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication is not configured correctly.",
        )

    try:
        payload = jwt.decode(
            credentials.credentials,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Faculty session expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid faculty authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if payload.get("role") != "faculty" or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Faculty access required.",
        )

    return {
        "id": payload["sub"],
        "email": payload.get("email", ""),
        "role": "faculty",
    }
