import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function MapView({ lat, lon, name }) {
    if (!lat || !lon) return <p className="text-center mt-4">No location data yet.</p>;

    return (
        <div className="w-full h-96 rounded-lg shadow-md">
            <MapContainer
                center={[parseFloat(lat), parseFloat(lon)]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                />
                <Marker position={[parseFloat(lat), parseFloat(lon)]}>
                    <Popup>{name}</Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}
