# router/geocode_router.py
from fastapi import APIRouter, Query, HTTPException
from ..services.geocode_service import geocode_location

router = APIRouter(prefix="/api/geocode", tags=["Geocode"])


@router.get("/")
def get_geocode(q: str = Query(..., description="Search location")):
    result = geocode_location(q)
    if not result:
        raise HTTPException(status_code=404, detail="Location not found")
    return result
