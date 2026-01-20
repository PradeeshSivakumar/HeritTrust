import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Save, MapPin, DollarSign, Calendar } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

const CreateProjectModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        lat: '',
        lng: '',
        contractorAddress: '',
        totalBudget: '',
    });

    const [milestones, setMilestones] = useState([
        { id: 1, name: '', amount: '', targetDate: '', status: 'pending' }
    ]);

    const [saving, setSaving] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMilestoneChange = (index, field, value) => {
        const newMilestones = [...milestones];
        newMilestones[index][field] = value;
        setMilestones(newMilestones);
    };

    const addMilestone = () => {
        setMilestones([
            ...milestones,
            { id: milestones.length + 1, name: '', amount: '', targetDate: '', status: 'pending' }
        ]);
    };

    const removeMilestone = (index) => {
        const newMilestones = milestones.filter((_, i) => i !== index);
        // Re-index IDs
        const reIndexed = newMilestones.map((m, i) => ({ ...m, id: i + 1 }));
        setMilestones(reIndexed);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Ensure user is authenticated (fallback to anonymous)
            if (!auth.currentUser) {
                console.log("User not logged in, attempting anonymous login...");
                await signInAnonymously(auth);
            }

            const projectData = {
                name: formData.name,
                description: formData.description,
                location: {
                    lat: parseFloat(formData.lat),
                    lng: parseFloat(formData.lng)
                },
                contractorAddress: formData.contractorAddress,
                totalBudget: `${formData.totalBudget} ETH`,
                milestoneAmount: milestones.length > 0 ? `${milestones[0].amount} ETH` : "0 ETH", // Current active amount
                currentMilestone: 1,
                milestones: milestones.map(m => ({
                    ...m,
                    amount: `${m.amount} ETH`
                })),
                status: 'active',
                createdAt: new Date()
            };

            await addDoc(collection(db, "projects"), projectData);

            // Reset and close
            setFormData({ name: '', description: '', lat: '', lng: '', contractorAddress: '', totalBudget: '' });
            setMilestones([{ id: 1, name: '', amount: '', targetDate: '', status: 'pending' }]);
            onClose();
            alert("Project Created Successfully!");
        } catch (error) {
            console.error(error);
            alert("Error creating project.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    ></motion.div>

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-gray-900 border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative z-10"
                    >
                        <div className="flex justify-between items-center p-6 border-b border-gray-800 sticky top-0 bg-gray-900 z-20">
                            <h2 className="text-xl font-bold text-white flex items-center">
                                <Plus className="mr-2 text-indigo-500" />
                                Create New Project
                            </h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Section 1: Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Project Name</label>
                                        <input
                                            required
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                            placeholder="e.g. Charminar Repair"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Total Budget (ETH)</label>
                                        <div className="relative">
                                            <DollarSign size={16} className="absolute left-3 top-3 text-gray-500" />
                                            <input
                                                required
                                                type="number"
                                                step="0.01"
                                                name="totalBudget"
                                                value={formData.totalBudget}
                                                onChange={handleInputChange}
                                                className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 pl-10 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Project Description</label>
                                    <textarea
                                        required
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="w-full h-[124px] bg-black/30 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                                        placeholder="Detailed scope of work..."
                                    ></textarea>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Contractor Address (0x...)</label>
                                    <input
                                        required
                                        name="contractorAddress"
                                        value={formData.contractorAddress}
                                        onChange={handleInputChange}
                                        className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 text-white font-mono text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                        placeholder="0x123...abc"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Latitude</label>
                                        <input
                                            name="lat"
                                            value={formData.lat}
                                            onChange={handleInputChange}
                                            className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                                            placeholder="28.61"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Longitude</label>
                                        <input
                                            name="lng"
                                            value={formData.lng}
                                            onChange={handleInputChange}
                                            className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                                            placeholder="77.20"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Milestones & Timeline */}
                            <div className="border-t border-gray-800 pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-bold text-white flex items-center">
                                        <Calendar size={16} className="mr-2 text-indigo-400" />
                                        Project Phases & Timeline
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={addMilestone}
                                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center"
                                    >
                                        <Plus size={14} className="mr-1" /> Add Phase
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {milestones.map((ms, index) => (
                                        <div key={index} className="flex gap-3 bg-white/5 p-3 rounded-xl border border-white/5 items-center">
                                            <span className="text-gray-500 font-mono text-sm w-6 text-center">{index + 1}</span>

                                            <div className="flex-1 space-y-2 lg:space-y-0 lg:flex lg:gap-3">
                                                <input
                                                    required
                                                    placeholder="Phase Name (e.g. Foundations)"
                                                    value={ms.name}
                                                    onChange={(e) => handleMilestoneChange(index, 'name', e.target.value)}
                                                    className="w-full bg-transparent border-b border-gray-700 focus:border-indigo-500 text-white text-sm pb-1 outline-none transition-colors"
                                                />
                                                <input
                                                    type="date"
                                                    value={ms.targetDate}
                                                    onChange={(e) => handleMilestoneChange(index, 'targetDate', e.target.value)}
                                                    className="w-full lg:w-32 bg-transparent border-b border-gray-700 focus:border-indigo-500 text-gray-400 text-xs pb-1 outline-none transition-colors"
                                                />
                                            </div>

                                            <div className="relative w-20">
                                                <input
                                                    required
                                                    type="number"
                                                    placeholder="ETH"
                                                    value={ms.amount}
                                                    onChange={(e) => handleMilestoneChange(index, 'amount', e.target.value)}
                                                    className="w-full bg-black/30 rounded px-2 py-1 text-right text-white text-sm outline-none border border-transparent focus:border-indigo-500"
                                                />
                                            </div>
                                            {milestones.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeMilestone(index)}
                                                    className="text-gray-600 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="pt-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="mr-3 px-6 py-2 rounded-lg text-gray-400 hover:bg-white/5 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20 flex items-center"
                                >
                                    {saving ? 'Creating...' : (
                                        <>
                                            <Save size={18} className="mr-2" />
                                            Create Project
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CreateProjectModal;
