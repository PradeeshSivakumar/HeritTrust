import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Eye, Activity } from 'lucide-react';

const Home = () => {
    return (
        <div className="container mx-auto py-16 px-4">
            <div className="text-center max-w-3xl mx-auto space-y-6">
                <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
                    Transparency for <span className="text-primary">Heritage Preservation</span>
                </h1>
                <p className="text-xl text-gray-600">
                    A blockchain-based governance platform ensuring government funds are used for real restoration work.
                    Powered by Ethereum & AI.
                </p>
                <div className="flex justify-center space-x-4 pt-6">
                    <Link to="/citizen" className="bg-primary text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-emerald-600 transition shadow-xl">
                        View Projects
                    </Link>
                    <Link to="/admin" className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition">
                        Agency Login
                    </Link>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-20">
                <FeatureCard
                    icon={<ShieldCheck size={40} className="text-primary" />}
                    title="Smart Fund Release"
                    description="Funds are locked in smart contracts and only released when milestones are verified."
                />
                <FeatureCard
                    icon={<Eye size={40} className="text-secondary" />}
                    title="AI Verification"
                    description="Uploaded proof images are analyzed by AI for authenticity and location data."
                />
                <FeatureCard
                    icon={<Activity size={40} className="text-purple-500" />}
                    title="Public Dashboard"
                    description="Every transaction and milestone is visible to citizens in real-time."
                />
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-500">{description}</p>
    </div>
);

export default Home;
