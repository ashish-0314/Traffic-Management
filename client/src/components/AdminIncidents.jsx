import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, XCircle, FileText, ClipboardList } from 'lucide-react';

const AdminIncidents = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchIncidents = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${API_URL}/api/incidents`, config);
            setIncidents(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncidents();
    }, [token]);

    const handleUpdateStatus = async (id, status) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.patch(`${API_URL}/api/incidents/${id}/status`, { status }, config);
            fetchIncidents(); // Refresh
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleIssueFine = (email, vehiclePlate) => {
        // Navigate to issue fine page with pre-filled details
        navigate('/issue-fine', { state: { email, vehiclePlate } });
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="text-white text-xl">Loading Incidents...</div>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center overflow-hidden"
            style={{
                backgroundImage: 'url("https://images.pexels.com/photos/2962589/pexels-photo-2962589.jpeg")'
            }}>

            <div className="bg-black/80 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl max-w-7xl w-full h-[90vh] flex flex-col p-6 overflow-hidden">

                <div className="flex items-center mb-6 pb-4 border-b border-white/10">
                    <ClipboardList className="text-blue-400 w-8 h-8 mr-3" />
                    <h1 className="text-3xl font-bold text-white">Incident Reports</h1>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid gap-6">
                        {incidents.map((incident) => (
                            <div key={incident._id} className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-6 border border-white/10 flex flex-col md:flex-row gap-6 group">
                                {/* Media Section */}
                                <div className="w-full md:w-1/3">
                                    {incident.mediaUrl ? (
                                        incident.mediaUrl.endsWith('.mp4') || incident.mediaUrl.endsWith('.mov') ? (
                                            <video src={incident.mediaUrl} controls className="rounded-lg w-full h-48 object-cover border border-white/20" />
                                        ) : (
                                            <img src={incident.mediaUrl} alt="Evidence" className="rounded-lg w-full h-48 object-cover border border-white/20" />
                                        )
                                    ) : (
                                        <div className="bg-white/5 h-48 rounded-lg flex items-center justify-center text-white/50 border border-white/10">
                                            No Media
                                        </div>
                                    )}
                                </div>

                                {/* Details Section */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <h2 className="text-xl font-bold text-white">{incident.type}</h2>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${incident.status === 'Verified' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                            incident.status === 'Rejected' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                                'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                            }`}>
                                            {incident.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-300">{incident.description}</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-400">
                                        {incident.vehiclePlate && (
                                            <p>
                                                <span className="font-semibold text-white/70">Vehicle Plate:</span> <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white ml-2">{incident.vehiclePlate}</span>
                                            </p>
                                        )}
                                        <p>
                                            <span className="font-semibold text-white/70">Date:</span> <span className="text-white ml-2">{new Date(incident.createdAt).toLocaleDateString()}</span>
                                        </p>
                                        <p className="md:col-span-2">
                                            <span className="font-semibold text-white/70">Reported By:</span> <span className="text-white ml-2">{incident.reportedBy?.name || 'Unknown'} ({incident.reportedBy?.email || 'No Email'})</span>
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-white/10">
                                        <button
                                            onClick={() => handleUpdateStatus(incident._id, 'Verified')}
                                            className="flex items-center bg-green-600/80 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" /> Verify
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(incident._id, 'Rejected')}
                                            className="flex items-center bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                                        >
                                            <XCircle className="w-4 h-4 mr-2" /> Reject
                                        </button>

                                        <button
                                            onClick={() => handleIssueFine('', incident.vehiclePlate)}
                                            className="flex items-center bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 ml-auto border border-red-500/50"
                                        >
                                            <FileText className="w-4 h-4 mr-2" /> Issue Fine
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
            `}</style>
        </div>
    );
};

export default AdminIncidents;
