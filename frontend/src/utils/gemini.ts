export async function fetchItinerary(params) {
    const response = await fetch('http://localhost:8000/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
    });
    return await response.json();
}