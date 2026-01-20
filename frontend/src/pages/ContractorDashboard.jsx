import React, { useState, useEffect, useContext } from 'react';
import { Web3Context } from '../context/Web3Context';
import axios from 'axios';
import { Upload, FileText, CheckCircle, Clock, MapPin, Hammer, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

const ContractorDashboard = () => {
    const { contract, currentAccount } = useContext(Web3Context);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch assigned projects (Simulated filter for demo, or fetch all)
    // In production: where("contractorAddress", "==", currentAccount)
    useEffect(() => {
        let unsubscribe = () => { };

        const fetchProjects = () => {
            const q = query(collection(db, "projects"));
            unsubscribe = onSnapshot(q, (snapshot) => {
                const projectsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProjects(projectsData);
                setLoading(false);
            }, (error) => {
                console.error("Firebase Snapshot Error:", error);
                setLoading(false);
            });
        };

        fetchProjects();

        // Fallback for slow connection/empty DB
        const timer = setTimeout(() => {
            if (loading) setLoading(false);
        }, 5000);

        return () => {
            unsubscribe();
            clearTimeout(timer);
        };
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const submitProof = async () => {
        if (!file || !contract || !selectedProject) return;
        setUploading(true);
        try {
            // 1. Upload to IPFS mock
            // const formData = new FormData();
            // formData.append('file', file);
            // const uploadRes = await axios.post('http://localhost:5000/upload', formData); // Using python service or similar

            // Simulating IPFS hash for demo speed
            const mkHash = "Qm" + Math.random().toString(36).substring(7);

            // 2. Submit to Smart Contract
            const projectId = selectedProject.chainId || 1;
            const milestoneId = selectedProject.currentMilestone || 1;

            const tx = await contract.submitMilestoneProof(projectId, milestoneId, mkHash);
            await tx.wait();

            alert("Proof submitted successfully! Awaiting Admin Verification.");
            setFile(null);
            setSelectedProject(null);
        } catch (error) {
            console.error(error);
            alert("Error submitting proof. Ensure wallet is connected (Admin handles connection).");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            {/* Dynamic Background */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/40 to-transparent pointer-events-none"></div>

            <div className="container mx-auto py-10 px-4 relative z-10 max-w-6xl">
                <div className="flex justify-between items-center mb-10 border-b border-gray-800 pb-6">
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-200"
                        >
                            Contractor Workspace
                        </motion.h2>
                        <p className="text-gray-400 text-sm mt-1">Manage Tasks & Submit Proofs</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Projects List */}
                    <div className="lg:col-span-7 space-y-6">
                        <h3 className="text-xl font-bold text-white flex items-center mb-4">
                            <Hammer className="mr-2 text-blue-400" />
                            Assigned Projects
                        </h3>

                        {loading ? (
                            <div className="text-center py-10 text-gray-500 border border-white/5 rounded-xl bg-white/5">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
                                Loading assignments...
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-gray-500">
                                No active projects assigned.
                            </div>
                        ) : (
                            projects.map((project, index) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => setSelectedProject(project)}
                                    className={`cursor-pointer p-6 rounded-2xl border transition-all relative overflow-hidden group
                                        ${selectedProject?.id === project.id
                                            ? 'bg-blue-900/20 border-blue-500/50 ring-1 ring-blue-500/30'
                                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}
                                    `}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-lg text-white mb-1">{project.name}</h4>
                                            <div className="flex items-center text-gray-400 text-xs mb-3">
                                                <MapPin size={12} className="mr-1" />
                                                {project.location?.lat ? `${project.location.lat}, ${project.location.lng}` : "Location pending"}
                                            </div>
                                            <span className="bg-yellow-500/10 text-yellow-500 text-xs px-2 py-1 rounded border border-yellow-500/20">
                                                Pending Milestone #{project.currentMilestone || 1}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-white">{project.milestoneAmount || 0} ETH</div>
                                            <div className="text-xs text-gray-500">Allocated</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Work Console */}
                    <div className="lg:col-span-5">
                        <AnimatePresence mode="wait">
                            {selectedProject ? (
                                <motion.div
                                    key="upload"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/10 sticky top-10"
                                >
                                    <h3 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">
                                        Proof Submission
                                    </h3>

                                    {/* Brief Project Summary */}
                                    <div className="mb-6 bg-black/30 p-4 rounded-xl border border-white/5">
                                        <p className="text-sm text-gray-400 mb-2">Description</p>
                                        <p className="text-sm text-gray-200 leading-relaxed mb-4">
                                            {selectedProject.description || "No description provided."}
                                        </p>
                                        <div className="flex justify-between items-center text-xs text-gray-400 border-t border-white/5 pt-2">
                                            <span>Total Budget: <span className="text-white">{selectedProject.totalBudget || "N/A"}</span></span>
                                            <span>Step: <span className="text-blue-400">{selectedProject.currentMilestone || 1}</span> / {selectedProject.milestones ? selectedProject.milestones.length : 5}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                                            <div className="text-sm text-blue-300 mb-1">Current Task</div>
                                            <div className="text-white font-medium text-lg">
                                                {selectedProject.milestones && selectedProject.milestones[selectedProject.currentMilestone - 1]
                                                    ? selectedProject.milestones[selectedProject.currentMilestone - 1].name
                                                    : `Restoration Phase ${selectedProject.currentMilestone || 1}`}
                                            </div>
                                        </div>

                                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:bg-white/5 hover:border-blue-500/50 transition-all group">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="text-gray-500 group-hover:text-blue-400 mb-3 transition-colors" size={32} />
                                                <p className="text-sm text-gray-400 group-hover:text-gray-300">
                                                    <span className="font-bold text-blue-400">Click to upload</span> proof image
                                                </p>
                                                <p className="text-xs text-gray-600 mt-1">JPEG, PNG (Max 5MB)</p>
                                            </div>
                                            <input type="file" className="hidden" onChange={handleFileChange} />
                                        </label>

                                        {file && (
                                            <div className="flex items-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-300">
                                                <FileText size={16} className="mr-2" />
                                                <span className="truncate">{file.name}</span>
                                                <CheckCircle size={16} className="ml-auto text-blue-500" />
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={submitProof}
                                        disabled={uploading || !file || !contract}
                                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center transition-all
                                            ${(uploading || !file)
                                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 hover:-translate-y-1'}`}
                                    >
                                        {uploading ? 'Uploading to IPFS...' : 'Submit to Smart Contract'}
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-10 text-center flex flex-col items-center justify-center text-gray-500 h-64"
                                >
                                    <Clock className="w-10 h-10 opacity-30 mb-3" />
                                    <p>Select a project to upload proof</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractorDashboard;
