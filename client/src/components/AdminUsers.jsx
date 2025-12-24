import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Shield, User, Car, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const AdminUsers = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    search,
                    role: roleFilter,
                    page: currentPage,
                    limit: 10
                }
            };
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${API_URL}/api/users`, config);
            setUsers(res.data.users);
            setTotalPages(res.data.pages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [token, roleFilter, currentPage]); // auto-fetch on filter change

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1); // Reset to first page
        fetchUsers();
    };

    const handleIssueFine = (user) => {
        navigate('/issue-fine', {
            state: {
                email: user.email,
                vehiclePlate: user.vehicleNumber || '' // Pass known vehicle number
            }
        });
    };

    const handleApprove = async (id) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/${id}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('User Approved');
            fetchUsers();
        } catch (error) {
            console.error(error);
            alert('Failed to approve');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject and delete this user?')) return;
        try {
            await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/${id}/reject`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('User Rejected');
            fetchUsers();
        } catch (error) {
            console.error(error);
            alert('Failed to reject');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="text-white text-xl">Loading Users...</div>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center overflow-hidden"
            style={{
                backgroundImage: 'url("https://images.pexels.com/photos/2962589/pexels-photo-2962589.jpeg")'
            }}>

            <div className="bg-black/80 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl max-w-7xl w-full h-[90vh] flex flex-col p-6 overflow-hidden">

                <div className="flex items-center mb-6 pb-4 border-b border-white/10">
                    <Shield className="text-blue-400 w-8 h-8 mr-3" />
                    <h1 className="text-3xl font-bold text-white">Manage Users</h1>
                </div>

                {/* Search & Filter */}
                <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10 flex flex-col md:flex-row gap-4">
                    <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 text-white/50 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or vehicle number..."
                                className="glass-input pl-10"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                            Search
                        </button>
                    </form>

                    <div className="flex items-center gap-2 min-w-[200px]">
                        <Filter className="text-white/50 w-5 h-5" />
                        <select
                            className="glass-input appearance-none cursor-pointer"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="" className="text-black">All Roles</option>
                            <option value="user" className="text-black">User</option>
                            <option value="traffic_police" className="text-black">Traffic Police</option>
                            <option value="admin" className="text-black">Admin</option>
                        </select>
                    </div>
                </div>

                {/* User List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white/5 rounded-xl border border-white/10">
                    <table className="min-w-full divide-y divide-white/10">
                        <thead className="bg-white/5 sticky top-0 backdrop-blur-md">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-300 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-300 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-300 uppercase tracking-wider">Info</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-blue-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold overflow-hidden border border-white/20">
                                                {user.profilePicture ? (
                                                    <img src={user.profilePicture} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    user.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-white group-hover:text-blue-200 transition-colors">{user.name}</div>
                                                <div className="text-sm text-white/50">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                                            user.role === 'traffic_police' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                                                'bg-green-500/20 text-green-300 border-green-500/30'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {user.vehicleNumber ? (
                                            <div className="flex items-center gap-2">
                                                <Car className="w-4 h-4 text-white/40" />
                                                <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white border border-white/10">{user.vehicleNumber}</span>
                                            </div>
                                        ) : (
                                            <span className="text-white/30 italic">No Vehicle</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.isApproved ? (
                                            <span className="text-green-400 text-xs bg-green-500/10 px-2 py-1 rounded border border-green-500/20">Active</span>
                                        ) : (
                                            <span className="text-yellow-400 text-xs bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">Pending</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            {!user.isApproved && (
                                                <>
                                                    <button onClick={() => handleApprove(user._id)} className="text-green-400 hover:bg-green-500/20 p-1.5 rounded transition">
                                                        <i className="fas fa-check"></i> Approve
                                                    </button>
                                                    <button onClick={() => handleReject(user._id)} className="text-red-400 hover:bg-red-500/20 p-1.5 rounded transition">
                                                        <i className="fas fa-times"></i> Reject
                                                    </button>
                                                </>
                                            )}
                                            {user.role === 'user' && user.isApproved && (
                                                <button
                                                    onClick={() => handleIssueFine(user)}
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-all border border-transparent hover:border-red-500/30 flex items-center gap-2"
                                                    title="Issue Fine"
                                                >
                                                    <AlertCircle className="w-4 h-4" /> Issue Fine
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && (
                        <div className="text-center py-12 text-white/50 flex flex-col items-center">
                            <User className="w-12 h-12 mb-3 opacity-20" />
                            <p>No users found matching your search.</p>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10 text-gray-400 text-sm">
                    <div>
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg border border-white/10 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg border border-white/10 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .glass-input {
                    display: block;
                    width: 100%;
                    height: 42px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    padding: 0 12px;
                    color: white;
                    outline: none;
                    font-size: 14px;
                    transition: all 0.2s;
                }
                .glass-input:focus {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
                }
                .glass-input::placeholder { color: rgba(255, 255, 255, 0.3); }

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

export default AdminUsers;
