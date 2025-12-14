import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
} from 'chart.js';
import { Shield, Zap, TrendingUp, AlertTriangle, FileText } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip
);

const Dashboard = () => {
    const { token, user } = useAuth();
    const [stats, setStats] = useState(null);
    const [fineStats, setFineStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get(`${API_URL}/api/incidents/stats`, config);
                setStats(res.data);
                const fineRes = await axios.get(`${API_URL}/api/fines/stats`, config);
                setFineStats(fineRes.data);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch data.');
            } finally {
                setLoading(false);
            }
        };

        if (user && (user.role === 'admin' || user.role === 'traffic_police')) {
            fetchStats();
        } else {
            setLoading(false);
            setError('Access Denied.');
        }
    }, [token, user]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white"
            style={{ backgroundImage: 'url("https://images.pexels.com/photos/2962589/pexels-photo-2962589.jpeg")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
            <div className="relative z-10 animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );

    const data = {
        labels: stats ? Object.keys(stats) : [],
        datasets: [{
            data: stats ? Object.values(stats) : [],
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            hoverBackgroundColor: 'rgba(59, 130, 246, 0.9)',
            borderRadius: 6,
            barThickness: 30,
        }],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: { size: 14 },
                bodyFont: { size: 13 },
                displayColors: false,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)'
            }
        },
        scales: {
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { size: 11 } }
            },
            x: {
                grid: { display: false },
                ticks: { color: 'rgba(255, 255, 255, 0.7)', font: { size: 11 } }
            }
        },
    };

    return (
        <div className="min-h-screen font-sans text-white p-4 md:p-8 flex items-center justify-center bg-fixed bg-cover bg-center"
            style={{ backgroundImage: 'url("https://images.pexels.com/photos/2962589/pexels-photo-2962589.jpeg")' }}>

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50"></div>

            {/* Main Glass Container */}
            <div className="relative z-10 w-full max-w-6xl bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

                {/* Sidebar / Left Panel (Stats & Profile) */}
                <div className="w-full md:w-1/3 p-8 border-b md:border-b-0 md:border-r border-white/10 flex flex-col gap-6 bg-white/5">

                    {/* Header Info */}
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-600/20 rounded-lg border border-blue-500/30">
                                <Shield className="w-6 h-6 text-blue-400" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                        </div>
                        <p className="text-white/50 text-sm">Welcome back, <span className="text-white font-medium">{user?.name}</span></p>
                        {user && (
                            <span className="inline-block mt-3 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-blue-200 border border-blue-500/20 uppercase tracking-wider">
                                {user.role.replace('_', ' ')}
                            </span>
                        )}
                    </div>

                    <div className="h-px bg-white/10 my-2"></div>

                    {/* Stats Cards */}
                    {stats && (
                        <div className="space-y-4">
                            <div className="bg-gradient-to-br from-blue-900/40 to-black/40 p-5 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-blue-200/70 text-xs font-bold uppercase tracking-wider">Total Incidents</span>
                                    <AlertTriangle className="w-5 h-5 text-blue-500 opacity-70 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="text-4xl font-black text-white">
                                    {Object.values(stats).reduce((a, b) => a + b, 0)}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-900/40 to-black/40 p-5 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-emerald-200/70 text-xs font-bold uppercase tracking-wider">Revenue Collected</span>
                                    <FileText className="w-5 h-5 text-emerald-500 opacity-70 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="text-4xl font-black text-white flex items-baseline">
                                    {(fineStats?.totalCollected / 1000).toFixed(1)}k
                                    <span className="text-lg text-emerald-500/70 ml-1">₹</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-auto pt-6">
                        <Link to="/issue-fine" className="group flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                            <Zap className="w-5 h-5 fill-current" />
                            Issue Violation
                        </Link>
                    </div>
                </div>

                {/* Right Panel (Charts & Details) */}
                <div className="w-full md:w-2/3 p-8 bg-black/20">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-400" />
                            Activity Overview
                        </h2>
                        {/* Could put a date filter here later */}
                    </div>

                    {stats ? (
                        <div className="bg-white/5 rounded-xl border border-white/10 p-6 h-80 relative">
                            <Bar options={options} data={data} />
                        </div>
                    ) : (
                        <div className="h-80 flex items-center justify-center text-white/30">
                            No data available
                        </div>
                    )}

                    {error && (
                        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-200 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Additional Quick Stats or Recent Activity could go here */}
                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                            <h4 className="text-white/40 text-xs font-bold uppercase mb-1">Most Frequent</h4>
                            <p className="text-lg font-medium text-white">
                                {stats ? Object.entries(stats).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None' : 'Loading...'}
                            </p>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                            <h4 className="text-white/40 text-xs font-bold uppercase mb-1">Pending Fines</h4>
                            <p className="text-lg font-medium text-white">
                                {fineStats?.pendingCount || 0}
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
