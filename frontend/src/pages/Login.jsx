import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Web3Context } from '../context/Web3Context';
import { User, Key, Shield, Building, ArrowRight, UserCircle, Hammer } from 'lucide-react';

const Login = () => {
    const [userType, setUserType] = useState('citizen'); // 'citizen', 'contractor', 'official'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    // Wallet context is imported but we don't expose connection here anymore
    const { currentAccount } = useContext(Web3Context);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);

            // Routing based on selected tab logic
            if (userType === 'official') {
                navigate('/admin');
            } else if (userType === 'contractor') {
                navigate('/contractor');
            }
        } catch (err) {
            console.error(err);
            setError("Invalid credentials. Please try again.");
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            // Default google login routing based on tab
            if (userType === 'official') {
                navigate('/admin');
            } else {
                navigate('/contractor');
            }
        } catch (err) {
            setError("Google sign-in failed.");
        }
    };

    const handleCitizenEnter = () => {
        navigate('/citizen');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden relative font-sans">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-gray-900 to-black z-0"></div>
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl z-0"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl z-0"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-md z-10 text-white"
            >
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-indigo-500 p-3 rounded-xl shadow-lg shadow-indigo-500/30">
                            <Shield className="text-white w-8 h-8" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">HeritTrust</h2>
                    <p className="text-gray-400 mt-2 text-sm">Blockchain Governance Platform</p>
                </div>

                {/* 3 Tabs */}
                <div className="flex bg-black/20 rounded-xl p-1 mb-8 border border-white/5">
                    <button
                        onClick={() => setUserType('citizen')}
                        className={`flex-1 flex flex-col items-center justify-center py-2 text-xs font-medium rounded-lg transition-all ${userType === 'citizen' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <UserCircle className="w-5 h-5 mb-1" />
                        Citizen
                    </button>
                    <button
                        onClick={() => setUserType('contractor')}
                        className={`flex-1 flex flex-col items-center justify-center py-2 text-xs font-medium rounded-lg transition-all ${userType === 'contractor' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Hammer className="w-5 h-5 mb-1" />
                        Contractor
                    </button>
                    <button
                        onClick={() => setUserType('official')}
                        className={`flex-1 flex flex-col items-center justify-center py-2 text-xs font-medium rounded-lg transition-all ${userType === 'official' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Building className="w-5 h-5 mb-1" />
                        Govt
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {userType === 'citizen' ? (
                        <motion.div
                            key="citizen"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="text-center py-4"
                        >
                            <UserCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4 opacity-80" />
                            <h3 className="text-xl font-bold text-white mb-2">Public Access</h3>
                            <p className="text-gray-400 mb-8 leading-relaxed text-sm px-4">
                                View project statuses, verify restoration progress, and monitor fund allocation transparency.
                            </p>

                            <button
                                onClick={handleCitizenEnter}
                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center group"
                            >
                                Enter Dashboard
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="mb-6 text-center">
                                <h3 className="text-lg font-bold text-white">
                                    {userType === 'contractor' ? 'Contractor Portal' : 'Official Governance'}
                                </h3>
                                <p className="text-xs text-gray-500">Secure entry for authorized personnel</p>
                            </div>

                            {error && (
                                <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm flex items-center">
                                    <Shield className="w-4 h-4 mr-2" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Email Address</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                                            placeholder={userType === 'contractor' ? "contractor@agency.com" : "official@gov.in"}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Password</label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-600/30 flex justify-center items-center group"
                                >
                                    Login as {userType === 'contractor' ? 'Contractor' : 'Official'}
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>

                            <div className="mt-4 pt-4 border-t border-white/10">
                                <button onClick={handleGoogleLogin} className="flex items-center justify-center px-4 py-3 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition text-sm text-gray-300 w-full group">
                                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" alt="Google" />
                                    Sign in with Google
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default Login;
