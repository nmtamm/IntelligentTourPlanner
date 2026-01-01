# models.py
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    JSON,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

PlaceBase = declarative_base()


class Place(PlaceBase):
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
    city_name = Column(String)
    POI_score = Column(Float)
    en_names = Column(JSON)
    vi_names = Column(JSON)
    local_path = Column(String)
    place_detail_vi = Column(JSON)
    place_detail_en = Column(JSON)
    best_type_id = Column(String)
    best_type_id_en = Column(String)
    best_type_id_vi = Column(String)


class CityType(PlaceBase):
    __tablename__ = "city_types"
    id = Column(Integer, primary_key=True, autoincrement=True)
    city_name = Column(String, index=True)
    type_name = Column(String, index=True)
    __table_args__ = (UniqueConstraint("city_name", "type_name", name="_city_type_uc"),)
