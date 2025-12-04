import axios from 'axios';


export async function geocodeDestination(name: string): Promise<{ lat: number; lng: number; address?: string } | null> {
    try {
        const response = await fetch(`http://localhost:8000/api/geocode?q=${encodeURIComponent(name)}`);
        const data = await response.json();
        if (data.lat && data.lon) {
            return { lat: data.lat, lng: data.lon, address: data.display_name };
        }
        return null;
    } catch (error) {
        console.error("Geocode error:", error);
        return null;
    }
}

export async function getOptimizedRoute(destinations: { lat: number; lon: number; name: string; }[]): Promise<any> {
    try {

        const response = await fetch('http://localhost:8000/api/route/optimize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(destinations), // <-- send array directly
        });
        if (!response.ok) throw new Error('Failed to fetch optimized route');
        return await response.json();
    } catch (error) {
        console.error('Route optimization error:', error);
        return null;
    }
}