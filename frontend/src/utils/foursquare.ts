export async function fetchFoursquarePlaces({ ll, near = undefined, limit = 10, query }) {
    const params = new URLSearchParams();
    if (ll) params.append('ll', ll);
    if (near) params.append('near', near);
    if (limit !== undefined) params.append('limit', String(limit));
    if (query) params.append('query', query);

    const response = await fetch(
        `http://localhost:8000/api/foursquare/search?${params.toString()}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }
    );

    if (!response.ok) {
        throw new Error('Failed to fetch places');
    }

    return await response.json();
}