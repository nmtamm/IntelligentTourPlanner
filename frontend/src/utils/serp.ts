import { geocodeDestination } from "./geocode";

export async function fetchSerpLocalResults(query: string, ll: string) {
    const response = await fetch(
        `http://localhost:8000/api/serp/locations?query=${encodeURIComponent(query)}&ll=${encodeURIComponent(ll)}`,
        {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        }
    );
    const data = await response.json();
    return data.local_results;
}

export async function generatePlaces(result, userLocation) {
    const nonAdditionalItems = result.categories.filter(item => !item.additional);
    const additionalItems = result.categories.filter(item => item.additional);
    const totalPlaces = 10;
    const baseLimit = Math.floor(totalPlaces / nonAdditionalItems.length);
    const remainder = totalPlaces % nonAdditionalItems.length;

    let allPlaces: any[] = [];
    const seenPlaceIDs = new Set();

    let ll: string;
    if (result.starting_point) {
        const geo = await geocodeDestination(result.starting_point);
        if (geo && geo.lat && geo.lng) {
            ll = `@${geo.lat},${geo.lng},15.1z`;
        } else if (userLocation) {
            ll = `${userLocation.lat},${userLocation.lng}`;
        } else {
            ll = "";
        }
    } else if (userLocation) {
        ll = `${userLocation.lat},${userLocation.lng}`;
    } else {
        ll = "";
    }

    // Fetch for non-additional categories
    for (let i = 0; i < nonAdditionalItems.length; i++) {
        const item = nonAdditionalItems[i];
        const count = i < remainder ? baseLimit + 1 : baseLimit;
        const places = await fetchSerpLocalResults(item.name, ll);
        for (const place of places) {
            if (allPlaces.length < totalPlaces && !seenPlaceIDs.has(place.place_id)) {
                allPlaces.push(place);
                seenPlaceIDs.add(place.place_id);
                if (allPlaces.length >= totalPlaces || allPlaces.filter(p => p.name === item.name).length >= count) break;
            }
        }
    }

    // If not enough, fill with additional categories
    let additionalIndex = 0;
    while (allPlaces.length < totalPlaces && additionalIndex < additionalItems.length) {
        const item = additionalItems[additionalIndex];
        const places = await fetchSerpLocalResults(item.name, ll);
        for (const place of places) {
            if (allPlaces.length < totalPlaces && !seenPlaceIDs.has(place.place_id)) {
                allPlaces.push(place);
                seenPlaceIDs.add(place.place_id);
                break; // Only add one per additional category
            }
        }
        additionalIndex++;
    }

    // If still more than 10, trim the array
    if (allPlaces.length > totalPlaces) {
        allPlaces = allPlaces.slice(0, totalPlaces);
    }
    return allPlaces;
}