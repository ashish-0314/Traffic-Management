import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import TrafficMap from './components/TrafficMap';
import Login from './components/Login';
import Register from './components/Register';
import ReportIncident from './components/ReportIncident';
import Dashboard from './components/Dashboard';
import IssueFine from './components/IssueFine';
import MyFines from './components/MyFines';
import AdminUsers from './components/AdminUsers';
import AdminIncidents from './components/AdminIncidents';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="min-h-screen bg-gray-100 flex flex-col">
                    <Navbar />
                    <main className="flex-grow relative">
                        <Routes>
                            <Route path="/" element={<TrafficMap />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/report" element={<ReportIncident />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/issue-fine" element={<IssueFine />} />
                            <Route path="/my-fines" element={<MyFines />} />
                            <Route path="/admin/incidents" element={<ProtectedRoute role={['admin', 'traffic_police']}><AdminIncidents /></ProtectedRoute>} />
                            <Route path="/admin/users" element={<ProtectedRoute role={['admin']}><AdminUsers /></ProtectedRoute>} />
                            <Route path="/profile" element={<ProtectedRoute role={['user', 'admin', 'traffic_police']}><Profile /></ProtectedRoute>} />
                        </Routes>
                    </main>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
