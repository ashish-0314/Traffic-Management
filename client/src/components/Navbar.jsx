import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import trafficLogo from '../assets/traffic-light.png';
import policeLogo from '../assets/police2.png';
import adminLogo from '../assets/Admin.png';
import useNotifications from '../hooks/useNotifications';
import { Bell, Check, X, AlertTriangle, FileText } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Notification Hook
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path ? 'text-blue-400 bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/5';
    };

    const handleNotificationClick = (notification) => {
        markAsRead(notification._id);
        setIsNotificationsOpen(false);
        if (notification.type === 'FINE') {
            navigate('/my-fines');
        } else if (notification.type === 'INCIDENT') {
            // navigate to map or incident view (for now map)
            navigate('/');
        }
    };

    return (
        <nav className="bg-black/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center group">
                            {user?.role === 'traffic_police' && (
                                <img src={policeLogo} alt="Police" className="w-10 h-10 ml-3 object-contain hover:scale-110" />
                            )}
                            {user?.role === 'admin' && (
                                <img src={adminLogo} alt="Admin" className="w-10 h-10 ml-3 object-contain hover:scale-110" />
                            )}
                            <div className="p-1 rounded-lg transition-transform group-hover:scale-110">
                                <img src={trafficLogo} alt="Traffic System" className="w-10 h-10 object-contain" />
                            </div>
                            <span className="ml-3 font-bold text-xl text-white tracking-tight">
                                Traffic<span className="text-blue-400">System</span>
                            </span>

                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-2">
                        <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive('/')}`}>
                            <i className="fas fa-map-marked-alt mr-2"></i>Map
                        </Link>

                        {user && (
                            <>
                                {(user.role === 'admin' || user.role === 'traffic_police') && (
                                    <Link to="/dashboard" className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive('/dashboard')}`}>
                                        <i className="fas fa-columns mr-2"></i>Dashboard
                                    </Link>
                                )}

                                {user.role === 'traffic_police' && (
                                    <Link to="/issue-fine" className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive('/issue-fine')}`}>
                                        <i className="fas fa-file-invoice-dollar mr-2"></i>Issue Fine
                                    </Link>
                                )}

                                {(user.role === 'admin' || user.role === 'traffic_police') && (
                                    <Link to="/admin/incidents" className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive('/admin/incidents')}`}>
                                        <i className="fas fa-clipboard-list mr-2"></i>View Reports
                                    </Link>
                                )}

                                {user.role === 'admin' && (
                                    <Link to="/admin/users" className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive('/admin/users')}`}>
                                        <i className="fas fa-users-cog mr-2"></i>Users
                                    </Link>
                                )}

                                {user.role === 'user' && (
                                    <Link to="/my-fines" className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive('/my-fines')}`}>
                                        <i className="fas fa-receipt mr-2"></i>My Fines
                                    </Link>
                                )}

                                <Link to="/report" className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive('/report')}`}>
                                    <i className="fas fa-exclamation-triangle mr-2"></i>Report Incident
                                </Link>
                            </>
                        )}

                        <div className="ml-4 flex items-center space-x-4 pl-4 border-l border-white/10">
                            {user ? (
                                <>
                                    {/* Notification Bell */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                            className="relative p-2 text-gray-300 hover:text-white transition-colors rounded-full hover:bg-white/5"
                                        >
                                            <Bell className="w-5 h-5" />
                                            {unreadCount > 0 && (
                                                <span className="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-600 rounded-full border-2 border-black">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </button>

                                        {isNotificationsOpen && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                                                <div className="absolute right-0 mt-2 w-80 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 ring-1 ring-black/5">
                                                    <div className="p-3 border-b border-white/10 flex justify-between items-center bg-white/5">
                                                        <h3 className="text-white font-semibold text-sm">Notifications</h3>
                                                        {unreadCount > 0 && (
                                                            <button onClick={markAllAsRead} className="text-xs text-blue-400 hover:text-blue-300 flex items-center">
                                                                <Check className="w-3 h-3 mr-1" /> Mark all read
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                                        {notifications.length === 0 ? (
                                                            <div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center">
                                                                <Bell className="w-8 h-8 mb-2 opacity-20" />
                                                                No notifications yet
                                                            </div>
                                                        ) : (
                                                            notifications.map((n) => (
                                                                <div
                                                                    key={n._id}
                                                                    onClick={() => handleNotificationClick(n)}
                                                                    className={`p-4 border-b border-white/5 hover:bg-white/10 transition-colors cursor-pointer group flex items-start gap-3 ${!n.isRead ? 'bg-blue-500/5' : ''}`}
                                                                >
                                                                    <div className={`mt-0.5 p-1.5 rounded-full ${n.type === 'FINE' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                                        {n.type === 'FINE' ? <FileText className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className={`text-sm ${!n.isRead ? 'text-white font-medium' : 'text-gray-400'}`}>
                                                                            {n.message}
                                                                        </p>
                                                                        <span className="text-[10px] text-gray-500 mt-1 block">
                                                                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </span>
                                                                    </div>
                                                                    {!n.isRead && (
                                                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                                                                    )}
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <Link to="/profile" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/50">
                                            {user.profilePicture ? (
                                                <img src={user.profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <span className="text-blue-400 font-bold text-xs">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-sm font-medium hidden lg:block">{user.name}</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border border-red-500/30"
                                    >
                                        <i className="fas fa-sign-out-alt mr-1"></i> Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-gray-300 hover:text-white font-medium px-3 py-2 text-sm transition-colors">
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex md:hidden items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-300 hover:text-white p-2 rounded-md focus:outline-none"
                        >
                            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-gray-900 border-b border-white/10">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link to="/" className="block text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md text-base font-medium">
                            <i className="fas fa-map-marked-alt w-6"></i> Map
                        </Link>

                        {user && (
                            <>
                                {(user.role === 'admin' || user.role === 'traffic_police') && (
                                    <Link to="/dashboard" className="block text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md text-base font-medium">
                                        <i className="fas fa-columns w-6"></i> Dashboard
                                    </Link>
                                )}

                                {user.role === 'traffic_police' && (
                                    <Link to="/issue-fine" className="block text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md text-base font-medium">
                                        <i className="fas fa-file-invoice-dollar w-6"></i> Issue Fine
                                    </Link>
                                )}

                                {(user.role === 'admin' || user.role === 'traffic_police') && (
                                    <Link to="/admin/incidents" className="block text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md text-base font-medium">
                                        <i className="fas fa-clipboard-list w-6"></i> View Reports
                                    </Link>
                                )}

                                {user.role === 'admin' && (
                                    <Link to="/admin/users" className="block text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md text-base font-medium">
                                        <i className="fas fa-users-cog w-6"></i> Users
                                    </Link>
                                )}

                                {user.role === 'user' && (
                                    <Link to="/my-fines" className="block text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md text-base font-medium">
                                        <i className="fas fa-receipt w-6"></i> My Fines
                                    </Link>
                                )}

                                <Link to="/report" className="block text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md text-base font-medium">
                                    <i className="fas fa-exclamation-triangle w-6"></i> Report Incident
                                </Link>

                                <div className="border-t border-white/10 my-2 pt-2">
                                    {/* Mobile Notification Item */}
                                    <button
                                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                        className="w-full text-left block text-gray-300 hover:bg-white/10 px-3 py-2 rounded-md text-base font-medium flex items-center justify-between"
                                    >
                                        <span><Bell className="w-5 h-5 inline mr-2" /> Notifications</span>
                                        {unreadCount > 0 && (
                                            <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
                                        )}
                                    </button>
                                    {/* Mobile Notification List */}
                                    {isNotificationsOpen && (
                                        <div className="bg-black/40 rounded-lg mx-3 mb-2 max-h-60 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-3 text-center text-gray-500 text-sm">No notifications</div>
                                            ) : (
                                                notifications.map(n => (
                                                    <div
                                                        key={n._id}
                                                        onClick={() => handleNotificationClick(n)}
                                                        className={`p-3 border-b border-white/5 text-sm ${!n.isRead ? 'text-white bg-white/5' : 'text-gray-400'}`}
                                                    >
                                                        {n.message}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}

                                    <Link to="/profile" className="block text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md text-base font-medium">
                                        <i className="fas fa-user w-6"></i> Profile ({user.name})
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left block text-red-400 hover:bg-red-500/10 px-3 py-2 rounded-md text-base font-medium"
                                    >
                                        <i className="fas fa-sign-out-alt w-6"></i> Logout
                                    </button>
                                </div>
                            </>
                        )}

                        {!user && (
                            <div className="border-t border-white/10 my-2 pt-2 flex space-x-2 px-3">
                                <Link to="/login" className="flex-1 text-center text-gray-300 hover:bg-white/10 px-3 py-2 rounded-md text-base font-medium border border-white/20">
                                    Login
                                </Link>
                                <Link to="/register" className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-base font-medium">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
