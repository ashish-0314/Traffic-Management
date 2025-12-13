import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { FileText, Mail, Car, DollarSign, AlertTriangle } from 'lucide-react';

const IssueFine = () => {
    const { token } = useAuth();
    const location = useLocation();
    const [formData, setFormData] = useState({
        email: '',
        vehicleNumber: '',
        amount: '',
        reason: ''
    });

    useEffect(() => {
        if (location.state?.email) {
            setFormData(prev => ({ ...prev, email: location.state.email }));
        }
        if (location.state?.vehiclePlate) {
            setFormData(prev => ({ ...prev, vehicleNumber: location.state.vehiclePlate }));
        }
    }, [location.state]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            await axios.post('http://localhost:5000/api/fines', formData, config);
            setMessage('Fine issued successfully!');
            setTimeout(() => setMessage(''), 3000);
            setFormData({ email: '', vehicleNumber: '', amount: '', reason: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to issue fine');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center overflow-hidden"
            style={{
                backgroundImage: 'url("https://images.pexels.com/photos/2962589/pexels-photo-2962589.jpeg")'
            }}>

            <div className="bg-black/60 backdrop-blur-md border border-red-500/30 shadow-2xl rounded-2xl max-w-lg w-full p-8 transition-transform hover:scale-[1.01]">
                <div className="flex items-center mb-6 pb-4 border-b border-white/10">
                    <AlertTriangle className="text-red-500 w-8 h-8 mr-3" />
                    <h2 className="text-2xl font-bold text-white">Issue Traffic Fine</h2>
                </div>

                {message && <div className="mb-4 bg-green-500/20 text-green-300 p-3 rounded-lg border border-green-500/30 text-sm font-medium">{message}</div>}
                {error && <div className="mb-4 bg-red-500/20 text-red-300 p-3 rounded-lg border border-red-500/30 text-sm font-medium">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-white mb-1 ml-1">VIOLATOR VEHICLE NUMBER</label>
                        <div className="relative">
                            <Car className="absolute left-3 top-3 text-white w-4 h-4" />
                            <input
                                type="text"
                                name="vehicleNumber"
                                value={formData.vehicleNumber}
                                onChange={handleChange}
                                className="glass-input pl-10"
                                placeholder="MH-12-AB-1234"
                            />
                        </div>
                    </div>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-white/10"></div>
                        <span className="flex-shrink-0 mx-4 text-white/50 text-xs uppercase font-bold">OR</span>
                        <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-white mb-1 ml-1">VIOLATOR EMAIL</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-white w-4 h-4" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="glass-input pl-10"
                                placeholder="user@example.com"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-white mb-1 ml-1">AMOUNT (₹)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-3 text-white w-4 h-4" />
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                required
                                className="glass-input pl-10"
                                placeholder="500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-white mb-1 ml-1">REASON / VIOLATION</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 text-white w-4 h-4" />
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                required
                                className="glass-input pl-10 py-2 h-auto"
                                rows="3"
                                placeholder="Speeding, Red light violation..."
                            ></textarea>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-red-900/40 transition-all transform hover:-translate-y-0.5"
                    >
                        Issue Fine
                    </button>
                </form>
            </div>

            <style jsx>{`
                .glass-input {
                    width: 100%;
                    height: 42px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    padding-right: 12px;
                    color: white;
                    outline: none;
                    font-size: 14px;
                    transition: all 0.2s;
                }
                textarea.glass-input {
                    height: auto;
                }
                .glass-input:focus {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: #ef4444;
                    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
                }
                .glass-input::placeholder { color: rgba(255, 255, 255, 0.3); }
            `}</style>
        </div>
    );
};

export default IssueFine;
