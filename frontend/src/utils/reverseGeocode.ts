export async function reverseGeocode(lat: number, lng: number) {
    const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    return {
        name: data.name || data.display_name,
        address: data.display_name,
    };
}