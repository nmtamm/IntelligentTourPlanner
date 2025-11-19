import requests

def get_current_weather(city_name, api_key):
    
    base_url = "https://api.openweathermap.org/data/2.5/weather"
    
    params = {
        "q": city_name,
        "appid": api_key,
        "units": "metric"
    }

    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        
        data = response.json()
       
        weather_info = {
            "city": data["name"],
            "temperature": data["main"]["temp"],
            "condition": data["weather"][0]["description"],
            "humidity": data["main"]["humidity"]
        }
        
        return weather_info

    except requests.exceptions.RequestException as error:
        print(f"Error fetching weather data: {error}")
        return None

#MAIN EXECUTION
if __name__ == "__main__":
    API_KEY = "a82834031a820edaf6095bde557ed775" 
    test_city = "Ho Chi Minh City"
    print(f"Fetching weather for {test_city}...")
    result = get_current_weather(test_city, API_KEY)
    if result:
        print("Success! Data received:")
        print(result)
    else:
        print("Failed to retrieve data.")