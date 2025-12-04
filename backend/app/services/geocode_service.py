import requests
import polyline

NOMINATIM_URL = "https://nominatim.openstreetmap.org"
OSRM_URL = "https://router.project-osrm.org"

HEADERS = {"User-Agent": "SmartTravel/1.0 (contact: a@gmail.com)"}


def geocode_location(query: str):
    try:
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
    except Exception as e:
        return {"error": str(e)}


def route_osrm(points):
    try:
        coords = ";".join([f"{point['lon']},{point['lat']}" for point in points])
        r = requests.get(
            f"{OSRM_URL}/trip/v1/driving/{coords}",
            params={
                "overview": "full",
                "steps": "true",
                "source": "first",
                "roundtrip": "false",
            },
            timeout=120,
        )
        r.raise_for_status()
        data = r.json()

        if "trips" not in data or not data["trips"]:
            return {"success": False, "error": "No trips found"}

        # Try to get waypoint_order, fallback to waypoints' waypoint_index
        waypoint_order = data["trips"][0].get("waypoint_order")
        if not waypoint_order:
            # Fallback: reconstruct order from waypoints
            waypoints = data.get("waypoints", [])
            # Sort waypoints by 'waypoint_index'
            sorted_waypoints = sorted(
                enumerate(waypoints), key=lambda x: x[1]["waypoint_index"]
            )
            ordered_indices = [i for i, _ in sorted_waypoints]
        else:
            ordered_indices = waypoint_order

        optimized_points = [points[i] for i in ordered_indices]

        segment_geometries = []
        for leg in data["trips"][0]["legs"]:
            all_coords = []
            for step in leg.get("steps", []):
                geom = step.get("geometry")
                if geom:
                    coords = polyline.decode(geom)
                    all_coords.extend(coords)
            if all_coords:
                # Encode the full list of coordinates as a polyline string
                segment_geometries.append(polyline.encode(all_coords))
            else:
                segment_geometries.append(None)

        instructions = []
        for leg in data["trips"][0]["legs"]:
            leg_instructions = []
            for step in leg.get("steps", []):
                maneuver = step.get("maneuver", {})
                road_name = step.get("name", "")
                # Separate direction and name
                direction = f"{maneuver.get('type', '').capitalize()} {maneuver.get('modifier', '')}".strip()
                leg_instructions.append(
                    {
                        "type": maneuver.get("type", ""),
                        "modifier": maneuver.get("modifier", ""),
                        "name": road_name,
                    }
                )
            instructions.append(leg_instructions)

        return {
            "success": True,
            "optimized_route": optimized_points,
            "distance_km": data["trips"][0]["distance"] / 1000,
            "duration_min": data["trips"][0]["duration"] / 60,
            "geometry": data["trips"][0].get("geometry"),
            "segment_geometries": segment_geometries,
            "instructions": instructions,
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }
