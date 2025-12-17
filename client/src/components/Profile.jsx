import React, { useState, useEffect } from 'react';
import { Camera, Save, Lock, User, UserCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user: authUser } = useAuth();
    const [activeTab, setActiveTab] = useState('details');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        gender: '',
        age: '',
        address: '',
        licenseNumber: '',
        vehicleNumber: '',
        profilePicture: ''
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (authUser) {
            fetchProfile();
        }
    }, [authUser]);

    useEffect(() => {
        if (message.text && message.type === 'success') {
            const timer = setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${API_URL}/api/users/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data;
            setFormData({
                name: data.name || '',
                email: data.email || '',
                gender: data.gender || '',
                age: data.age || '',
                address: data.address || '',
                licenseNumber: data.licenseNumber || '',
                vehicleNumber: data.vehicleNumber || '',
                profilePicture: data.profilePicture || ''
            });
            setPreviewUrl(data.profilePicture || null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const data = new FormData();

            data.append('name', formData.name);
            data.append('email', formData.email);
            if (formData.gender) data.append('gender', formData.gender);
            if (formData.age) data.append('age', formData.age);
            if (formData.address) data.append('address', formData.address);
            if (formData.licenseNumber) data.append('licenseNumber', formData.licenseNumber);
            if (formData.vehicleNumber) data.append('vehicleNumber', formData.vehicleNumber);

            if (selectedFile) {
                data.append('profilePicture', selectedFile);
            }

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.put(`${API_URL}/api/users/profile`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Update local storage user
            const updatedUser = { ...authUser, ...res.data };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            fetchProfile();
            setSelectedFile(null);
        } catch (error) {
            console.error(error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update profile'
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.put(`${API_URL}/api/users/profile/password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage({ type: 'success', text: 'Password updated successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update password'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center overflow-hidden"
            style={{
                backgroundImage: 'url("https://cdn.pixabay.com/photo/2018/05/09/08/15/train-3384786_1280.jpg")'
            }}>

            <div className="bg-black/60 backdrop-blur-md border border-blue-500/30 shadow-2xl rounded-2xl max-w-4xl w-full p-6">

                <div className="flex items-center mb-8 pb-4 border-b border-white/10">
                    <UserCircle className="text-blue-400 w-8 h-8 mr-3" />
                    <h2 className="text-3xl font-bold text-white">User Profile</h2>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10 mb-8">
                    <button
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'details' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => setActiveTab('details')}
                    >
                        Personal Details
                    </button>
                    <button
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'password' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => setActiveTab('password')}
                    >
                        Change Password
                    </button>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                        {message.text}
                    </div>
                )}

                {activeTab === 'details' ? (
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        {/* Profile Picture Section */}
                        <div className="flex flex-col items-center mb-4">
                            <div className="relative w-24 h-24 mb-3">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500/50 bg-white/5 flex items-center justify-center">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-12 h-12 text-white/30" />
                                    )}
                                </div>
                                <label htmlFor="profile-upload" className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 p-1.5 rounded-full cursor-pointer transition shadow-lg text-white ring-2 ring-black">
                                    <Camera className="w-3.5 h-3.5" />
                                </label>
                                <input
                                    id="profile-upload"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <p className="text-[10px] text-blue-300/70">Click icon to change photo</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-blue-300 mb-1 ml-1">NAME</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="glass-input"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-blue-300 mb-1 ml-1">EMAIL</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="glass-input opacity-60 cursor-not-allowed"
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-blue-300 mb-1 ml-1">GENDER</label>
                                <select
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    className="glass-input appearance-none bg-transparent"
                                >
                                    <option value="" className="text-black">Select Gender</option>
                                    <option value="Male" className="text-black">Male</option>
                                    <option value="Female" className="text-black">Female</option>
                                    <option value="Other" className="text-black">Other</option>
                                    <option value="Prefer not to say" className="text-black">Prefer not to say</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-blue-300 mb-1 ml-1">AGE</label>
                                <input
                                    type="number"
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    className="glass-input"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-blue-300 mb-1 ml-1">ADDRESS</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    rows="2"
                                    className="glass-input py-2 h-auto"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-blue-300 mb-1 ml-1">LICENSE NUMBER</label>
                                <input
                                    type="text"
                                    value={formData.licenseNumber}
                                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                    className="glass-input"
                                />
                            </div>
                            {authUser && authUser.role !== 'traffic_police' && (
                                <div>
                                    <label className="block text-xs font-semibold text-blue-300 mb-1 ml-1">VEHICLE NUMBER</label>
                                    <input
                                        type="text"
                                        value={formData.vehicleNumber}
                                        onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                                        className="glass-input"
                                        placeholder="e.g. MH02AB1234"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                            >
                                {loading ? 'Saving...' : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md mx-auto">
                        <div>
                            <label className="block text-xs font-semibold text-blue-300 mb-1 ml-1">CURRENT PASSWORD</label>
                            <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                className="glass-input"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-blue-300 mb-1 ml-1">NEW PASSWORD</label>
                            <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className="glass-input"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-blue-300 mb-1 ml-1">CONFIRM PASSWORD</label>
                            <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                className="glass-input"
                                required
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full justify-center"
                            >
                                {loading ? 'Updating...' : <><Lock className="h-4 w-4 mr-2" /> Update Password</>}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <style jsx>{`
                .glass-input {
                    display: block;
                    width: 100%;
                    height: 38px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    padding: 0 12px;
                    color: white;
                    outline: none;
                    font-size: 13px;
                    transition: all 0.2s;
                }
                .glass-input:focus {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
                }
                .btn-primary {
                    display: inline-flex;
                    align-items: center;
                    padding: 10px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    color: white;
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    transition: transform 0.2s;
                    border: none;
                }
                .btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
                }
                .btn-primary:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default Profile;
