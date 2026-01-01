import { geocodeDestination } from "./geocode";
import { API_HOST } from './config';
import { fetchTouristCategories } from "./categories";
import { detectCurrencyAndNormalizePrice } from "./parseAmount";
import { Destination } from "../types";
export async function fetchSerpLocalResults(query: string, ll: string) {
    const response = await fetch(
        `${API_HOST}/api/serp/locations?query=${encodeURIComponent(query)}&ll=${encodeURIComponent(ll)}`,
        {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        }
    );
    if (!response.ok) {
        console.error("API error:", response.status, await response.text());
        return []; // Return empty array on error
    }
    const data = await response.json();
    return data.local_results;
}

export async function fetchFilteredPlaces(type: string, latitude: number, longitude: number) {
    const response = await fetch(
        `${API_HOST}/api/places/search?type=${encodeURIComponent(type)}&latitude=${latitude}&longitude=${longitude}`,
        {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        }
    );
    if (!response.ok) {
        console.error("API error:", response.status, await response.text());
        return [];
    }
    const data = await response.json();
    return data.places || [];
}

export async function generatePlaces(result, userLocation) {
    const nonAdditionalItems = result.categories.filter(item => !item.additional);
    const additionalItems = result.categories.filter(item => item.additional);
    const totalPlaces = 10;
    const baseLimit = Math.floor(totalPlaces / nonAdditionalItems.length);
    const remainder = totalPlaces % nonAdditionalItems.length;

    let allPlaces: any[] = [];
    const seenPlaceIDs = new Set();

    // Use latitude and longitude for backend query
    let latitude: number;
    let longitude: number;
    if (result.starting_point && result.starting_point.trim() !== "") {
        const geo = await geocodeDestination(result.starting_point);
        latitude = geo?.latitude || 0;
        longitude = geo?.longitude || 0;
    } else {
        latitude = userLocation?.latitude || 0;
        longitude = userLocation?.longitude || 0;
    }

    // Fetch for non-additional categories
    for (let i = 0; i < nonAdditionalItems.length; i++) {
        const item = nonAdditionalItems[i];
        const count = i < remainder ? baseLimit + 1 : baseLimit;
        const places = await fetchFilteredPlaces(item.name, latitude, longitude);
        if (!Array.isArray(places)) {
            console.error("places is not iterable", places);
            continue; // Skip this iteration if places is not an array
        }
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
        const places = await fetchFilteredPlaces(item.name, latitude, longitude);
        if (!Array.isArray(places)) {
            console.error("places is not iterable", places);
            additionalIndex++;
            continue;
        }
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
    return {
        allPlaces: allPlaces,
        city: result.starting_point,
        latitude,
        longitude
    };
}

export async function fetchPlacesData() {
    const result = await fetchTouristCategories();

    // Dinh Doc Lap
    // const latitude = 10.7770348;
    // const longitude = 106.695488;

    // Vincom Mega Mall Thao Dien
    // const latitude = 10.8020001;
    // const longitude = 106.7406138;

    // Mega GS Ly Chinh Thang
    // const latitude = 10.7806423;
    // const longitude = 106.6823914;

    // Nga 6 Nguyen Tri Phương
    // const latitude = 10.7597684;
    // const longitude = 106.6690555;

    // Cau Anh Sao
    const latitude = 10.7247339;
    const longitude = 106.7185226;

    const ll = `@${latitude},${longitude},15.1z`;

    const allPlaces: any[] = [];
    for (const category of result) {
        const places = await fetchSerpLocalResults(category, ll);
        allPlaces.push(...places);
    }

    return allPlaces;
}

export async function savePlacesToBackend(allPlaces: any[]) {
    const response = await fetch(`${API_HOST}/api/places/save`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ places: allPlaces })
    });
    if (!response.ok) {
        throw new Error('Failed to save places');
    }
    return await response.json();
}

export async function handleSearch(query: string) {
    if (!query) return [];
    const res = await fetch(`${API_HOST}/api/places/manualsearch?query=${encodeURIComponent(query)}`);
    if (!res.ok) {
        console.error("API error:", res.status, await res.text());
        return [];
    }
    const data = await res.json();
    return data;
}

export async function getPlaceById(id: string) {
    const res = await fetch(`${API_HOST}/api/places/byid?id=${id}`);
    if (!res.ok) return null;
    return await res.json();
}

export async function fetchUniqueTopTypes() {
    const response = await fetch(`${API_HOST}/api/places/unique-top-types`, {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    });
    if (!response.ok) {
        console.error("API error:", response.status, await response.text());
        return null;
    }
    return await response.json();
}

export function mapPlaceToDestination(
    place: any,
    currency: 'USD' | 'VND',
    onCurrencyToggle: () => void,
    language: "EN" | "VI"
): Destination {
    const { detectedCurrency, normalizedPrice } = detectCurrencyAndNormalizePrice(place.price, currency);
    if (detectedCurrency !== currency) {
        onCurrencyToggle();
    }

    // Use the correct name field based on language
    let name = "";
    if (language === "EN") {
        // If en_name is a JSON array or string
        name = Array.isArray(place.en_name)
            ? place.en_name[0]
            : (place.en_name || place.title);
    } else {
        name = Array.isArray(place.vi_name)
            ? place.vi_name[0]
            : (place.vi_name || place.title);
    }

    return {
        id: place.place_id,
        name: name,
        address: place.address || "",
        costs: [{
            id: `${Date.now()}-0`,
            amount: normalizedPrice,
            detail: "",
            originalAmount: normalizedPrice,
            originalCurrency: detectedCurrency,
        }],
        latitude: place.gps_coordinates?.latitude,
        longitude: place.gps_coordinates?.longitude,
        // ...add other fields as needed
    };
}

export async function fetchNearbyPlaces(type: string, latitude: number, longitude: number, radius_m: number = 1000) {
    const response = await fetch(
        `${API_HOST}/api/places/nearby?type=${encodeURIComponent(type)}&latitude=${latitude}&longitude=${longitude}&radius_m=${radius_m}`,
        {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        }
    );
    if (!response.ok) {
        console.error("API error:", response.status, await response.text());
        return [];
    }
    const data = await response.json();
    return data.places || [];
}