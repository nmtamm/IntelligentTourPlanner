from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker
from .place_models import PlaceBase

DATABASE_URL = "sqlite:///app/merged.db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
metadata = MetaData()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


PlaceBase.metadata.create_all(bind=engine)
