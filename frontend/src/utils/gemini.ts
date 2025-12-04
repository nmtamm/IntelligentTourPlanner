import { API_HOST } from './config';

export async function fetchItinerary(params) {
    const response = await fetch(`${API_HOST}/api/itinerary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
    });
    return await response.json();
}