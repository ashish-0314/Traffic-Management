import React, { useEffect, useRef, useState } from 'react';
import * as tt from '@tomtom-international/web-sdk-maps';
import * as ttServices from '@tomtom-international/web-sdk-services';
import axios from 'axios';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import { Crosshair, Search, Navigation, MapPin, Layers, Loader2 } from 'lucide-react';

const TrafficMap = () => {
    const mapElement = useRef();
    const mapInstance = useRef(null);
    const userMarkerRef = useRef(null);
    const incidentMarkersRef = useRef([]);

    const [userLocation, setUserLocation] = useState(null);
    const [incidents, setIncidents] = useState([]);
    const [isMapReady, setIsMapReady] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    // Route States
    const [startLocation, setStartLocation] = useState(null); // { position: {lat, lng}, name: string }
    const [destination, setDestination] = useState(null); // { position: {lat, lng}, name: string }

    // Search States
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [activeSearchField, setActiveSearchField] = useState('destination'); // 'start' or 'destination'

    const [routeError, setRouteError] = useState('');
    const [routeSummary, setRouteSummary] = useState(null); // { distance: number, travelTime: number }
    const [isRouting, setIsRouting] = useState(false);

    const [mapStyle, setMapStyle] = useState('basic');

    // Fetch Incidents
    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await axios.get(`${API_URL}/api/incidents?status=Verified&limit=50&timeLimit=72`);
                setIncidents(res.data.incidents || []);
            } catch (error) {
                console.error('Failed to fetch incidents', error);
            }
        };
        fetchIncidents();
    }, []);

    // Initialize Map
    useEffect(() => {
        const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;
        if (!apiKey) {
            console.error('TomTom API Key is missing');
            return;
        }

        if (mapInstance.current) return; // Prevent double init

        // Load saved center
        const savedCenter = localStorage.getItem('trafficMapCenter');
        const defaultCenter = savedCenter ? JSON.parse(savedCenter) : [77.5946, 12.9716];

        const map = tt.map({
            key: apiKey,
            container: mapElement.current,
            center: defaultCenter,
            zoom: 12,
            stylesVisibility: {
                trafficIncidents: true,
                trafficFlow: true
            }
        });

        mapInstance.current = map;

        map.on('load', () => {
            setIsMapReady(true);
            map.addControl(new tt.FullscreenControl());
            map.addControl(new tt.NavigationControl());

            // Load saved user location marker
            const savedUserLoc = localStorage.getItem('trafficMapUserLocation');
            if (savedUserLoc) {
                const userPos = JSON.parse(savedUserLoc);
                setUserLocation(userPos);
                updateUserMarker(userPos.lng, userPos.lat);
            }
        });

        // Save center on move
        map.on('moveend', () => {
            const center = map.getCenter();
            localStorage.setItem('trafficMapCenter', JSON.stringify([center.lng, center.lat]));
        });

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    // Update Incident Markers
    useEffect(() => {
        if (!isMapReady || !mapInstance.current) return;

        // Clear existing incident markers
        incidentMarkersRef.current.forEach(marker => marker.remove());
        incidentMarkersRef.current = [];

        // Add new markers
        incidents.forEach(incident => {
            try {
                if (!incident.location || !incident.location.lat || !incident.location.lng) return;

                const lat = Number(incident.location.lat);
                const lng = Number(incident.location.lng);

                if (isNaN(lat) || isNaN(lng)) return;

                const { type, description, createdAt } = incident;

                let color = '#3b82f6'; // Blue default
                if (type === 'Accident') color = '#ef4444'; // Red
                if (type === 'Traffic Jam') color = '#f97316'; // Orange
                if (type === 'Road Closure') color = '#1f2937'; // Dark Grey

                const markerElement = document.createElement('div');
                markerElement.style.backgroundColor = color;
                markerElement.style.width = '20px';
                markerElement.style.height = '20px';
                markerElement.style.borderRadius = '50%';
                markerElement.style.border = '2px solid white';
                markerElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
                markerElement.style.cursor = 'pointer';

                const popup = new tt.Popup({ offset: 25 }).setHTML(`
                    <div class="p-2">
                        <h3 class="font-bold text-sm">${type}</h3>
                        <p class="text-xs mt-1 text-gray-600">${description}</p>
                        <p class="text-xs mt-1 text-gray-400">${new Date(createdAt).toLocaleString()}</p>
                    </div>
                `);

                const marker = new tt.Marker({ element: markerElement })
                    .setLngLat([lng, lat])
                    .setPopup(popup)
                    .addTo(mapInstance.current);

                incidentMarkersRef.current.push(marker);
            } catch (err) {
                console.error('Error adding marker for incident:', incident._id, err);
            }
        });
    }, [incidents, isMapReady]);

    const updateUserMarker = (lng, lat) => {
        if (!mapInstance.current) return;

        // Remove existing marker
        if (userMarkerRef.current) {
            userMarkerRef.current.remove();
        }

        // Add new marker
        const marker = new tt.Marker()
            .setLngLat([lng, lat])
            .addTo(mapInstance.current);

        const popup = new tt.Popup({ offset: 35 }).setHTML("<b>You are here!</b>");
        marker.setPopup(popup);

        userMarkerRef.current = marker;
    };

    const handleLocateMe = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                alert("Geolocation is not supported by your browser");
                return reject(new Error("Geolocation not supported"));
            }

            setIsLocating(true);

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const userPos = { lat: latitude, lng: longitude };

                    setUserLocation(userPos);
                    updateUserMarker(longitude, latitude);

                    // If start location is not manually set, use user location
                    if (!startLocation || startLocation.isUserLocation) {
                        setStartLocation({ position: userPos, name: "My Location", isUserLocation: true });
                    }

                    // Center map
                    mapInstance.current.flyTo({
                        center: [longitude, latitude],
                        zoom: 14,
                        duration: 1000
                    });

                    // Save preferences
                    localStorage.setItem('trafficMapCenter', JSON.stringify([longitude, latitude]));
                    localStorage.setItem('trafficMapUserLocation', JSON.stringify(userPos));

                    setIsLocating(false);
                    resolve(userPos);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    alert("Could not detect your location. Please check browser permissions.");
                    setIsLocating(false);
                    reject(error);
                }
            );
        });
    };

    const performSearch = async (query) => {
        if (!query.trim()) return;
        try {
            const response = await ttServices.services.fuzzySearch({
                key: import.meta.env.VITE_TOMTOM_API_KEY,
                query: query,
            });
            setSearchResults(response.results);
        } catch (error) {
            console.error("Search failed:", error);
        }
    };

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery) {
                performSearch(searchQuery);
            } else {
                setSearchResults([]);
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleSearch = (e) => {
        e.preventDefault();
        performSearch(searchQuery);
    };

    const handleResultClick = (result) => {
        const position = {
            lat: result.position.lat,
            lng: result.position.lng || result.position.lon
        };
        const name = result.poi ? result.poi.name : result.address.freeformAddress.split(',')[0];
        const locationData = { position, name, fullAddress: result.address.freeformAddress };

        if (activeSearchField === 'destination') {
            setDestination(locationData);
            // We can manage these ephemeral markers better too, but standard adding is fine for now
            // as long as we don't duplicate them aggressively. 
            // Ideally we'd track destinationMarkerRef and startMarkerRef too, but let's stick to core request.

            new tt.Marker({ color: 'red' })
                .setLngLat(position)
                .setPopup(new tt.Popup({ offset: 35 }).setHTML(`<b>${name}</b>`))
                .addTo(mapInstance.current)
                .togglePopup();

            mapInstance.current.flyTo({ center: position, zoom: 14 });

        } else if (activeSearchField === 'start') {
            setStartLocation(locationData);
            new tt.Marker({ color: 'green' })
                .setLngLat(position)
                .setPopup(new tt.Popup({ offset: 35 }).setHTML(`<b>Start: ${name}</b>`))
                .addTo(mapInstance.current)
                .togglePopup();

            mapInstance.current.flyTo({ center: position, zoom: 14 });
        }

        setSearchResults([]);
        setSearchQuery('');
        setActiveSearchField(null);
    };

    const calculateRoute = async () => {
        if (!destination) return;

        let start = startLocation;
        setIsRouting(true);
        setRouteError('');

        // Fallback to user location
        if (!start || (start.isUserLocation && !start.position)) {
            try {
                const userPos = await handleLocateMe();
                start = { position: userPos, name: "My Location", isUserLocation: true };
                setStartLocation(start);
            } catch (e) {
                setRouteError("Detecting location failed. Please search for a start point manually.");
                setIsRouting(false);
                return;
            }
        }

        if (!start || !start.position) {
            setRouteError("Please set a Valid Start Location.");
            setIsRouting(false);
            return;
        }

        try {
            const response = await ttServices.services.calculateRoute({
                key: import.meta.env.VITE_TOMTOM_API_KEY,
                locations: `${start.position.lng},${start.position.lat}:${destination.position.lng},${destination.position.lat}`,
            });

            const geojson = response.toGeoJson();
            const summary = response.routes[0].summary;

            setRouteSummary(summary);

            if (mapInstance.current.getLayer('route')) {
                mapInstance.current.removeLayer('route');
                mapInstance.current.removeSource('route');
            }

            mapInstance.current.addLayer({
                id: 'route',
                type: 'line',
                source: {
                    type: 'geojson',
                    data: geojson
                },
                paint: {
                    'line-color': '#4a90e2',
                    'line-width': 6,
                    'line-opacity': 0.8
                }
            });

            const bounds = new tt.LngLatBounds();
            geojson.features[0].geometry.coordinates.forEach(point => {
                bounds.extend(point);
            });
            mapInstance.current.fitBounds(bounds, { padding: 50 });

        } catch (error) {
            console.error("Routing failed:", error);
            setRouteError("Could not calculate route. Ensure roads are available.");
        } finally {
            setIsRouting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.round(seconds / 60);
        if (mins < 60) return `${mins} min`;
        const hours = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        return `${hours} hr ${remainingMins} min`;
    };

    const formatDistance = (meters) => {
        return (meters / 1000).toFixed(1) + ' km';
    };

    const toggleMapStyle = () => {
        const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;
        if (!mapInstance.current || !apiKey) return;

        const newStyle = mapStyle === 'basic' ? 'satellite' : 'basic';
        const styleUrl = newStyle === 'satellite'
            ? `https://api.tomtom.com/style/1/style/*?map=2/basic_street-satellite&poi=2/poi_dynamic-satellite&key=${apiKey}`
            : `https://api.tomtom.com/map/1/style/22.2.1-9/basic_main.json?key=${apiKey}`;

        try {
            mapInstance.current.setStyle(styleUrl);
        } catch (e) {
            console.error("Error setting style:", e);
        }
        setMapStyle(newStyle);
    };

    return (
        <div className="relative w-full h-screen">
            <div ref={mapElement} className="w-full h-full" />

            {/* Search & Navigation Panel */}
            <div className="absolute top-4 left-4 z-10 w-96 flex flex-col gap-2">

                {/* Search Box */}
                {!destination && (
                    <div className="relative shadow-xl rounded-lg">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Search destination..."
                                className="w-full p-4 pl-12 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setActiveSearchField('destination');
                                }}
                            />
                            <Search className="absolute left-4 top-4 text-gray-500 w-5 h-5" />
                            <button type="submit" className="hidden">Search</button>
                        </form>
                        {searchResults.length > 0 && activeSearchField === 'destination' && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl max-h-60 overflow-y-auto border border-gray-100 z-50">
                                {searchResults.map((result, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleResultClick(result)}
                                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                                    >
                                        <div className="font-semibold text-gray-800">
                                            {result.poi ? result.poi.name : result.address.freeformAddress.split(',')[0]}
                                        </div>
                                        <div className="text-sm text-gray-500 truncate">
                                            {result.address.freeformAddress}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Directions Panel */}
                {destination && (
                    <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-100 animate-in fade-in slide-in-from-top-2 flex flex-col gap-4">

                        {/* Start Input */}
                        <div className="relative">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">From</label>
                            <div className="flex items-center bg-gray-50 rounded-md border border-gray-200">
                                <div className="p-2 text-green-600"><MapPin className="w-4 h-4" /></div>
                                <input
                                    type="text"
                                    className="w-full p-2 bg-transparent focus:outline-none text-sm font-medium"
                                    placeholder="Choose start location..."
                                    value={activeSearchField === 'start' ? searchQuery : (startLocation ? startLocation.name : '')}
                                    onFocus={() => {
                                        setActiveSearchField('start');
                                        setSearchQuery('');
                                    }}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setActiveSearchField('start');
                                    }}
                                />
                                <button
                                    title="Use My Location"
                                    disabled={isLocating}
                                    onClick={async () => {
                                        try {
                                            const pos = await handleLocateMe();
                                            // handleLocateMe already sets startLocation inside itself if needed for routing context
                                            // But let's explicitly set it here to be safe and clear or rely on the helper
                                        } catch (e) {
                                            console.error(e);
                                        }
                                    }}
                                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                                >
                                    {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
                                </button>
                                {startLocation && !startLocation.isUserLocation && (
                                    <button onClick={() => setStartLocation(null)} className="p-2 text-gray-400 hover:text-red-500">×</button>
                                )}
                            </div>

                            {/* Start Search Results */}
                            {searchResults.length > 0 && activeSearchField === 'start' && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg max-h-48 overflow-y-auto z-50 border">
                                    {searchResults.map((result, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleResultClick(result)}
                                            className="p-2 hover:bg-gray-50 cursor-pointer border-b text-sm"
                                        >
                                            <div className="font-medium">{result.poi ? result.poi.name : result.address.freeformAddress.split(',')[0]}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Destination Display */}
                        <div className="relative">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">To</label>
                            <div className="flex items-center bg-blue-50 rounded-md border border-blue-100">
                                <div className="p-2 text-red-600"><MapPin className="w-4 h-4" /></div>
                                <div className="w-full p-2 text-sm font-medium text-gray-800 truncate">
                                    {destination.name}
                                </div>
                                <button
                                    onClick={() => {
                                        setDestination(null);
                                        setRouteSummary(null);
                                        if (mapInstance.current.getLayer('route')) {
                                            mapInstance.current.removeLayer('route');
                                            mapInstance.current.removeSource('route');
                                        }
                                    }}
                                    className="p-2 text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        {/* Route Metrics */}
                        {routeSummary && (
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-100">
                                <div className="text-center">
                                    <div className="text-xs text-gray-500 uppercase font-bold">Distance</div>
                                    <div className="text-lg font-bold text-gray-900">{formatDistance(routeSummary.lengthInMeters)}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-gray-500 uppercase font-bold">Time</div>
                                    <div className="text-lg font-bold text-green-600">{formatTime(routeSummary.travelTimeInSeconds)}</div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={calculateRoute}
                                disabled={isRouting}
                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isRouting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Calculating...
                                    </>
                                ) : (
                                    <>
                                        <Navigation className="w-4 h-4" />
                                        {routeSummary ? 'Update Route' : 'Get Directions'}
                                    </>
                                )}
                            </button>
                        </div>

                        {routeError && (
                            <div className="text-xs text-amber-600 font-medium bg-amber-50 p-2 rounded border border-amber-100">
                                {routeError}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Map Controls */}
            <div className="absolute bottom-32 right-4 z-10 flex flex-col gap-2">
                <button
                    onClick={toggleMapStyle}
                    className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 group"
                    title={mapStyle === 'basic' ? "Switch to Satellite" : "Switch to Map"}
                >
                    <Layers className={`h-6 w-6 text-gray-600 group-hover:text-blue-600 transition-colors ${mapStyle === 'satellite' ? 'text-blue-600' : ''}`} />
                </button>
                <button
                    onClick={handleLocateMe}
                    disabled={isLocating}
                    className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 group flex items-center justify-center"
                    title="Locate Me"
                >
                    {isLocating ? <Loader2 className="h-6 w-6 text-blue-600 animate-spin" /> :
                        <Crosshair className="h-6 w-6 text-gray-600 group-hover:text-blue-600 transition-colors" />}
                </button>
            </div>
        </div>
    );
};

export default TrafficMap;
