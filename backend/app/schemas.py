# schemas.py
from pydantic import BaseModel
from typing import List, Optional
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
    amount: float = 0.0
    detail: Optional[str] = None
    originalAmount: float = 0.0
    originalCurrency: str = "USD"

class CostCreate(CostBase):
    pass

class CostResponse(CostBase):
    id: int

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
    costs: List[CostCreate] = []

class DestinationResponse(DestinationBase):
    id: int
    costs: List[CostResponse] = []

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