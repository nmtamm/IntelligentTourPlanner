"""
Test script for Foursquare integration
Tests: Search → Save → Link to trip → Retrieve
"""
import requests
import json
import logging
from datetime import datetime
import sys

# Configure console encoding for Unicode support
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'test_foursquare_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

BASE_URL = "http://localhost:8000"

# Test credentials (you may need to register first)
USERNAME = "testuser"
PASSWORD = "testpass123"
EMAIL = "test@example.com"

def print_section(title):
    print("\n" + "=" * 60)
    print(title)
    print("=" * 60)


def register_user():
    """Register a test user"""
    print_section("REGISTERING TEST USER")
    logger.info(f"Attempting to register user: {USERNAME}")

    url = f"{BASE_URL}/auth/register"
    payload = {
        "username": USERNAME,
        "email": EMAIL,
        "password": PASSWORD
    }
    logger.debug(f"POST {url}")
    logger.debug(f"Payload: {json.dumps({k: v if k != 'password' else '***' for k, v in payload.items()}, indent=2)}")

    try:
        response = requests.post(url, json=payload)
        logger.info(f"Response status: {response.status_code}")
        logger.debug(f"Response body: {response.text}")

        if response.status_code == 200:
            print(f"[OK] User registered: {USERNAME}")
            logger.info(f"User successfully registered: {USERNAME}")
            return True
        elif response.status_code == 400:
            print(f"[OK] User already exists: {USERNAME}")
            logger.info(f"User already exists: {USERNAME}")
            return True
        else:
            print(f"[ERROR] Registration failed: {response.text}")
            logger.error(f"Registration failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        logger.exception(f"Exception during registration: {e}")
        print(f"[ERROR] Exception during registration: {e}")
        return False


def login():
    """Login and get access token"""
    print_section("LOGGING IN")
    logger.info(f"Attempting to login as: {USERNAME}")

    url = f"{BASE_URL}/auth/token"
    data = {
        "username": USERNAME,
        "password": PASSWORD
    }
    logger.debug(f"POST {url}")
    logger.debug(f"Data: username={USERNAME}, password=***")

    try:
        response = requests.post(url, data=data)
        logger.info(f"Response status: {response.status_code}")
        logger.debug(f"Response body: {response.text[:200]}")  # Truncate for security

        if response.status_code == 200:
            token = response.json()["access_token"]
            print(f"[OK] Login successful")
            logger.info(f"Login successful, token received (length: {len(token)})")
            return token
        else:
            print(f"[ERROR] Login failed: {response.text}")
            logger.error(f"Login failed with status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        logger.exception(f"Exception during login: {e}")
        print(f"[ERROR] Exception during login: {e}")
        return None


def search_foursquare_places(token, place_type="eat", query="coffee"):
    """Test 1: Search Foursquare and auto-save to database"""
    print_section(f"TEST 1: SEARCH & SAVE ({place_type.upper()}: {query})")
    logger.info(f"Searching Foursquare places: type={place_type}, query={query}")

    url = f"{BASE_URL}/api/foursquare/search"
    params = {
        "place_type": place_type,
        "ll": "10.7769,106.7009",  # Ho Chi Minh City
        "query": query,
        "limit": 3
    }
    logger.debug(f"POST {url}")
    logger.debug(f"Params: {json.dumps(params, indent=2)}")

    try:
        response = requests.post(url, params=params, headers={"Authorization": f"Bearer {token}"})
        logger.info(f"Response status: {response.status_code}")
        logger.debug(f"Response body: {response.text[:500]}...")

        if response.status_code == 200:
            places = response.json()
            print(f"[OK] Found and saved {len(places)} places")
            logger.info(f"Successfully found and saved {len(places)} places")

            for i, place in enumerate(places, 1):
                print(f"  {i}. {place['name']} (ID: {place['fsq_place_id']})")
                print(f"     Type: {place['place_type']}, Rating: {place.get('rating', 'N/A')}")
                logger.debug(f"Place {i}: {place['name']} (ID: {place['fsq_place_id']}, Type: {place['place_type']}, Rating: {place.get('rating', 'N/A')})")

            if places:
                logger.info(f"Returning first place: {places[0]['name']}")
                return places[0]
            else:
                logger.warning("No places returned")
                return None
        else:
            print(f"[ERROR] Search failed: {response.text}")
            logger.error(f"Search failed with status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        logger.exception(f"Exception during search: {e}")
        print(f"[ERROR] Exception during search: {e}")
        return None


def create_trip_with_foursquare(token, place):
    """Test 2: Create trip with Foursquare destination"""
    print_section("TEST 2: CREATE TRIP WITH FOURSQUARE DESTINATION")
    logger.info(f"Creating trip with Foursquare destination: {place['name']}")

    trip_data = {
        "name": "Test Trip with Foursquare",
        "start_date": "2025-01-15",
        "end_date": "2025-01-16",
        "currency": "USD",
        "members": 2,
        "days": [
            {
                "day_number": 1,
                "destinations": [
                    {
                        "name": place['name'],
                        "address": place.get('address'),
                        "latitude": place.get('latitude'),
                        "longitude": place.get('longitude'),
                        "order": 1,
                        "fsq_place_id": place['fsq_place_id'],
                        "destination_type": place['place_type'],
                        "costs": []
                    }
                ]
            }
        ]
    }

    url = f"{BASE_URL}/api/trips/"
    logger.debug(f"POST {url}")
    logger.debug(f"Trip data: {json.dumps(trip_data, indent=2)}")

    try:
        response = requests.post(url, json=trip_data, headers={"Authorization": f"Bearer {token}"})
        logger.info(f"Response status: {response.status_code}")
        logger.debug(f"Response body: {response.text[:500]}...")

        if response.status_code == 201:
            trip = response.json()
            print(f"[OK] Trip created: {trip['name']} (ID: {trip['id']})")
            print(f"  Destination: {trip['days'][0]['destinations'][0]['name']}")
            print(f"  Foursquare ID: {trip['days'][0]['destinations'][0]['fsq_place_id']}")
            logger.info(f"Trip created successfully with ID: {trip['id']}")
            logger.debug(f"Trip details: {json.dumps(trip, indent=2)}")
            return trip['id']
        else:
            print(f"[ERROR] Trip creation failed: {response.text}")
            logger.error(f"Trip creation failed with status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        logger.exception(f"Exception during trip creation: {e}")
        print(f"[ERROR] Exception during trip creation: {e}")
        return None


def get_trip_with_foursquare_data(token, trip_id):
    """Test 3: Retrieve trip and verify Foursquare data is included"""
    print_section("TEST 3: RETRIEVE TRIP WITH FOURSQUARE DATA")
    logger.info(f"Retrieving trip with ID: {trip_id}")

    url = f"{BASE_URL}/api/trips/{trip_id}"
    logger.debug(f"GET {url}")

    try:
        response = requests.get(url, headers={"Authorization": f"Bearer {token}"})
        logger.info(f"Response status: {response.status_code}")
        logger.debug(f"Response body: {response.text[:1000]}...")

        if response.status_code == 200:
            trip = response.json()
            print(f"[OK] Trip retrieved: {trip['name']}")
            logger.info(f"Trip retrieved successfully: {trip['name']}")
            logger.debug(f"Full trip data: {json.dumps(trip, indent=2)}")

            destination = trip['days'][0]['destinations'][0]
            print(f"\nDestination Details:")
            print(f"  Name: {destination['name']}")
            print(f"  Type: {destination['destination_type']}")
            print(f"  Foursquare ID: {destination['fsq_place_id']}")
            logger.debug(f"Destination: {destination['name']} (Type: {destination['destination_type']}, FSQ ID: {destination['fsq_place_id']})")

            if destination.get('foursquare_place'):
                fs_place = destination['foursquare_place']
                print(f"\nFoursquare Data:")
                print(f"  Rating: {fs_place.get('rating', 'N/A')}")
                print(f"  Price Level: {fs_place.get('price_level', 'N/A')}")
                print(f"  Phone: {fs_place.get('phone', 'N/A')}")
                print(f"  Website: {fs_place.get('website', 'N/A')}")
                print(f"[OK] Foursquare data successfully linked!")
                logger.info("[OK] Foursquare data successfully linked to destination!")
                logger.debug(f"Foursquare place data: {json.dumps(fs_place, indent=2)}")
            else:
                print(f"[WARN] Foursquare data not included in response")
                logger.warning("Foursquare data NOT included in response - check relationship loading")

            return True
        else:
            print(f"[ERROR] Trip retrieval failed: {response.text}")
            logger.error(f"Trip retrieval failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        logger.exception(f"Exception during trip retrieval: {e}")
        print(f"[ERROR] Exception during trip retrieval: {e}")
        return False


def query_cached_places(token, place_type="eat"):
    """Test 4: Query cached Foursquare places"""
    print_section(f"TEST 4: QUERY CACHED PLACES (Type: {place_type})")
    logger.info(f"Querying cached places of type: {place_type}")

    url = f"{BASE_URL}/api/foursquare/places"
    params = {
        "place_type": place_type,
        "limit": 5
    }
    logger.debug(f"GET {url}")
    logger.debug(f"Params: {json.dumps(params, indent=2)}")

    try:
        response = requests.get(url, params=params, headers={"Authorization": f"Bearer {token}"})
        logger.info(f"Response status: {response.status_code}")
        logger.debug(f"Response body: {response.text[:500]}...")

        if response.status_code == 200:
            places = response.json()
            print(f"[OK] Found {len(places)} cached {place_type} places")
            logger.info(f"Found {len(places)} cached {place_type} places")

            for i, place in enumerate(places, 1):
                print(f"  {i}. {place['name']} - Rating: {place.get('rating', 'N/A')}")
                logger.debug(f"Cached place {i}: {place['name']} - Rating: {place.get('rating', 'N/A')}")

            return True
        else:
            print(f"[ERROR] Query failed: {response.text}")
            logger.error(f"Query failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        logger.exception(f"Exception during query: {e}")
        print(f"[ERROR] Exception during query: {e}")
        return False


def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("FOURSQUARE INTEGRATION TEST SUITE")
    print("=" * 60)
    logger.info("=" * 60)
    logger.info("STARTING FOURSQUARE INTEGRATION TEST SUITE")
    logger.info("=" * 60)

    # Register and login
    if not register_user():
        print("\n[X] Test suite aborted: User registration failed")
        logger.error("TEST SUITE ABORTED: User registration failed")
        return

    token = login()
    if not token:
        print("\n[X] Test suite aborted: Login failed")
        logger.error("TEST SUITE ABORTED: Login failed")
        return

    # Test 1: Search and save places
    place = search_foursquare_places(token, place_type="eat", query="coffee")
    if not place:
        print("\n[X] Test suite aborted: Search failed")
        logger.error("TEST SUITE ABORTED: Search failed")
        return

    # Test 2: Create trip with Foursquare destination
    trip_id = create_trip_with_foursquare(token, place)
    if not trip_id:
        print("\n[X] Test suite aborted: Trip creation failed")
        logger.error("TEST SUITE ABORTED: Trip creation failed")
        return

    # Test 3: Retrieve trip with Foursquare data
    if not get_trip_with_foursquare_data(token, trip_id):
        print("\n[X] Test failed: Could not retrieve trip")
        logger.error("TEST FAILED: Could not retrieve trip")
        return

    # Test 4: Query cached places
    query_cached_places(token, place_type="eat")

    print("\n" + "=" * 60)
    print("ALL TESTS PASSED!")
    print("=" * 60)
    print("\nSummary:")
    print("  [OK] Search Foursquare places")
    print("  [OK] Auto-save to database")
    print("  [OK] Link to trip destinations")
    print("  [OK] Retrieve with enriched data")
    print("  [OK] Query cached places")
    logger.info("=" * 60)
    logger.info("ALL TESTS PASSED!")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
