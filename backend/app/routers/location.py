from fastapi import APIRouter, Request

router = APIRouter(prefix="/api/location", tags=["Location"])


@router.post("/")
async def receive_location(request: Request):
    try:
        data = await request.json()
        latitude = data.get("latitude")
        longitude = data.get("longitude")
        if latitude is None or longitude is None:
            return {"error": "Latitude and Longitude are required."}
        # Here you can process/store the location data as needed
        return {
            "message": "Location received",
            "latitude": latitude,
            "longitude": longitude,
        }
    except Exception as e:
        return {"error": str(e)}
