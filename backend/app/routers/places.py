from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from sqlalchemy import Column, Integer, String, Float, JSON, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

DATABASE_URL = "sqlite:///app/merged.db"  # Change to your actual database URL

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
router = APIRouter()


class Place(Base):
    __tablename__ = "places"
    id = Column(Integer, primary_key=True, autoincrement=True)
    position = Column(Integer)
    title = Column(String)
    place_id = Column(String, unique=True, index=True)
    data_id = Column(String)
    data_cid = Column(String)
    reviews_link = Column(String)
    photos_link = Column(String)
    gps_coordinates = Column(JSON)
    place_id_search = Column(String)
    provider_id = Column(String)
    rating = Column(Float)
    reviews = Column(Integer)
    price = Column(String)
    type = Column(String)
    types = Column(JSON)
    type_id = Column(String)
    type_ids = Column(JSON)
    address = Column(String)
    open_state = Column(String)
    hours = Column(String)
    operating_hours = Column(JSON)
    phone = Column(String)
    website = Column(String)
    amenities = Column(JSON)
    description = Column(String)
    service_options = Column(JSON)
    thumbnail = Column(String)
    extensions = Column(JSON)
    unsupported_extensions = Column(JSON)
    serpapi_thumbnail = Column(String)
    user_review = Column(String)
    place_detail = Column(JSON)


Base.metadata.create_all(bind=engine)


class GPSCoordinates(BaseModel):
    latitude: Optional[float]
    longitude: Optional[float]


class PlaceIn(BaseModel):
    position: Optional[int] = None
    title: Optional[str] = None
    place_id: str
    data_id: Optional[str] = None
    data_cid: Optional[str] = None
    reviews_link: Optional[str] = None
    photos_link: Optional[str] = None
    gps_coordinates: Optional[Dict[str, float]] = None
    place_id_search: Optional[str] = None
    provider_id: Optional[str] = None
    rating: Optional[float] = None
    reviews: Optional[int] = None
    price: Optional[str] = None
    type: Optional[str] = None
    types: Optional[List[str]] = None
    type_id: Optional[str] = None
    type_ids: Optional[List[str]] = None
    address: Optional[str] = None
    open_state: Optional[str] = None
    hours: Optional[str] = None
    operating_hours: Optional[Dict[str, str]] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    amenities: Optional[List[str]] = None
    description: Optional[str] = None
    service_options: Optional[Dict[str, Any]] = None
    thumbnail: Optional[str] = None
    extensions: Optional[List[Dict[str, Any]]] = None
    unsupported_extensions: Optional[List[Dict[str, Any]]] = None
    serpapi_thumbnail: Optional[str] = None
    user_review: Optional[str] = None
    place_detail: Optional[Dict[str, Any]] = None

    class Config:
        extra = "allow"


class PlacesPayload(BaseModel):
    places: List[PlaceIn]


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/api/places/save")
async def save_places(payload: PlacesPayload, db: Session = Depends(get_db)):
    try:
        columns = {c.name for c in Place.__table__.columns}
        for place in payload.places:
            exists = db.query(Place).filter_by(place_id=place.place_id).first()
            if exists:
                continue  # Skip if already exists
            place_data = {k: v for k, v in place.dict().items() if k in columns}
            db.add(Place(**place_data))
        db.commit()
        return {"status": "success", "count": len(payload.places)}
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}


@router.get("/api/places/search")
async def search_places(
    type: str = Query(..., description="Type of place to search"),
    latitude: float = Query(..., description="Latitude of the city"),
    longitude: float = Query(..., description="Longitude of the city"),
    db: Session = Depends(get_db),
):
    try:
        # Get integer part of latitude for city matching
        lat_int = int(latitude)
        # Query places by type and latitude integer match
        results = (
            db.query(Place)
            .filter(
                Place.type == type,
                Place.gps_coordinates["latitude"].as_float().cast(Integer) == lat_int,
            )
            .all()
        )
        # Convert results to JSON serializable format
        places_json = [
            {col.name: getattr(place, col.name) for col in Place.__table__.columns}
            for place in results
        ]
        return {"status": "success", "count": len(places_json), "places": places_json}
    except Exception as e:
        return {"status": "error", "message": str(e)}
