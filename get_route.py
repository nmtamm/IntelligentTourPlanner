import requests

def get_driving_route(api_key, start_coords, end_coords):
  
    endpoint = "https://api.openrouteservice.org/v2/directions/driving-car"
    
    headers = {
        'Authorization': api_key,
        'Content-Type': 'application/json'
    }
  
    try:
        start_point = [float(coord) for coord in start_coords.split(',')]
        end_point = [float(coord) for coord in end_coords.split(',')]
    except ValueError:
        print("Error: Coordinates must be in 'longitude,latitude' format.")
        return None

    body = {
        'locations': [start_point, end_point]
    }

    try:
        response = requests.post(endpoint, json=body, headers=headers)
        response.raise_for_status()
        
        data = response.json()
    
        summary = data['routes'][0]['summary']
        distance_meters = summary['distance']
        duration_seconds = summary['duration']
        
        route_info = {
            'distance_km': round(distance_meters / 1000, 2),
            'duration_minutes': round(duration_seconds / 60, 2)
        }
        
        return route_info
        
    except requests.exceptions.RequestException as error:
        print(f"API Request Error: {error}")
        if response.text:
            print(f"Error Details: {response.text}")
        return None

if __name__ == "__main__":
    ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImI1OWQ3YjFkMDY5YTRiMWE4Zjk0ZmE0ZjE4ZWJkZjBjIiwiaCI6Im11cm11cjY0In0="
    origin = "106.6954,10.7769"
    destination = "106.6980,10.7725"
    
    print(f"Calculating route from {origin} to {destination}...")
    result = get_driving_route(ORS_API_KEY, origin, destination)
    
    if result:
        print("Route Calculation Successful:")
        print(result)
    else:
        print("Failed to calculate route.")