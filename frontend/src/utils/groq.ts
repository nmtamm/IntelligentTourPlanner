import { API_HOST } from './config';

export async function fetchItineraryWithGroq(paragraph: string) {
    const response = await fetch(`${API_HOST}/api/groq/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paragraph })
    });
    return await response.json();
}

export async function detectAndExecuteGroqCommand(prompt: string) {
    const response = await fetch(`${API_HOST}/api/groq/detect-command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
    });
    return await response.json();
}