import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Web3Provider } from './context/Web3Context';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import CitizenDashboard from './pages/CitizenDashboard';
import ContractorDashboard from './pages/ContractorDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Helper component to hide Navbar on Login page
const Layout = ({ children }) => {
    const location = useLocation();
    const hideNavbar = location.pathname === '/' || location.pathname === '/login'; // Hide on login page

    return (
        <>
            {!hideNavbar && <Navbar />}
            {children}
        </>
    );
};

function App() {
    return (
        <Web3Provider>
            <Router>
                <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
                    <Layout>
                        <Routes>
                            <Route path="/" element={<Login />} />
                            <Route path="/home" element={<Home />} />
                            <Route path="/citizen" element={<CitizenDashboard />} />
                            <Route path="/contractor" element={<ContractorDashboard />} />
                            <Route path="/admin" element={<AdminDashboard />} />
                        </Routes>
                    </Layout>
                </div>
            </Router>
        </Web3Provider>
    )
}

export default App;
