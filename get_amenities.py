import pandas as pd
import requests
import json
import time

def get_coordinates_from_geoapify(place_name, api_key):

    base_url = "https://api.geoapify.com/v1/geocode/search"
    
    params = {
        "text": place_name,
        "apiKey": api_key,
        "filter": "countrycode:vn",
        "limit": 1
    }

    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        data = response.json()
        
        if data["features"]:
            props = data["features"][0]["properties"]
            return {
                "latitude": props.get("lat"),
                "longitude": props.get("lon"),
                "formatted_address": props.get("formatted"),
                "found": True
            }
        else:
            print(f"Warning: Geoapify could not find '{place_name}'")
            return {"found": False}

    except Exception as e:
        print(f"Error fetching '{place_name}': {e}")
        return {"found": False}

def process_excel_and_fetch_data(excel_file, api_key):
    print(f"1. Reading Excel file: {excel_file}")
    try:
        df = pd.read_excel(excel_file, dtype={'Open_Time': str, 'Close_Time': str})
    except FileNotFoundError:
        print("Error: Excel file not found.")
        return

    final_database = []
    
    print("2. Fetching coordinates from API")
    
    for index, row in df.iterrows():
        name = row['Name']
        print(f"Processing [{index + 1}/{len(df)}]: {name}...")
        
        # Call API
        geo_data = get_coordinates_from_geoapify(name, api_key)
        
        if geo_data["found"]:
            place_entry = {
                "id": index + 1,
                "name": name,
                "category": row['Category'],
                "rating": row['Rating'],
                "price_level": row['Price'],
                "open_time": row['Open_Time'],
                "close_time": row['Close_Time'],

                "latitude": geo_data["latitude"],
                "longitude": geo_data["longitude"],
                "address": geo_data["formatted_address"]
            }
            final_database.append(place_entry)
        
        time.sleep(0.3)

    print(f"3. Saving to 'final_places.json'")
    with open('final_places.json', 'w', encoding='utf-8') as f:
        json.dump(final_database, f, indent=4, ensure_ascii=False)
    
    print("Done! 'final_places.json' has been updated.")

if __name__ == "__main__":
    GEOAPIFY_KEY = "48b28d752b074c429564fd5ccaf030c7"
    process_excel_and_fetch_data("places_data.xlsx", GEOAPIFY_KEY)