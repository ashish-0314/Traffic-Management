import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Camera, Image, X, Upload, MapPin } from 'lucide-react';

const ReportIncident = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        type: 'Accident',
        description: '',
        lat: '',
        lng: '',
        address: '',
        vehiclePlate: ''
    });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleLocationDetect = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        address: 'Detected Location'
                    }));
                },
                (err) => {
                    setError('Unable to retrieve location');
                }
            );
        } else {
            setError('Geolocation is not supported by this browser.');
        }
    };

    const startCamera = async () => {
        setCameraOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error(err);
            setError('Could not access camera');
            setCameraOpen(false);
        }
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);

            canvas.toBlob((blob) => {
                const capturedFile = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
                setFile(capturedFile);
                setPreview(URL.createObjectURL(capturedFile));
                stopCamera();
            }, 'image/jpeg');
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setCameraOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            const data = new FormData();
            data.append('type', formData.type);
            data.append('description', formData.description);
            data.append('vehiclePlate', formData.vehiclePlate);
            data.append('location', JSON.stringify({
                lat: parseFloat(formData.lat),
                lng: parseFloat(formData.lng),
                address: formData.address
            }));
            if (file) {
                data.append('media', file);
            }

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.post(`${API_URL}/api/incidents`, data, config);
            navigate('/');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to submit report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center overflow-hidden"
            style={{
                backgroundImage: 'url("https://images.pexels.com/photos/2962589/pexels-photo-2962589.jpeg")'
            }}>

            <div className="bg-transparent flex flex-col md:flex-row items-stretch justify-between p-6 shadow-2xl rounded-2xl max-w-5xl w-full h-auto bg-black/60 backdrop-blur-md border border-blue-500/30 hover:shadow-2xl transition-transform transform hover:scale-[1.01]">

                {/* Left Column - Form */}
                <div className="w-full md:w-3/5 pr-0 md:pr-6 flex flex-col justify-center">
                    <div className="flex items-center mb-4">
                        <i className="fas fa-exclamation-triangle text-3xl text-red-500 mr-3"></i>
                        <h2 className="font-bold text-2xl text-white">Report Incident</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-500/20 text-red-300 text-sm p-3 rounded-lg border border-red-500/40">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Incident Type */}
                            <div className="relative">
                                <label className="block text-xs font-semibold text-white mb-1 ml-1">INCIDENT TYPE</label>
                                <div className="relative">
                                    <i className="fas fa-list absolute left-3 top-3 text-white text-xs"></i>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="glass-input appearance-none"
                                    >
                                        <option value="Accident" className="text-black">Accident</option>
                                        <option value="Crime" className="text-black">Crime</option>
                                        <option value="Speeding" className="text-black">Speeding</option>
                                        <option value="RedLightViolation" className="text-black">Red Light Violation</option>
                                        <option value="Congestion" className="text-black">Congestion</option>
                                        <option value="Other" className="text-black">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Vehicle Plate */}
                            <div className="relative">
                                <label className="block text-xs font-semibold text-white mb-1 ml-1">OFFENDER VEHICLE</label>
                                <div className="relative">
                                    <i className="fas fa-car absolute left-3 top-3 text-white text-xs"></i>
                                    <input
                                        type="text"
                                        name="vehiclePlate"
                                        value={formData.vehiclePlate}
                                        onChange={handleChange}
                                        className="glass-input"
                                        placeholder="MH-12-AB-1234 (Optional)"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="relative">
                            <label className="block text-xs font-semibold text-white mb-1 ml-1">DESCRIPTION</label>
                            <div className="relative">
                                <i className="fas fa-pen absolute left-3 top-3 text-white text-xs"></i>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    className="glass-input py-2 h-24 resize-none"
                                    placeholder="Describe the incident details..."
                                ></textarea>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                            <label className="block text-xs font-semibold text-white mb-2">LOCATION</label>
                            <div className="flex gap-2 mb-2">
                                <div className="relative w-1/2">
                                    <i className="fas fa-map-marker-alt absolute left-3 top-3 text-white text-xs"></i>
                                    <input
                                        name="lat"
                                        type="number"
                                        placeholder="Lat"
                                        value={formData.lat}
                                        onChange={handleChange}
                                        required
                                        className="glass-input"
                                    />
                                </div>
                                <div className="relative w-1/2">
                                    <i className="fas fa-map-marker-alt absolute left-3 top-3 text-white text-xs"></i>
                                    <input
                                        name="lng"
                                        type="number"
                                        placeholder="Lng"
                                        value={formData.lng}
                                        onChange={handleChange}
                                        required
                                        className="glass-input"
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleLocationDetect}
                                className="flex items-center text-blue-900 font-semibold hover:text-white transition-colors"
                            >
                                <MapPin size={14} className="mr-1" /> Detect My Current Location
                            </button>
                        </div>

                        {/* Evidence Upload */}
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-white ml-1">EVIDENCE (OPTIONAL)</label>

                            {preview ? (
                                <div className="relative w-full h-32 bg-black/40 rounded-lg overflow-hidden border border-white/20 group">
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    <button
                                        type="button"
                                        onClick={() => { setFile(null); setPreview(null); }}
                                        className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-1 rounded-full text-xs transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex space-x-3">
                                    <label className="flex-1 flex flex-col items-center justify-center px-4 py-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 hover:border-blue-500/50 transition-all group">
                                        <Upload className="w-6 h-6 text-white mb-1 group-hover:scale-110 transition-transform" />
                                        <span className="text-xs text-white/70">Upload File</span>
                                        <input type='file' className="hidden" onChange={handleFileChange} accept="image/*,video/*" />
                                    </label>

                                    <button
                                        type="button"
                                        onClick={startCamera}
                                        className="flex-1 flex flex-col items-center justify-center px-4 py-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 hover:border-green-500/50 transition-all group"
                                    >
                                        <Camera className="w-6 h-6 text-green-400 mb-1 group-hover:scale-110 transition-transform" />
                                        <span className="text-xs text-white/70">Open Camera</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-submit mt-4"
                        >
                            {loading ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </form>
                </div>

                {/* Right Column - Image */}
                <div className="hidden md:block md:w-2/5 border-l border-white/10 pl-6 flex flex-col justify-center">
                    <div className="relative h-full min-h-[400px] rounded-xl overflow-hidden shadow-lg">
                        <img
                            src="https://images.pexels.com/photos/210182/pexels-photo-210182.jpeg"
                            alt="Traffic Incident"
                            className="absolute inset-0 w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                            <h3 className="text-white font-bold text-xl mb-2">Help Us Keep Roads Safe</h3>
                            <p className="text-white/70 text-sm">
                                Reporting incidents helps traffic authorities respond faster and prevent further congestion.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Camera Modal Overlay */}
            {cameraOpen && (
                <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-gray-900 p-2 rounded-xl relative w-full max-w-lg border border-white/20 shadow-2xl">
                        <button onClick={stopCamera} className="absolute -top-10 right-0 p-2 text-white/70 hover:text-white">
                            <X size={24} />
                        </button>
                        <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg bg-black" />
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="flex justify-center mt-4 pb-2">
                            <button onClick={capturePhoto} className="bg-white rounded-full p-4 hover:scale-110 transition-transform shadow-lg shadow-white/20">
                                <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white"></div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .glass-input {
                    width: 100%;
                    height: 42px;
                    background: rgba(0, 0, 0, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                    padding: 0 12px 0 36px;
                    color: white;
                    outline: none;
                    font-size: 14px;
                    transition: all 0.2s;
                }
                textarea.glass-input {
                    height: auto;
                    padding-top: 10px;
                }
                .glass-input:focus {
                    background: rgba(0, 0, 0, 0.6);
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
                }
                .glass-input::placeholder { color: rgba(255, 255, 255, 0.4); }
                
                .btn-submit {
                    background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
                    color: white;
                    width: 100%;
                    border-radius: 8px;
                    height: 44px;
                    font-weight: 600;
                    font-size: 15px;
                    transition: transform 0.2s, box-shadow 0.2s;
                    border: none;
                    cursor: pointer;
                }
                .btn-submit:hover { 
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                }
                .btn-submit:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default ReportIncident;
