from fastapi import APIRouter, Query
from ..services.serp_service import search_google_maps
import os

router = APIRouter(prefix="/api/serp/locations", tags=["serp"])


@router.get("/")
def get_local_results(
    query: str = Query(..., description="Search query"),
    ll: str = Query(
        ...,
        description="Latitude,Longitude,Zoom (e.g., '@40.7455096,-74.0083012,15.1z')",
    ),
):
    try:
        api_key = os.getenv("SERP_API_KEY")
        results = search_google_maps(query, ll, api_key)
        return {"local_results": results}
    except Exception as e:
        return {"error": str(e)}
