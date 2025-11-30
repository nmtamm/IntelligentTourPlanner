# schemas.py
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserResponse(BaseModel):
    username: str
    email: str | None = None


class UserInDB(UserResponse):
    hashed_password: str


# Cost schemas
class CostBase(BaseModel):
    amount: str
    detail: Optional[str] = None
    originalAmount: str
    originalCurrency: str = "USD"


class CostCreate(CostBase):
    pass


class CostResponse(CostBase):
    id: int

    class Config:
        from_attributes = True


# FoursquarePlace schemas
class FoursquarePlaceBase(BaseModel):
    fsq_place_id: str
    place_type: str  # 'stay', 'eat', 'travel'
    name: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    rating: Optional[float] = None
    price_level: Optional[int] = None
    phone: Optional[str] = None
    website: Optional[str] = None


class FoursquarePlaceCreate(FoursquarePlaceBase):
    hours: Optional[str] = None  # JSON string
    categories: Optional[str] = None  # JSON string
    photos: Optional[str] = None  # JSON string
    description: Optional[str] = None


class FoursquarePlaceResponse(FoursquarePlaceBase):
    hours: Optional[Any] = None  # Will be parsed JSON
    categories: Optional[Any] = None  # Will be parsed JSON
    photos: Optional[Any] = None  # Will be parsed JSON
    description: Optional[str] = None
    cached_at: datetime

    class Config:
        from_attributes = True


# Destination schemas
class DestinationBase(BaseModel):
    name: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    order: int = 0


class DestinationCreate(DestinationBase):
    fsq_place_id: Optional[str] = None
    destination_type: Optional[str] = None  # 'stay', 'eat', 'travel', 'other'
    costs: List[CostCreate] = []


class DestinationResponse(DestinationBase):
    id: int
    fsq_place_id: Optional[str] = None
    destination_type: Optional[str] = None
    costs: List[CostResponse] = []
    foursquare_place: Optional[FoursquarePlaceResponse] = None

    class Config:
        from_attributes = True


# Day schemas
class DayBase(BaseModel):
    day_number: int


class DayCreate(DayBase):
    destinations: List[DestinationCreate] = []


class DayResponse(DayBase):
    id: int
    destinations: List[DestinationResponse] = []

    class Config:
        from_attributes = True


# Trip schemas
class TripBase(BaseModel):
    name: str
    members: Optional[int] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    currency: str = "USD"


class TripCreate(TripBase):
    days: List[DayCreate] = []


class TripUpdate(BaseModel):
    name: Optional[str] = None
    members: Optional[int] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    currency: Optional[str] = None
    days: Optional[List[DayCreate]] = None


class TripResponse(TripBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    days: List[DayResponse] = []

    class Config:
        from_attributes = True
