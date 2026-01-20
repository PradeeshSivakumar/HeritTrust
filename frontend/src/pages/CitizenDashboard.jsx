import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { MapPin, CheckCircle, Clock, ExternalLink, Search, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const CitizenDashboard = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let unsubscribe = () => { };

        const fetchProjects = async () => {
            try {
                // Ensure db is initialized
                if (!db) {
                    throw new Error("Database not initialized");
                }

                const q = query(collection(db, "projects"));

                unsubscribe = onSnapshot(q, (snapshot) => {
                    const projectsData = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setProjects(projectsData);
                    setLoading(false);
                }, (err) => {
                    console.error("Firestore Error:", err);
                    setError("Unable to load projects. Please try again later.");
                    setLoading(false);
                });

            } catch (err) {
                console.error("Setup Error:", err);
                setError("Connection failed. Please check your internet.");
                setLoading(false);
            }
        };

        fetchProjects();

        // Fallback timeout in case onSnapshot hangs
        const timeoutId = setTimeout(() => {
            if (loading) {
                setLoading(false);
                // Don't set error if projects loaded, just stop spinner
                if (projects.length === 0) {
                    // Keep loading false, but UI will show empty state or we can show a specific message
                    console.log("Loading timed out (gracefully)");
                }
            }
        }, 8000);

        return () => {
            unsubscribe();
            clearTimeout(timeoutId);
        };
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                <p className="text-gray-400 text-sm">Loading heritage projects...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center p-8 bg-gray-800 rounded-xl border border-red-900/50 max-w-md">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Connection Issue</h3>
                <p className="text-gray-400 mb-6">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition"
                >
                    Retry
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans overflow-x-hidden">
            {/* Dynamic Background */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/50 to-transparent pointer-events-none"></div>

            <div className="container mx-auto py-10 px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-gray-800 pb-6"
                >
                    <div>
                        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-300">Public Projects Tracker</h2>
                        <p className="text-gray-400 mt-2">Transparent monitoring of public heritage funds.</p>
                    </div>
                    <div className="mt-4 md:mt-0 relative">
                        <Search className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Find a monument..."
                            className="bg-black/30 border border-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-64 transition-all"
                        />
                    </div>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project, index) => (
                        <motion.div
                            key={project.id || index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group"
                        >
                            <div className="h-56 bg-gray-800 w-full relative overflow-hidden">
                                {/* Placeholder or gradient if no image */}
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-gray-500 group-hover:scale-105 transition-transform duration-500">
                                    <span className="opacity-30 text-4xl font-bold">HeritTrust</span>
                                </div>
                                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium border border-white/10">
                                    ID: #{(project.id || "").substring(0, 6)}...
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-indigo-400 transition-colors">{project.name || "Unnamed Project"}</h3>
                                <p className="text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed">{project.description || "No description provided."}</p>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="flex items-center text-sm text-gray-300 bg-white/5 p-2 rounded-lg">
                                        <MapPin size={16} className="mr-2 text-indigo-400" />
                                        <span className="truncate">Lat: {project.location?.lat || "N/A"}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-emerald-400 font-medium bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                                        <CheckCircle size={16} className="mr-2" />
                                        <span>Active</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5">
                                    <div className="flex justify-between items-center text-sm mb-2">
                                        <span className="text-gray-500">Milestone Progress</span>
                                        <span className="font-bold text-white">{project.milestones ? project.milestones.length : 0} / 5</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '20%' }}
                                            className="bg-indigo-500 h-full rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                        ></motion.div>
                                    </div>
                                </div>

                                <button className="w-full mt-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 font-medium text-sm transition-colors flex items-center justify-center">
                                    View Full Details <ExternalLink size={14} className="ml-2" />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {projects.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            <p className="text-xl mb-2">No projects found</p>
                            <p className="text-sm opacity-60">Seed data via Admin Dashboard to see projects here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CitizenDashboard;
