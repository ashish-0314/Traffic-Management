import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, CheckCircle, Receipt } from 'lucide-react';

const MyFines = () => {
    const { token } = useAuth();
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFines = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${API_URL}/api/fines/myfines`, config);
            setFines(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFines();
    }, [token]);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePay = async (fine) => {
        const res = await loadRazorpay();
        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            // 1. Create Order
            const orderRes = await axios.post(`${API_URL}/api/fines/payment/order`, { amount: fine.amount }, config);
            const order = orderRes.data;

            // 2. Open Razorpay options
            const options = {
                key: order.keyId, // Key ID from server response
                amount: order.amount,
                currency: order.currency,
                name: "Traffic System Fine",
                description: fine.reason,
                order_id: order.id,
                handler: async function (response) {
                    // 3. Verify Payment
                    try {
                        await axios.post(`${API_URL}/api/fines/payment/verify`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            fineId: fine._id
                        }, config);

                        alert('Payment Successful!');
                        fetchFines();
                    } catch (err) {
                        alert('Payment Verification Failed');
                    }
                },
                prefill: {
                    name: "User Name", // Could retrieve from authUser
                    email: "user@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#3399cc"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.open();

        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Payment initiation failed');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="text-white text-xl">Loading Fines...</div>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center overflow-hidden"
            style={{
                backgroundImage: 'url("https://images.pexels.com/photos/2962589/pexels-photo-2962589.jpeg")'
            }}>

            <div className="bg-black/60 backdrop-blur-md border border-blue-500/30 shadow-2xl rounded-2xl max-w-5xl w-full h-[80vh] flex flex-col p-6 overflow-hidden">

                <div className="flex items-center mb-6 pb-4 border-b border-white/10">
                    <Receipt className="text-blue-400 w-8 h-8 mr-3" />
                    <h1 className="text-3xl font-bold text-white">My Traffic Fines</h1>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {fines.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-white/50">
                            <CheckCircle className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-xl">No pending fines found.</p>
                            <p className="text-sm">Drive safely!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {fines.map((fine) => (
                                <div key={fine._id} className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-5 border border-white/10 flex flex-col md:flex-row justify-between items-center group">
                                    <div className="mb-4 md:mb-0 w-full md:w-auto">
                                        <div className="flex items-center mb-1">
                                            <span className="bg-red-500/20 text-red-300 text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider mr-2">
                                                Violation
                                            </span>
                                            <h3 className="text-lg font-bold text-white">{fine.reason}</h3>
                                        </div>
                                        <div className="flex flex-col md:flex-row md:items-center text-gray-300 text-sm mt-2 space-y-1 md:space-y-0 md:space-x-4">
                                            <p className="flex items-center">
                                                <span className="text-white/60 mr-1">Amount:</span>
                                                <span className="text-white font-bold text-base">₹{fine.amount}</span>
                                            </p>
                                            <p className="hidden md:block text-white/20">|</p>
                                            <p className="flex items-center">
                                                <span className="text-white/60 mr-1">Date:</span>
                                                <span className="text-white">{new Date(fine.date).toLocaleDateString()}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        {fine.status === 'Paid' ? (
                                            <span className="flex items-center text-green-400 font-bold px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20">
                                                <CheckCircle className="h-4 w-4 mr-2" /> Paid
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handlePay(fine)}
                                                className="flex items-center bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-full transition-transform hover:scale-105 shadow-lg shadow-red-900/30"
                                            >
                                                <AlertTriangle className="h-4 w-4 mr-2" /> Pay Now
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
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

export default MyFines;
