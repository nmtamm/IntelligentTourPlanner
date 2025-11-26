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

Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    # Relationship
    trips = relationship("Trip", back_populates="user", cascade="all, delete-orphan")


class Trip(Base):
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


class Day(Base):
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


class Destination(Base):
    __tablename__ = "destinations"
    id = Column(Integer, primary_key=True, index=True)
    day_id = Column(Integer, ForeignKey("days.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    address = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    order = Column(Integer, default=0)  # Order in the route

    # Relationships
    day = relationship("Day", back_populates="destinations")
    costs = relationship(
        "Cost", back_populates="destination", cascade="all, delete-orphan"
    )


class Cost(Base):
    __tablename__ = "costs"
    id = Column(Integer, primary_key=True, index=True)
    destination_id = Column(
        Integer, ForeignKey("destinations.id", ondelete="CASCADE"), nullable=False
    )
    amount = Column(Float, default=0.0)
    detail = Column(String, nullable=True)
    originalAmount = Column(Float, default=0.0)
    originalCurrency = Column(String, default="USD")

    # Relationship
    destination = relationship("Destination", back_populates="costs")
