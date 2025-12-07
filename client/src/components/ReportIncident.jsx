import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ReportIncident = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        type: 'Accident',
        description: '',
        lat: '',
        lng: '',
        address: '',
        mediaUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLocationDetect = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData({
                        ...formData,
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        address: 'Detected Location' // You could use geocoding API here
                    });
                },
                (err) => {
                    setError('Unable to retrieve location');
                }
            );
        } else {
            setError('Geolocation is not supported by this browser.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            const incidentData = {
                type: formData.type,
                location: {
                    lat: parseFloat(formData.lat),
                    lng: parseFloat(formData.lng),
                    address: formData.address
                },
                description: formData.description,
                mediaUrl: formData.mediaUrl
            };

            await axios.post('http://localhost:5000/api/incidents', incidentData, config);
            navigate('/'); // Redirect to map/home
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
                <h2 className="text-2xl font-bold mb-4">Report an Incident</h2>
                {error && <div className="mb-4 text-red-500">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700">Incident Type</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2 border"
                        >
                            <option value="Accident">Accident</option>
                            <option value="Crime">Crime</option>
                            <option value="Speeding">Speeding</option>
                            <option value="RedLightViolation">Red Light Violation</option>
                            <option value="Congestion">Congestion</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2 border"
                            rows="3"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-gray-700">Location</label>
                        <div className="flex space-x-2 mb-2">
                            <input
                                name="lat"
                                type="number"
                                step="any"
                                placeholder="Latitude"
                                value={formData.lat}
                                onChange={handleChange}
                                required
                                className="w-1/2 rounded-md border-gray-300 shadow-sm p-2 border"
                            />
                            <input
                                name="lng"
                                type="number"
                                step="any"
                                placeholder="Longitude"
                                value={formData.lng}
                                onChange={handleChange}
                                required
                                className="w-1/2 rounded-md border-gray-300 shadow-sm p-2 border"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleLocationDetect}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Detect My Location
                        </button>
                    </div>

                    <div>
                        <label className="block text-gray-700">Media URL (Image/Video)</label>
                        <input
                            name="mediaUrl"
                            type="url"
                            value={formData.mediaUrl}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2 border"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportIncident;
