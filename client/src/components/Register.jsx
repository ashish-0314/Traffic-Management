import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        licenseNumber: '',
        vehicleNumber: '',
        role: 'user',
        gender: '',
        age: '',
        address: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        try {
            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                licenseNumber: formData.licenseNumber,
                vehicleNumber: formData.vehicleNumber,
                role: formData.role,
                gender: formData.gender,
                age: formData.age,
                address: formData.address
            });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="h-screen flex items-center justify-center p-4 bg-cover bg-center overflow-hidden"
            style={{
                backgroundImage: 'url("https://images.pexels.com/photos/2962589/pexels-photo-2962589.jpeg")'
            }}>

            <div className="bg-transparent flex flex-col md:flex-row items-center justify-between p-6 shadow-2xl rounded-2xl max-w-5xl w-full h-auto max-h-screen bg-black/60 backdrop-blur-md border border-blue-500/30 hover:shadow-2xl transition-transform transform hover:scale-105">

                {/* Left Column - Form */}
                <div className="w-full md:w-3/5 h-full pr-4">
                    <div className="flex items-center mb-2">
                        <i className="fas fa-traffic-light text-2xl text-blue-400 mr-2"></i>
                        <h2 className="font-bold text-xl text-white">Create Account</h2>
                    </div>

                    <p className="text-white/70 mb-3 text-sm">
                        Start your journey with us. <Link to="/login" className="text-blue-300 hover:text-white transition">Sign In</Link>
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        {error && (
                            <div className="bg-red-500/20 text-red-300 text-xs p-2 rounded border border-red-500/40">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            {/* Name */}
                            <div className="relative">
                                <i className="fas fa-user absolute left-3 top-3 text-blue-400 text-xs"></i>
                                <input name="name" type="text" required className="glass-input" placeholder="Full Name" value={formData.name} onChange={handleChange} />
                            </div>
                            {/* Email */}
                            <div className="relative">
                                <i className="fas fa-envelope absolute left-3 top-3 text-blue-400 text-xs"></i>
                                <input name="email" type="email" required className="glass-input" placeholder="Email" value={formData.email} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {/* Password */}
                            <div className="relative">
                                <i className="fas fa-lock absolute left-3 top-3 text-blue-400 text-xs"></i>
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="glass-input pr-8"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-white/60 hover:text-white focus:outline-none"
                                >
                                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                                </button>
                            </div>
                            {/* Confirm Password */}
                            <div className="relative">
                                <i className="fas fa-lock absolute left-3 top-3 text-blue-400 text-xs"></i>
                                <input
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    className="glass-input pr-8"
                                    placeholder="Confirm"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-2.5 text-white/60 hover:text-white focus:outline-none"
                                >
                                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {/* License */}
                            <div className="relative">
                                <i className="fas fa-id-card absolute left-3 top-3 text-blue-400 text-xs"></i>
                                <input name="licenseNumber" type="text" className="glass-input" placeholder="License (Opt)" value={formData.licenseNumber} onChange={handleChange} />
                            </div>
                            {/* Vehicle */}
                            <div className="relative">
                                <i className="fas fa-car absolute left-3 top-3 text-blue-400 text-xs"></i>
                                <input name="vehicleNumber" type="text" className="glass-input" placeholder="Vehicle No." value={formData.vehicleNumber} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {/* Gender */}
                            <div className="relative">
                                <select name="gender" value={formData.gender} onChange={handleChange} required className="glass-input appearance-none">
                                    <option value="" disabled className="text-black">Gender</option>
                                    <option value="Male" className="text-black">Male</option>
                                    <option value="Female" className="text-black">Female</option>
                                    <option value="Other" className="text-black">Other</option>
                                </select>
                            </div>
                            {/* Age */}
                            <div className="relative">
                                <input name="age" type="number" required className="glass-input" placeholder="Age" value={formData.age} onChange={handleChange} min="18" max="100" />
                            </div>
                            {/* Role */}
                            <div className="relative">
                                <select name="role" value={formData.role} onChange={handleChange} className="glass-input appearance-none">
                                    <option value="user" className="text-black">User</option>
                                    <option value="traffic_police" className="text-black">Police</option>
                                </select>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="relative">
                            <i className="fas fa-map-marker-alt absolute left-3 top-3 text-blue-400 text-xs"></i>
                            <input name="address" type="text" required className="glass-input" placeholder="Address" value={formData.address} onChange={handleChange} />
                        </div>

                        <button type="submit" className="btn-register mt-2">
                            Create Account
                        </button>
                    </form>
                </div>

                {/* Right Column - Image */}
                <div className="hidden md:block md:w-2/5 h-full ml-6 pl-6 border-l border-white/10 flex flex-col justify-center">
                    <img
                        src="https://images.pexels.com/photos/1051075/pexels-photo-1051075.jpeg"
                        alt="Traffic"
                        className="rounded-xl shadow-lg w-full h-64 object-cover mb-4 opacity-90"
                    />
                    <div className="text-center">
                        <h3 className="text-xl text-blue-600 font-bold mb-1">Smart Traffic Management</h3>
                        <p className="text-white">Efficient, Safe, Reliable.</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .glass-input {
                    width: 100%;
                    height: 38px; /* Compact height */
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 6px;
                    padding: 0 10px 0 32px; /* Adjusted padding */
                    color: white;
                    outline: none;
                    font-size: 13px;
                }
                .glass-input:focus {
                    background: rgba(255, 255, 255, 0.15);
                    border-color: #3b82f6;
                }
                .glass-input::placeholder { color: rgba(255, 255, 255, 0.4); }
                .btn-register {
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    color: white;
                    width: 100%;
                    border-radius: 6px;
                    height: 40px;
                    font-weight: 600;
                    font-size: 14px;
                    transition: transform 0.2s;
                }
                .btn-register:hover { transform: translateY(-1px); }
            `}</style>
        </div>
    );
};

export default Register;