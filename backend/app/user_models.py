# models.py
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Float,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import enum

UserBase = declarative_base()


class PlaceType(enum.Enum):
    STAY = "stay"
    EAT = "eat"
    TRAVEL = "travel"


class User(UserBase):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    # Relationship
    trips = relationship("Trip", back_populates="user", cascade="all, delete-orphan")


class Trip(UserBase):
    __tablename__ = "trips"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    members = Column(Integer, nullable=True)
    start_date = Column(String, nullable=True)  # ISO format string
    end_date = Column(String, nullable=True)  # ISO format string
    currency = Column(String, default="USD")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="trips")
    days = relationship(
        "Day",
        back_populates="trip",
        cascade="all, delete-orphan",
        order_by="Day.day_number",
    )


class Day(UserBase):
    __tablename__ = "days"
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(
        Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False
    )
    day_number = Column(Integer, nullable=False)

    # Relationships
    trip = relationship("Trip", back_populates="days")
    destinations = relationship(
        "Destination",
        back_populates="day",
        cascade="all, delete-orphan",
        order_by="Destination.order",
    )


class Destination(UserBase):
    __tablename__ = "destinations"
    id = Column(Integer, primary_key=True, index=True)
    day_id = Column(Integer, ForeignKey("days.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    address = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    order = Column(Integer, default=0)  # Order in the route

    # Foursquare integration
    fsq_place_id = Column(
        String, ForeignKey("foursquare_places.fsq_place_id"), nullable=True
    )
    destination_type = Column(String, nullable=True)  # 'stay', 'eat', 'travel', 'other'

    # Relationships
    day = relationship("Day", back_populates="destinations")
    costs = relationship(
        "Cost", back_populates="destination", cascade="all, delete-orphan"
    )
    foursquare_place = relationship("FoursquarePlace", back_populates="destinations")


class Cost(UserBase):
    __tablename__ = "costs"
    id = Column(Integer, primary_key=True, index=True)
    destination_id = Column(
        Integer, ForeignKey("destinations.id", ondelete="CASCADE"), nullable=False
    )
    amount = Column(String, default="0")
    detail = Column(String, nullable=True)
    originalAmount = Column(String, default="0")
    originalCurrency = Column(String, default="USD")

    # Relationship
    destination = relationship("Destination", back_populates="costs")


class FoursquarePlace(UserBase):
    __tablename__ = "foursquare_places"

    # Primary identifier from Foursquare
    fsq_place_id = Column(String, primary_key=True, index=True)

    # Place type classification
    place_type = Column(String, nullable=False, index=True)  # 'stay', 'eat', 'travel'

    # Basic information
    name = Column(String, nullable=False)
    address = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Rating and pricing
    rating = Column(Float, nullable=True)  # 0-10 scale
    price_level = Column(Integer, nullable=True)  # 1-4 scale

    # Contact and hours
    phone = Column(String, nullable=True)
    website = Column(String, nullable=True)
    hours = Column(Text, nullable=True)  # JSON string

    # media and metadata
    categories = Column(Text, nullable=True)  # JSON string - array of category objects
    photos = Column(Text, nullable=True)  # JSON string - array of photo objects
    description = Column(Text, nullable=True)

    # Cache management
    cached_at = Column(DateTime, default=datetime.utcnow)

    # Relationship - destinations can reference this place
    destinations = relationship("Destination", back_populates="foursquare_place")
