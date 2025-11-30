import json
import sys
import os
from dotenv import load_dotenv

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

# Load environment variables
load_dotenv()

from services.foursquare_service import (
    search_places,
    get_place_details,
    get_place_tips,
    get_place_photos
)

def save_json(data, filename):
    """Save data to a JSON file"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved: {filename}")


# Test 1: Search for hotels
print("=" * 60)
print("TEST 1: SEARCH PLACES")
print("=" * 60)
result = search_places(
    ll="10.7769,106.7009",  # Ho Chi Minh City
    query="hotel",
    limit=3
)

if result.get("success"):
    print(f"Success! Found {len(result['data'].get('results', []))} places")
    save_json(result, "test_1_search.json")

    # Get first place ID for next tests
    if result['data'].get('results'):
        place = result['data']['results'][0]
        place_id = place.get('fsq_place_id')
        place_name = place.get('name')
        print(f"First place: {place_name} ({place_id})")
        
        # Ask user if they want to continue
        print("\n" + "=" * 60)
        print("TEST 2: GET PLACE DETAILS")
        print("=" * 60)
        print(f"Ready to fetch details for: {place_name}")
        input("Press Enter to continue (or Ctrl+C to stop)...")

        # Test 2: Get place details
        details = get_place_details(place_id)
        if details.get("success"):
            print("Success! Got place details")
            save_json(details, "test_2_details.json")
        else:
            print(f"Failed: {details.get('error')}")
       
        print("ALL TESTS COMPLETED!")
        print("=" * 60)
else:
    print(f"Search failed: {result.get('error')}")
    print(f"Status code: {result.get('status_code')}")
