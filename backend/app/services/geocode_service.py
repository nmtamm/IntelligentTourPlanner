import requests

NOMINATIM_URL = "https://nominatim.openstreetmap.org"
HEADERS = {"User-Agent": "SmartTravel/1.0 (contact: nhimbaodoi@example.com)"}


def geocode_location(query: str):
    """Call OpenStreetMap's Nominatim API to get lat/lon for a location."""
    response = requests.get(
        f"{NOMINATIM_URL}/search",
        params={"q": query, "format": "jsonv2", "limit": 1},
        headers=HEADERS,
        timeout=10,
    )
    response.raise_for_status()
    data = response.json()
    if not data:
        return None
    item = data[0]
    return {
        "lat": float(item["lat"]),
        "lon": float(item["lon"]),
        "display_name": item["display_name"],
    }
