import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Map, Shield, LogOut, Menu, X } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <Shield className="h-8 w-8 text-blue-600" />
                            <span className="ml-2 font-bold text-xl text-gray-800">TrafficSys</span>
                        </Link>
                    </div>

                    <div className="hidden sm:flex sm:items-center sm:ml-6 space-x-4">
                        <Link to="/" className="p-2 text-gray-500 hover:text-blue-600 transition">
                            <Map className="h-6 w-6 inline-block mr-1" /> Map
                        </Link>

                        {user ? (
                            <>
                                {(user.role === 'admin' || user.role === 'traffic_police') && (
                                    <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium px-3 py-2">
                                        Dashboard
                                    </Link>
                                )}
                                <Link to="/report" className="text-red-600 hover:text-red-700 font-medium px-3 py-2 bg-red-50 rounded-md transition">
                                    Report Incident
                                </Link>
                                <span className="text-gray-700 font-medium">Hello, {user.name}</span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-200 flex items-center"
                                >
                                    <LogOut className="h-4 w-4 mr-1" /> Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium px-3 py-2">
                                    Login
                                </Link>
                                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center sm:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        >
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="sm:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link to="/" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300">
                            Home
                        </Link>
                        {!user && (
                            <>
                                <Link to="/login" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300">
                                    Login
                                </Link>
                                <Link to="/register" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300">
                                    Register
                                </Link>
                            </>
                        )}
                        {user && (
                            <button onClick={handleLogout} className="w-full text-left block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-red-500 hover:text-red-700 hover:bg-gray-50 hover:border-gray-300">
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
