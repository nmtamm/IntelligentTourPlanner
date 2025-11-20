import requests

def fetch_restaurants_in_bbox(bounding_box):
    overpass_url = "http://overpass-api.de/api/interpreter"

    query = f"""
    [out:json];
    (
      node["amenity"="restaurant"]({bounding_box[0]},{bounding_box[1]},{bounding_box[2]},{bounding_box[3]});
      way["amenity"="restaurant"]({bounding_box[0]},{bounding_box[1]},{bounding_box[2]},{bounding_box[3]});
      relation["amenity"="restaurant"]({bounding_box[0]},{bounding_box[1]},{bounding_box[2]},{bounding_box[3]});
    );
    out center;
    """
    
    try:
        response = requests.post(overpass_url, data={'data': query})
        response.raise_for_status()
        
        data = response.json()
        places = []
        
        for element in data['elements']:
            if 'tags' in element and 'name' in element['tags']:
                lat = element.get('lat')
                lon = element.get('lon')
                
                if lat is None or lon is None:
                    center = element.get('center', {})
                    lat = center.get('lat')
                    lon = center.get('lon')
                
                if lat and lon:
                    places.append({
                        'name': element['tags']['name'],
                        'latitude': lat,
                        'longitude': lon,
                        'type': element['type']
                    })
                    
        return places

    except requests.exceptions.RequestException as error:
        print(f"Overpass API Error: {error}")
        return []

# --- MAIN EXECUTION (FOR TESTING) ---
if __name__ == "__main__":
    # Bounding box for an area around Ben Thanh Market, Ho Chi Minh City
    # Format: [South, West, North, East]
    test_bbox = [10.771, 106.695, 10.775, 106.700]
    
    print("Fetching restaurants from OpenStreetMap...")
    results = fetch_restaurants_in_bbox(test_bbox)
    
    if results:
        print(f"Found {len(results)} restaurants. Showing first 5:")
        for place in results[:5]:
            print(f"- {place['name']} (Lat: {place['latitude']}, Lon: {place['longitude']})")
    else:
        print("No restaurants found or an error occurred.")