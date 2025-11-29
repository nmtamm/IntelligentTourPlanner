import requests

SERPAPI_URL = "https://serpapi.com/search.json"


def search_google_maps(query: str, ll: str, api_key: str):
    try:
        params = {
            "engine": "google_maps",
            "q": query,
            "ll": ll,
            "type": "search",
            "api_key": api_key,
        }
        response = requests.get(SERPAPI_URL, params=params)
        response.raise_for_status()
        data = response.json()
        return data.get("local_results", [])

    except Exception as e:
        return {"success": False, "error": str(e)}
