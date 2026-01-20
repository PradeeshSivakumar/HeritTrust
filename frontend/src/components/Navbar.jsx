import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Web3Context } from '../context/Web3Context';
import { Landmark } from 'lucide-react';

const Navbar = () => {
    const { role } = useContext(Web3Context);
    const location = useLocation();

    // Apply dark theme for both citizen and admin pages now
    const isDarkThemePage = location.pathname === '/citizen' || location.pathname === '/admin' || location.pathname === '/contractor';

    return (
        <nav className={`shadow-md p-4 transition-colors duration-300 ${isDarkThemePage ? 'bg-gray-900 border-b border-gray-800 text-white' : 'bg-white text-gray-800'}`}>
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className={`flex items-center space-x-2 text-2xl font-bold ${isDarkThemePage ? 'text-white' : 'text-primary'}`}>
                    <Landmark />
                    <span>HeritTrust</span>
                </Link>

                <div className="flex items-center space-x-6">
                    {/* Navigation Links */}
                    {role === 'contractor' && <Link to="/contractor" className={`hover:text-primary transition ${isDarkThemePage ? 'text-gray-300' : ''}`}>Contractor Panel</Link>}

                    {role === 'admin' && location.pathname !== '/admin' && <Link to="/admin" className={`hover:text-primary transition ${isDarkThemePage ? 'text-gray-300' : ''}`}>Admin Panel</Link>}

                    {/* Wallet connection is now strictly handled in AdminDashboard only */}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
