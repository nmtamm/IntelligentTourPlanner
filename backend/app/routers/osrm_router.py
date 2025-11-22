from fastapi import APIRouter, Body
from ..services.geocode_service import route_osrm

router = APIRouter(prefix="/api/route", tags=["Route"])


@router.post("/optimize")
def get_route(destinations: list = Body(...)):
    # destinations: [{"lat": ..., "lon": ...}, ...]
    try:
        points = [
            {
                "lat": d["lat"],
                "lon": d["lon"],
                "name": d.get("name", ""),
            }
            for d in destinations
        ]
        result = route_osrm(points)
        return result
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }
