
import jwt

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import decode_access_token
from app.models.user import User


# Bearer authentication
bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise credentials_exception

    try:
        token = credentials.credentials

        payload = decode_access_token(token)

        if not isinstance(payload, dict):
            raise credentials_exception

        user_id = payload.get("sub")

        if not isinstance(user_id, str) or not user_id.isdigit():
            raise credentials_exception

        user = db.query(User).filter(
            User.id == int(user_id)
        ).first()

        if user is None or not user.is_active:
            raise credentials_exception

        return user

    except (jwt.InvalidTokenError, ValueError, TypeError):
        raise credentials_exception
