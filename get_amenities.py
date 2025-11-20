import requests

def fetch_nearby_places(api_key, latitude, longitude, category, limit=10):
    base_url = "https://api.geoapify.com/v2/places"
    radius_meters = 5000
    
    params = {
        "categories": category,
        "filter": f"circle:{longitude},{latitude},{radius_meters}",
        "limit": limit,
        "apiKey": api_key
    }

    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        
        data = response.json()
        places = []
        
        for feature in data.get("features", []):
            properties = feature.get("properties", {})
            place_info = {
                "name": properties.get("name", "Unknown Name"),
                "address": properties.get("formatted", "No Address"),
                "category": category,
                "latitude": properties.get("lat"),
                "longitude": properties.get("lon"),
                "distance_meters": properties.get("distance")
            }
            if place_info["name"] != "Unknown Name":
                places.append(place_info)
                
        return places

    except requests.exceptions.RequestException as error:
        print(f"Geoapify API Error: {error}")
        return []

# --- MAIN EXECUTION (FOR TESTING) ---
if __name__ == "__main__":
    GEOAPIFY_KEY = "48b28d752b074c429564fd5ccaf030c7"
    
    # Coordinates for Ho Chi Minh City Center (Nguyen Hue Walking Street)
    lat = 10.7744
    lon = 106.7030
    
    print("--- FETCHING ACCOMMODATION (Hotels) ---")
    hotels = fetch_nearby_places(GEOAPIFY_KEY, lat, lon, "accommodation", 3)
    for h in hotels:
        print(f"- {h['name']} ({h['address']})")
        
    print("\n--- FETCHING FOOD (Restaurants) ---")
    restaurants = fetch_nearby_places(GEOAPIFY_KEY, lat, lon, "catering", 3)
    for r in restaurants:
        print(f"- {r['name']} ({r['address']})")

    print("\n--- FETCHING ENTERTAINMENT ---")
    fun_spots = fetch_nearby_places(GEOAPIFY_KEY, lat, lon, "entertainment", 3)
    for f in fun_spots:
        print(f"- {f['name']} ({f['address']})")