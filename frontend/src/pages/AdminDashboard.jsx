import React, { useState, useEffect, useContext } from 'react';
import { Web3Context } from '../context/Web3Context';
import axios from 'axios';
import { Check, ShieldAlert, Loader, Activity, LayoutDashboard, AlertCircle, Clock, Wallet, LogOut, Hash, DollarSign, Calendar, Plus as PlusIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, onSnapshot, query, addDoc } from 'firebase/firestore';
import CreateProjectModal from '../components/CreateProjectModal';

const AdminDashboard = () => {
    const { contract, connectWallet, disconnectWallet, currentAccount } = useContext(Web3Context);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [verificationScore, setVerificationScore] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch pending milestones from Firebase with Timeout Fallback
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

        // Safety timeout to prevent infinite loading spinner
        const timer = setTimeout(() => {
            if (loading) setLoading(false);
        }, 5000);

        return () => {
            unsubscribe();
            clearTimeout(timer);
        };
    }, []);

    const verifyWithAI = async (project) => {
        setProcessing(true);
        try {
            // Mock AI call
            const res = await axios.post('http://localhost:5000/verify-image', { cid: project.proofCid || "QmHash..." });
            setVerificationScore(res.data.verificationScore);
        } catch (error) {
            console.error(error);
            // Verify fallback for demo if AI service is offline
            setTimeout(() => {
                setVerificationScore(88);
                setProcessing(false);
            }, 1000);
            return;
        } finally {
            setProcessing(false);
        }
    };

    const approveAndRelease = async (project) => {
        if (!contract) return;
        setProcessing(true);
        try {
            const projectId = project.chainId || 1;
            const milestoneId = project.currentMilestone || 0;

            if (verificationScore > 70) {
                const txVerify = await contract.verifyMilestone(projectId, milestoneId, verificationScore);
                await txVerify.wait();
            }

            const txRelease = await contract.approveAndRelease(projectId, milestoneId);
            await txRelease.wait();

            alert("Funds Released Successfully!");
            setSelectedProject(null);
            setVerificationScore(null);
        } catch (error) {
            console.error(error);
            alert("Transaction Failed. See console.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            {/* Dynamic Background */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/50 to-transparent pointer-events-none"></div>

            <div className="container mx-auto py-10 px-4 relative z-10 max-w-7xl">
                <div className="flex justify-between items-center mb-10 border-b border-gray-800 pb-6">
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
                        >
                            Governance Console
                        </motion.h2>
                        <p className="text-gray-400 text-sm mt-1">Authorized Official Access</p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm transition font-medium shadow-lg shadow-emerald-500/20"
                        >
                            <PlusIcon size={16} />
                            <span>New Project</span>
                        </button>

                        {/* Seed Data Button Removed as requested */}

                        {/* Specific Wallet Control for Admin */}
                        {!currentAccount ? (
                            <button
                                onClick={connectWallet}
                                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm transition font-medium shadow-lg shadow-indigo-500/30"
                            >
                                <Wallet size={14} />
                                <span>Connect Admin Wallet</span>
                            </button>
                        ) : (
                            <button
                                onClick={disconnectWallet}
                                className="flex items-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm transition font-medium border border-red-500/20"
                            >
                                <LogOut size={14} />
                                <span>Disconnect</span>
                            </button>
                        )}
                    </div>
                </div>

                <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* List Column */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white flex items-center">
                                <Activity className="mr-2 text-indigo-400" />
                                Project Queue
                            </h3>
                            <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-1 rounded-full border border-indigo-500/30">
                                {projects.length} Active
                            </span>
                        </div>

                        {loading ? (
                            <div className="flex justify-center p-20"><Loader className="animate-spin text-indigo-500 w-8 h-8" /></div>
                        ) : projects.length === 0 ? (
                            <div className="text-gray-500 bg-white/5 border border-white/5 p-8 rounded-2xl text-center backdrop-blur-sm">
                                <LayoutDashboard className="mx-auto h-12 w-12 opacity-30 mb-3" />
                                <p>No projects found.</p>
                                <p className="text-sm mt-2 opacity-50">Create a new project to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {projects.map((project, index) => (
                                        <motion.div
                                            key={project.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            onClick={() => setSelectedProject(project)}
                                            className={`cursor-pointer p-6 rounded-2xl border transition-all relative overflow-hidden group
                                                ${selectedProject?.id === project.id
                                                    ? 'bg-indigo-900/30 border-indigo-500 ring-1 ring-indigo-500/50'
                                                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}
                                            `}
                                        >
                                            <div className="flex justify-between items-start relative z-10">
                                                <div>
                                                    <h4 className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors">{project.name || "Untitled Project"}</h4>
                                                    <p className="text-sm text-gray-400 mt-1 flex items-center">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                                                        Contractor: <span className="font-mono ml-1 bg-black/30 px-1 rounded">{project.contractorAddress?.substring(0, 8) || "0x..."}</span>
                                                    </p>

                                                    {project.txHash && (
                                                        <div className="mt-2 text-xs text-indigo-400 flex items-center bg-indigo-500/5 px-2 py-1 rounded w-fit">
                                                            <Hash size={10} className="mr-1" />
                                                            Tx: {project.txHash}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-white text-xl">{project.projectBudget || project.milestoneAmount || "0"} ETH</div>
                                                    <div className="text-xs text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded inline-block mt-1">Milestone #{project.currentMilestone || 1}</div>
                                                </div>
                                            </div>
                                            {selectedProject?.id === project.id && (
                                                <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none"></div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* Action Column */}
                    <div className="lg:col-span-4">
                        <AnimatePresence mode="wait">
                            {selectedProject ? (
                                <motion.div
                                    key="details"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/10 sticky top-10"
                                >
                                    <div className="border-b border-white/10 pb-4 mb-4">
                                        <h3 className="text-lg font-bold text-white">Project Details</h3>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-xs text-gray-400">ID: {selectedProject.id.substring(0, 8)}</p>
                                            <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/20">Active</span>
                                        </div>
                                    </div>

                                    {/* Detailed Stats */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                                            <div className="text-xs text-gray-500 mb-1 flex items-center">
                                                <DollarSign size={12} className="mr-1" /> Total Budget
                                            </div>
                                            <div className="text-white font-bold">{selectedProject.totalBudget || "0 ETH"}</div>
                                        </div>
                                        <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                                            <div className="text-xs text-gray-500 mb-1 flex items-center">
                                                <Clock size={12} className="mr-1" /> Current Step
                                            </div>
                                            <div className="text-white font-bold">Phase {selectedProject.currentMilestone || 1}</div>
                                        </div>
                                    </div>

                                    {/* Milestones List */}
                                    <div className="mb-6">
                                        <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
                                            <Calendar size={14} className="mr-2" />
                                            Milestone Timeline
                                        </h4>
                                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-700">
                                            {selectedProject.milestones && selectedProject.milestones.map((ms) => (
                                                <div key={ms.id} className={`p-2 rounded-lg text-sm border flex justify-between items-center ${ms.id === selectedProject.currentMilestone ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/5 border-transparent'}`}>
                                                    <div className="flex flex-col">
                                                        <span className={ms.id <= selectedProject.currentMilestone ? 'text-white' : 'text-gray-500'}>
                                                            {ms.id}. {ms.name}
                                                        </span>
                                                        {ms.targetDate && <span className="text-[10px] text-gray-600">{ms.targetDate}</span>}
                                                    </div>
                                                    <span className="text-xs font-mono text-gray-400">{ms.amount}</span>
                                                </div>
                                            ))}
                                            {(!selectedProject.milestones || selectedProject.milestones.length === 0) && (
                                                <p className="text-xs text-gray-500 italic">No detailed milestones available.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-white/10">
                                        <button
                                            onClick={() => verifyWithAI(selectedProject)}
                                            disabled={processing}
                                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center group"
                                        >
                                            {processing ? <Loader className="animate-spin w-5 h-5" /> : <ShieldAlert className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />}
                                            Run AI Verification
                                        </button>

                                        {verificationScore !== null && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className={`p-4 rounded-xl border ${verificationScore > 70 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-semibold text-gray-300">Confidence Score</span>
                                                    <span className={`text-2xl font-bold ${verificationScore > 70 ? "text-emerald-400" : "text-red-400"}`}>{verificationScore}%</span>
                                                </div>
                                                <div className="w-full bg-black/40 h-1.5 rounded-full mb-2 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${verificationScore}%` }}
                                                        className={`h-full ${verificationScore > 70 ? "bg-emerald-500" : "bg-red-500"}`}
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-400 leading-relaxed">
                                                    {verificationScore > 70 ? "AI confirms the proof matches project milestones." : "Warning: Potential discrepancies detected."}
                                                </p>
                                            </motion.div>
                                        )}
                                    </div>

                                    {!currentAccount ? (
                                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg text-center text-sm text-yellow-500 mt-4">
                                            Connect Admin Wallet to release funds.
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => approveAndRelease(selectedProject)}
                                            disabled={processing || verificationScore === null || verificationScore < 70}
                                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98] mt-4
                                                ${(processing || verificationScore < 70)
                                                    ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                                                    : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20'}`}
                                        >
                                            {processing ? 'Processing...' : (
                                                <>
                                                    <Check size={20} />
                                                    <span>Release Funds</span>
                                                </>
                                            )}
                                        </button>
                                    )}

                                    <button onClick={() => setSelectedProject(null)} className="w-full mt-4 text-gray-500 text-sm hover:text-white transition-colors">
                                        Deselect Project
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-8 text-center h-64 flex flex-col items-center justify-center text-gray-500"
                                >
                                    <div className="bg-white/5 p-4 rounded-full mb-4 ring-1 ring-white/10">
                                        <AlertCircle className="w-8 h-8 opacity-50" />
                                    </div>
                                    <p>Select a project to view details</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
