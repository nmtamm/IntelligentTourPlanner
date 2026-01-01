import { API_HOST } from "./config";
export async function updateProfile(updates: {
    username?: string;
    email?: string;
    password?: string;
    avatar?: string;
}) {
    const token = localStorage.getItem('token');
    const response = await fetch(API_HOST + '/auth/update-profile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updates),
    });

    if (!response.ok) {
        throw new Error('Failed to update profile');
    }

    return response.json();
}