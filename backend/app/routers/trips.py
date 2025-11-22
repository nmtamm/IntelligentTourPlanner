from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth.auth_handler import get_current_active_user
from ..database import get_db
from ..schemas import TripCreate, TripUpdate, TripResponse
from ..models import User, Trip, Day, Destination, Cost

router = APIRouter(prefix="/api/trips", tags=["Trips"])


@router.post("/", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def create_trip(
    trip: TripCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new trip with days, destinations, and costs"""
    db_trip = Trip(
        name=trip.name,
        user_id=current_user.id,
        members=trip.members,
        start_date=trip.start_date,
        end_date=trip.end_date,
        currency=trip.currency
    )
    db.add(db_trip)
    db.flush()  # Get the trip ID

    # Add days
    for day_data in trip.days:
        db_day = Day(
            trip_id=db_trip.id,
            day_number=day_data.day_number
        )
        db.add(db_day)
        db.flush()

        # Add destinations
        for dest_data in day_data.destinations:
            db_destination = Destination(
                day_id=db_day.id,
                name=dest_data.name,
                address=dest_data.address,
                latitude=dest_data.latitude,
                longitude=dest_data.longitude,
                order=dest_data.order
            )
            db.add(db_destination)
            db.flush()

            # Add costs
            for cost_data in dest_data.costs:
                db_cost = Cost(
                    destination_id=db_destination.id,
                    amount=cost_data.amount,
                    detail=cost_data.detail
                )
                db.add(db_cost)

    db.commit()
    db.refresh(db_trip)
    return db_trip


@router.get("/", response_model=List[TripResponse])
def get_trips(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all trips for the current user"""
    trips = db.query(Trip).filter(Trip.user_id == current_user.id).all()
    return trips


@router.get("/{trip_id}", response_model=TripResponse)
def get_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific trip by ID"""
    trip = db.query(Trip).filter(
        Trip.id == trip_id,
        Trip.user_id == current_user.id
    ).first()

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    return trip


@router.put("/{trip_id}", response_model=TripResponse)
def update_trip(
    trip_id: int,
    trip_update: TripUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a trip"""
    db_trip = db.query(Trip).filter(
        Trip.id == trip_id,
        Trip.user_id == current_user.id
    ).first()

    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Update basic trip info
    if trip_update.name is not None:
        db_trip.name = trip_update.name
    if trip_update.members is not None:
        db_trip.members = trip_update.members
    if trip_update.start_date is not None:
        db_trip.start_date = trip_update.start_date
    if trip_update.end_date is not None:
        db_trip.end_date = trip_update.end_date
    if trip_update.currency is not None:
        db_trip.currency = trip_update.currency

    # If days are provided, replace all days
    if trip_update.days is not None:
        # Delete existing days (cascade will delete destinations and costs)
        db.query(Day).filter(Day.trip_id == trip_id).delete()

        # Add new days
        for day_data in trip_update.days:
            db_day = Day(
                trip_id=db_trip.id,
                day_number=day_data.day_number
            )
            db.add(db_day)
            db.flush()

            # Add destinations
            for dest_data in day_data.destinations:
                db_destination = Destination(
                    day_id=db_day.id,
                    name=dest_data.name,
                    address=dest_data.address,
                    latitude=dest_data.latitude,
                    longitude=dest_data.longitude,
                    order=dest_data.order
                )
                db.add(db_destination)
                db.flush()

                # Add costs
                for cost_data in dest_data.costs:
                    db_cost = Cost(
                        destination_id=db_destination.id,
                        amount=cost_data.amount,
                        detail=cost_data.detail
                    )
                    db.add(db_cost)

    db.commit()
    db.refresh(db_trip)
    return db_trip


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a trip"""
    db_trip = db.query(Trip).filter(
        Trip.id == trip_id,
        Trip.user_id == current_user.id
    ).first()

    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    db.delete(db_trip)
    db.commit()
    return None
