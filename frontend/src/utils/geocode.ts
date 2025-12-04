import axios from 'axios';
import { API_HOST } from './config';

export async function geocodeDestination(name: string): Promise<{ latitude: number; longitude: number; address?: string } | null> {
    try {
        const response = await fetch(`${API_HOST}/api/geocode?q=${encodeURIComponent(name)}`);
        const data = await response.json();
        if (data.lat && data.lon) {
            return { latitude: data.lat, longitude: data.lon, address: data.display_name };
        }
        return null;
    } catch (error) {
        console.error("Geocode error:", error);
        return null;
    }
}

export async function getOptimizedRoute(destinations: { latitude: number; longitude: number; name: string; }[]): Promise<any> {
    try {
        const response = await fetch(`${API_HOST}/api/route/optimize`, {
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