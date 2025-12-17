import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center overflow-hidden"
            style={{
                backgroundImage: 'url("https://images.pexels.com/photos/1434273/pexels-photo-1434273.jpeg")'
            }}>

            <div className="bg-transparent flex flex-col md:flex-row items-center justify-between p-6 shadow-2xl rounded-2xl max-w-4xl w-full h-auto bg-black/60 backdrop-blur-md border border-blue-500/30 hover:shadow-2xl transition-transform transform hover:scale-105">

                {/* Left Column - Form */}
                <div className="w-full md:w-1/2 px-4">
                    <div className="flex items-center mb-4">
                        <i className="fas fa-traffic-light text-3xl text-blue-400 mr-3"></i>
                        <h1 className="font-bold text-3xl text-blue-400">Traffic System</h1>
                    </div>

                    <h1 className="font-bold text-2xl text-white mb-2">Welcome Back</h1>
                    <p className="text-white/80 mb-6">
                        Don't have an account?
                        <Link to="/register" className="text-blue-300 hover:underline hover:text-blue-200 ml-1 font-medium">
                            Sign Up
                        </Link>
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 text-red-300 text-sm p-2 rounded-lg flex items-center">
                                <i className="fas fa-exclamation-circle mr-2"></i>
                                {error}
                            </div>
                        )}

                        {/* Email Field */}
                        <div className="relative">
                            <label className="font-semibold text-white/90 mb-1 block text-sm">Email Address</label>
                            <div className="relative">
                                <i className="fas fa-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400"></i>
                                <input
                                    type="email"
                                    required
                                    className="glass-input pl-10"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="relative">
                            <label className="font-semibold text-white/90 mb-1 block text-sm">Password</label>
                            <div className="relative">
                                <i className="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400"></i>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="glass-input pl-10 pr-10"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 focus:outline-none z-10 transition-colors"
                                >
                                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                            </div>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            className="btn-login mt-2"
                        >
                            <i className="fas fa-sign-in-alt mr-2"></i>
                            Sign In
                        </button>
                    </form>
                </div>

                {/* Right Column - Traffic Image & Features */}
                <div className="hidden md:block md:w-1/2 h-full ml-6 pl-6 border-l border-white/10 py-4">
                    <div className="h-full flex flex-col justify-center">
                        <img
                            src="https://images.pexels.com/photos/14436283/pexels-photo-14436283.jpeg"
                            alt="Smart Traffic Control Center"
                            className="rounded-xl shadow-2xl w-full h-48 object-cover mb-6"
                        />

                        <div className="space-y-3">
                            <div className="flex items-start">
                                <div className="bg-blue-500/20 p-2 rounded-lg mr-3">
                                    <i className="fas fa-road text-blue-400 text-lg"></i>
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold text-sm">Real-time Updates</h3>
                                    <p className="text-white/60 text-xs">Live traffic conditions</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="bg-blue-500/20 p-2 rounded-lg mr-3">
                                    <i className="fas fa-bell text-blue-400 text-lg"></i>
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold text-sm">Smart Alerts</h3>
                                    <p className="text-white/60 text-xs">Incident notifications</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-blue-300 text-sm font-semibold mb-1">
                                Smooth Traffic, Safer Journeys
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add custom styles */}
            <style jsx>{`
                .glass-input {
                    width: 100%;
                    height: 44px;
                    background: rgba(0, 0, 0, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                    padding: 0 15px 0 40px;
                    color: white;
                    transition: all 0.2s ease;
                    outline: none;
                    font-size: 14px;
                }
                
                .glass-input:focus {
                    background: rgba(255, 255, 255, 0.12);
                    border: 1px solid rgba(59, 130, 246, 0.6);
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
                }
                
                .glass-input::placeholder {
                    color: rgba(255, 255, 255, 0.4);
                }
                
                .btn-login {
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    font-weight: bold;
                    color: white;
                    width: 100%;
                    border-radius: 8px;
                    height: 44px;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    outline: none;
                    border: none;
                    font-size: 16px;
                }
                
                .btn-login:hover {
                    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
                }
            `}</style>
        </div>
    );
};

export default Login;
