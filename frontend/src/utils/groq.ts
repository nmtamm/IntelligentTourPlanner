import { API_HOST } from './config';
import { DayPlan } from '../types';

export async function fetchItineraryWithGroq(paragraph: string) {
    const response = await fetch(`${API_HOST}/api/groq/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paragraph })
    });
    return await response.json();
}

export async function detectAndExecuteGroqCommand(plan: { name: string; days: DayPlan[], city?: string; cityCoordinates?: { latitude: number; longitude: number } }, prompt: string) {
    const response = await fetch(`${API_HOST}/api/groq/detect-command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, plan })
    });
    return await response.json();
}