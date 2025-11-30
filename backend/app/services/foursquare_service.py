import os
import requests
from typing import Optional, List, Dict, Any

# Foursquare Places API Configuration
FOURSQUARE_BASE_URL = "https://places-api.foursquare.com/places"
FOURSQUARE_API_VERSION = "2025-06-17"


def _get_headers() -> Dict[str, str]:
    """Get headers with API key for Foursquare requests"""
    api_key = os.getenv("FOURSQUARE_API_KEY")
    if not api_key:
        raise ValueError("FOURSQUARE_API_KEY not found in environment variables")

    return {
        "accept": "application/json",
        "X-Places-Api-Version": FOURSQUARE_API_VERSION,
        "authorization": f"Bearer {api_key}"
    }


def search_places(
    ll: Optional[str] = None,
    near: Optional[str] = None,
    query: Optional[str] = None,
    categories: Optional[str] = None,
    radius: Optional[int] = None,
    limit: int = 10,
    ne: Optional[str] = None,
    sw: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Search for places using Foursquare Places API

    Args:
        ll: Latitude,Longitude (e.g., "40.7128,-74.0060")
        near: Geocodable location name (e.g., "New York, NY")
        query: Search query (e.g., "coffee", "hotel")
        categories: Category IDs to filter by
        radius: Search radius in meters (use with ll)
        limit: Number of results to return (default 10)
        ne: Northeast corner coordinates for bounding box (lat,lon)
        sw: Southwest corner coordinates for bounding box (lat,lon)

    Returns:
        Dictionary containing search results
    """
    try:
        url = f"{FOURSQUARE_BASE_URL}/search"
        headers = _get_headers()

        params = {"limit": limit}

        # Add location parameters
        if ll:
            params["ll"] = ll
        if near:
            params["near"] = near
        if ne:
            params["ne"] = ne
        if sw:
            params["sw"] = sw
        if radius:
            params["radius"] = radius

        # Add search filters
        if query:
            params["query"] = query
        if categories:
            params["categories"] = categories

        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()

        return {
            "success": True,
            "data": response.json()
        }

    except requests.exceptions.HTTPError as e:
        return {
            "success": False,
            "error": f"HTTP error: {e}",
            "status_code": e.response.status_code if e.response else None
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def get_place_details(
    fsq_place_id: str,
    fields: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Get detailed information for a specific place

    Args:
        fsq_place_id: Foursquare place ID
        fields: List of fields to retrieve (comma-separated in request)

    Returns:
        Dictionary containing place details
    """
    try:
        url = f"{FOURSQUARE_BASE_URL}/{fsq_place_id}"
        headers = _get_headers()

        params = {}
        if fields:
            params["fields"] = ",".join(fields)

        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()

        return {
            "success": True,
            "data": response.json()
        }

    except requests.exceptions.HTTPError as e:
        return {
            "success": False,
            "error": f"HTTP error: {e}",
            "status_code": e.response.status_code if e.response else None
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def get_place_tips(fsq_place_id: str) -> Dict[str, Any]:
    """
    Get user-generated tips/reviews for a specific place

    Args:
        fsq_place_id: Foursquare place ID

    Returns:
        Dictionary containing tips data
    """
    try:
        url = f"{FOURSQUARE_BASE_URL}/{fsq_place_id}/tips"
        headers = _get_headers()

        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        return {
            "success": True,
            "data": response.json()
        }

    except requests.exceptions.HTTPError as e:
        return {
            "success": False,
            "error": f"HTTP error: {e}",
            "status_code": e.response.status_code if e.response else None
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def get_place_photos(fsq_place_id: str) -> Dict[str, Any]:
    """
    Get photos for a specific place

    Args:
        fsq_place_id: Foursquare place ID

    Returns:
        Dictionary containing photos data
    """
    try:
        url = f"{FOURSQUARE_BASE_URL}/{fsq_place_id}/photos"
        headers = _get_headers()

        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        return {
            "success": True,
            "data": response.json()
        }

    except requests.exceptions.HTTPError as e:
        return {
            "success": False,
            "error": f"HTTP error: {e}",
            "status_code": e.response.status_code if e.response else None
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
