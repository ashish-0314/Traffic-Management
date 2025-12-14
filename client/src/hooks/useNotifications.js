import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const useNotifications = () => {
    const { token, user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!token || !user) return;

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${API_URL}/api/notifications`, config);
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    }, [token, user]);

    // Initial fetch and polling (every 30s)
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.patch(`${API_URL}/api/notifications/${id}/read`, {}, config);
            // Update local state optimistically
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error(err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.patch(`${API_URL}/api/notifications/read-all`, {}, config);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error(err);
        }
    };

    return { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead };
};

export default useNotifications;
