from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from ..database import get_db
from ..schemas import FoursquarePlaceCreate, FoursquarePlaceResponse
from ..models import FoursquarePlace
from ..services.foursquare_service import search_places, get_place_details

router = APIRouter(prefix="/api/foursquare", tags=["Foursquare"])

# Category mapping for place types
PLACE_TYPE_CATEGORIES = {
    'stay': ['4bf58dd8d48988d1fa931735', '4bf58dd8d48988d1fb931735'],  # Hotel, Hostel
    'eat': ['4bf58dd8d48988d1c4941735', '4bf58dd8d48988d16d941735'],  # Restaurant, Café
    'travel': ['4bf58dd8d48988d1df941735', '4bf58dd8d48988d181941735', '4bf58dd8d48988d12d941735']  # Attraction, Museum, Landmark
}


def determine_place_type(categories: list) -> str:
    """Determine place type from Foursquare categories"""
    if not categories:
        return 'travel'  # Default

    category_ids = [cat.get('fsq_category_id') for cat in categories]

    # Check each type
    for place_type, type_categories in PLACE_TYPE_CATEGORIES.items():
        if any(cat_id in type_categories for cat_id in category_ids):
            return place_type

    return 'travel'  # Default


def save_place_to_db(place_data: dict, place_type: str, db: Session) -> FoursquarePlace:
    """Save or update a Foursquare place in the database"""
    fsq_place_id = place_data.get('fsq_place_id')

    # Check if place already exists
    existing_place = db.query(FoursquarePlace).filter(
        FoursquarePlace.fsq_place_id == fsq_place_id
    ).first()

    # Extract location data
    location = place_data.get('location', {})
    address = location.get('formatted_address') or location.get('address')

    # Prepare place data
    place_dict = {
        'fsq_place_id': fsq_place_id,
        'place_type': place_type,
        'name': place_data.get('name'),
        'address': address,
        'latitude': place_data.get('latitude'),
        'longitude': place_data.get('longitude'),
        'rating': place_data.get('rating'),
        'price_level': place_data.get('price'),
        'phone': place_data.get('tel'),
        'website': place_data.get('website'),
        'description': place_data.get('description'),
        'hours': json.dumps(place_data.get('hours')) if place_data.get('hours') else None,
        'categories': json.dumps(place_data.get('categories')) if place_data.get('categories') else None,
        'photos': json.dumps(place_data.get('photos')) if place_data.get('photos') else None,
    }

    if existing_place:
        # Update existing place
        for key, value in place_dict.items():
            if key != 'fsq_place_id':  # Don't update PK
                setattr(existing_place, key, value)
        db.commit()
        db.refresh(existing_place)
        return existing_place
    else:
        # Create new place
        new_place = FoursquarePlace(**place_dict)
        db.add(new_place)
        db.commit()
        db.refresh(new_place)
        return new_place


@router.post("/search", response_model=List[FoursquarePlaceResponse])
def search_and_save_places(
    place_type: str = Query(..., description="Place type: stay, eat, or travel"),
    ll: Optional[str] = Query(None, description="Latitude,Longitude (e.g., '10.7769,106.7009')"),
    near: Optional[str] = Query(None, description="Location name (e.g., 'Ho Chi Minh City')"),
    query: Optional[str] = Query(None, description="Search query (e.g., 'hotel', 'restaurant')"),
    limit: int = Query(10, description="Number of results"),
    db: Session = Depends(get_db)
):
    """
    Search Foursquare places by type and location, automatically save to database

    Place types:
    - stay: Hotels, hostels, accommodations
    - eat: Restaurants, cafés, food places
    - travel: Tourist attractions, museums, landmarks
    """
    # Validate place type
    if place_type not in ['stay', 'eat', 'travel']:
        raise HTTPException(status_code=400, detail="Invalid place_type. Must be 'stay', 'eat', or 'travel'")

    # Search Foursquare
    search_result = search_places(
        ll=ll,
        near=near,
        query=query,
        limit=limit
    )

    if not search_result.get('success'):
        raise HTTPException(
            status_code=500,
            detail=f"Foursquare search failed: {search_result.get('error')}"
        )

    results = search_result['data'].get('results', [])
    saved_places = []

    # Save each place to database
    for place_data in results:
        # Determine actual type from categories
        actual_type = determine_place_type(place_data.get('categories', []))

        # Use the requested type if categories don't match
        final_type = actual_type if actual_type else place_type

        saved_place = save_place_to_db(place_data, final_type, db)
        saved_places.append(saved_place)

    return saved_places


@router.get("/places", response_model=List[FoursquarePlaceResponse])
def get_places(
    place_type: Optional[str] = Query(None, description="Filter by place type"),
    lat: Optional[float] = Query(None, description="Latitude for proximity search"),
    lon: Optional[float] = Query(None, description="Longitude for proximity search"),
    radius_km: Optional[float] = Query(None, description="Search radius in kilometers"),
    min_rating: Optional[float] = Query(None, description="Minimum rating"),
    max_price: Optional[int] = Query(None, description="Maximum price level (1-4)"),
    limit: int = Query(50, description="Maximum results"),
    db: Session = Depends(get_db)
):
    """
    Query cached Foursquare places from database

    Supports filtering by:
    - Place type (stay/eat/travel)
    - Location proximity (lat, lon, radius_km)
    - Rating and price level
    """
    query = db.query(FoursquarePlace)

    # Filter by place type
    if place_type:
        query = query.filter(FoursquarePlace.place_type == place_type)

    # Filter by rating
    if min_rating:
        query = query.filter(FoursquarePlace.rating >= min_rating)

    # Filter by price
    if max_price:
        query = query.filter(FoursquarePlace.price_level <= max_price)

    # Apply limit
    query = query.limit(limit)

    places = query.all()

    # If location provided, filter by distance (simple bounding box for now)
    if lat and lon and radius_km:
        # Simple bounding box filter (approximate)
        # 1 degree lat/lon ≈ 111 km
        delta = radius_km / 111.0
        filtered_places = [
            p for p in places
            if p.latitude and p.longitude
            and abs(p.latitude - lat) <= delta
            and abs(p.longitude - lon) <= delta
        ]
        return filtered_places

    return places


@router.get("/places/{fsq_place_id}", response_model=FoursquarePlaceResponse)
def get_place_by_id(
    fsq_place_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific Foursquare place from database by ID"""
    place = db.query(FoursquarePlace).filter(
        FoursquarePlace.fsq_place_id == fsq_place_id
    ).first()

    if not place:
        raise HTTPException(status_code=404, detail="Place not found in database")

    return place


@router.delete("/places/{fsq_place_id}")
def delete_place(
    fsq_place_id: str,
    db: Session = Depends(get_db)
):
    """Remove a Foursquare place from the cache"""
    place = db.query(FoursquarePlace).filter(
        FoursquarePlace.fsq_place_id == fsq_place_id
    ).first()

    if not place:
        raise HTTPException(status_code=404, detail="Place not found")

    db.delete(place)
    db.commit()

    return {"message": "Place deleted successfully"}
