import React, { useEffect, useState } from 'react';
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
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const { token, user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };
                const res = await axios.get('http://localhost:5000/api/incidents/stats', config);
                setStats(res.data);
            } catch (err) {
                console.error(err);
                // If 401/403, might handle gracefully but for now show error
                setError('Failed to fetch statistics. Ensure you have Admin/Police privileges.');
            } finally {
                setLoading(false);
            }
        };

        if (user && (user.role === 'admin' || user.role === 'traffic_police')) {
            fetchStats();
        } else {
            setLoading(false);
            setError('Access Denied. Dashboard is for Admins and Traffic Police only.');
        }
    }, [token, user]);

    if (loading) return <div className="p-8 text-center">Loading Analytics...</div>;

    const data = {
        labels: stats ? Object.keys(stats) : [],
        datasets: [
            {
                label: 'Number of Incidents',
                data: stats ? Object.values(stats) : [],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Traffic Incidents by Type',
            },
        },
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics Dashboard</h1>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                        <p>{error}</p>
                    </div>
                )}

                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <Bar options={options} data={data} />
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-xl font-semibold mb-4">Summary</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-md">
                                    <span className="text-gray-700 font-medium">Total Reports</span>
                                    <span className="text-blue-700 font-bold text-lg">
                                        {Object.values(stats).reduce((a, b) => a + b, 0)}
                                    </span>
                                </div>
                                {/* Add more summary cards here */}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
