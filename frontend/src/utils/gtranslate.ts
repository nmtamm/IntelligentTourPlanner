import { API_HOST } from './config';

export async function translateEnToVi(text: string): Promise<string> {
    const response = await fetch(`${API_HOST}/api/translate/en-to-vi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
    });
    const data = await response.json();
    return data.translation;
}

export async function translateViToEn(text: string): Promise<string> {
    const response = await fetch(`${API_HOST}/api/translate/vi-to-en`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
    });
    const data = await response.json();
    return data.translation;
}