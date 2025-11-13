import React from "react";
import { useState } from "react";
import MapView from "./MapView1";

export default function GeocodePage() {
    const [query, setQuery] = useState("");
    const [location, setLocation] = useState(null);

    const handleSearch = async () => {
        const res = await fetch(`http://localhost:8000/api/geocode?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setLocation(data);
    };

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-2xl font-bold">Find Location</h1>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter city or address..."
                    className="border p-2 rounded w-64"
                />
                <button
                    onClick={handleSearch}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Search
                </button>
            </div>

            {location && (
                <>
                    <p className="text-gray-600">
                        {location.display_name} <br />
                        Lat: {location.lat}, Lon: {location.lon}
                    </p>
                    <MapView lat={location.lat} lon={location.lon} name={location.display_name} />
                </>
            )}
        </div>
    );
}
