import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import TrafficMap from './components/TrafficMap';
import Login from './components/Login';
import Register from './components/Register';
import ReportIncident from './components/ReportIncident';
import Dashboard from './components/Dashboard';

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
                        </Routes>
                    </main>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
