type Position = { latitude: number; longitude: number };

export function checkGPS(callback: (position: Position | null) => void): void {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (pos: GeolocationPosition) => {
                const { latitude, longitude } = pos.coords;
                callback({ latitude, longitude });
            },
            (_err: GeolocationPositionError) => {
                callback(null);
            }
        );
    } else {
        callback(null);
    }
}

export function sendLocationToBackend(
    apiUrl: string,
    callback: (data: any, error?: any) => void
): void {
    checkGPS((position) => {
        if (position) {
            fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(position),
            })
                .then(res => res.json())
                .then(data => callback(data))
                .catch(err => callback(null, err));
        } else {
            callback(null, "Failed to get position");
        }
    });
}