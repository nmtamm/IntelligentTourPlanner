# database.py
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker
from .user_models import UserBase

DATABASE_URL = "sqlite:///app/user.db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
metadata = MetaData()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


UserBase.metadata.create_all(bind=engine)
