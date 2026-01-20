import { db } from '../src/firebase.js'; // Adjust path if running from root relative
import { collection, addDoc } from 'firebase/firestore';

const seedData = async () => {
    const projects = [
        {
            name: "Red Fort Restoration",
            description: "Restoring the main gate and surrounding walls of the historic Red Fort.",
            location: { lat: 28.6562, lng: 77.2410 },
            contractorAddress: "0x123...abc",
            milestoneAmount: "5 ETH",
            currentMilestone: 1,
            milestones: [
                { id: 1, name: "Survey", status: "completed" },
                { id: 2, name: "Material Procurement", status: "active" }
            ],
            proofCid: "QmHash123"
        },
        {
            name: "Taj Mahal Cleaning",
            description: "Specialized cleaning of the white marble dome to remove pollution stains.",
            location: { lat: 27.1751, lng: 78.0421 },
            contractorAddress: "0x456...def",
            milestoneAmount: "12 ETH",
            currentMilestone: 0,
            milestones: [
                { id: 1, name: "Scaffolding Setup", status: "pending" }
            ],
            proofCid: "QmHash456"
        },
        {
            name: "Hampi Stone Chariot",
            description: "Structural reinforcement of the ancient Stone Chariot in Hampi.",
            location: { lat: 15.3350, lng: 76.4600 },
            contractorAddress: "0x789...ghi",
            milestoneAmount: "3 ETH",
            currentMilestone: 2,
            milestones: [
                { id: 1, name: "Planning", status: "completed" },
                { id: 2, name: "Reinforcement", status: "active" }
            ],
            proofCid: "QmHash789"
        }
    ];

    try {
        const colRef = collection(db, "projects");
        for (const p of projects) {
            const docRef = await addDoc(colRef, p);
            console.log("Document written with ID: ", docRef.id);
        }
        console.log("Seeding complete!");
    } catch (e) {
        console.error("Error adding document: ", e);
    }
};

// To run this, we need node environment but with ESM support or similar.
// However, since we are in a browser-centric project, it might be easier to just
// execute this function ONCE from within a React component temporary or
// use a hidden button in Admin Dashboard to trigger it.
// For simplicity, I will propose adding a "Seed Data" button to AdminDashboard
// that is only visible for now, or just tell the user to use it.
