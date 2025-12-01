export async function fetchTouristCategories(): Promise<string[]> {
    const response = await fetch('http://localhost:8000/categories');
    if (!response.ok) {
        throw new Error('Failed to fetch categories');
    }
    return await response.json();
}