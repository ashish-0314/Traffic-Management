import React, { useEffect, useRef, useState } from 'react';
import * as tt from '@tomtom-international/web-sdk-maps';
import axios from 'axios';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import { Crosshair } from 'lucide-react';

const TrafficMap = () => {
    const mapElement = useRef();
    const mapInstance = useRef();
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;

        if (!apiKey) {
            console.error('TomTom API Key is missing');
            return;
        }

        mapInstance.current = tt.map({
            key: apiKey,
            container: mapElement.current,
            center: [77.5946, 12.9716], // Default: Bangalore
            zoom: 12,
            stylesVisibility: {
                trafficIncidents: true,
                trafficFlow: true
            }
        });

        mapInstance.current.addControl(new tt.FullscreenControl());
        mapInstance.current.addControl(new tt.NavigationControl());

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
            }
        };
    }, []);

    const handleLocateMe = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;

                    // Center map
                    mapInstance.current.flyTo({
                        center: [longitude, latitude],
                        zoom: 14,
                        duration: 1000
                    });

                    // Add marker (remove previous if exists logic omitted for simplicity unless requested)
                    const marker = new tt.Marker()
                        .setLngLat([longitude, latitude])
                        .addTo(mapInstance.current);

                    // Simple popup
                    const popup = new tt.Popup({ offset: 35 })
                        .setHTML("<b>You are here!</b>");
                    marker.setPopup(popup).togglePopup();

                },
                (error) => {
                    console.error("Error getting location:", error);
                    alert("Could not detect your location. Please check browser permissions.");
                }
            );
        } else {
            alert("Geolocation is not supported by your browser");
        }
    };

    return (
        <div className="relative w-full h-screen">
            <div ref={mapElement} className="w-full h-full" />

            <button
                onClick={handleLocateMe}
                className="absolute bottom-10 right-4 z-10 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Locate Me"
            >
                <Crosshair className="h-6 w-6 text-blue-600" />
            </button>
        </div>
    );
};

export default TrafficMap;
