from datetime import timedelta

from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends, HTTPException, status, APIRouter
from sqlalchemy.orm import Session
from fastapi import Body
from ..user_schemas import UserUpdate
from ..auth.auth_handler import get_current_user

from ..auth.auth_handler import (
    authenticate_user,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    get_user,
    get_password_hash,
)
from ..user_database import get_db
from ..user_schemas import Token, UserCreate, UserResponse
from ..user_models import User

router = APIRouter()


@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user(db, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered.")
    print(f"Debug password: {user.password}")
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        avatar=user.avatar,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/token")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
) -> Token:
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")


from fastapi import Body
from ..user_schemas import UserUpdate


@router.put("/update-profile", response_model=UserResponse)
def update_profile(
    updates: UserUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = get_user(db, current_user.username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if updates.avatar is not None:
        user.avatar = updates.avatar
    if updates.password is not None:
        user.hashed_password = get_password_hash(updates.password)
    # Add other fields as needed

    db.commit()
    db.refresh(user)
    return user


from pydantic import BaseModel


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str


@router.put("/change-password")
def change_password(
    data: PasswordChangeRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = get_user(db, current_user.username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Verify current password
    from ..auth.auth_handler import verify_password, get_password_hash

    if not verify_password(data.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    # Update password
    user.hashed_password = get_password_hash(data.new_password)
    db.commit()
    return {"detail": "Password updated successfully"}
