import React, { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import HeritTrustABI from '../abi/HeritTrust.json';

export const Web3Context = createContext();

// Replace with deployed address on Sepolia or Localhost
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Localhost default

export const Web3Provider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [role, setRole] = useState('citizen'); // 'admin', 'contractor', 'citizen', 'verifier'
    const [loading, setLoading] = useState(false);

    const checkWalletConnected = async () => {
        if (!window.ethereum) return console.log("Make sure you have MetaMask!");
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length) {
            setCurrentAccount(accounts[0]);
            connectContract(accounts[0]);
        }
    };

    const connectWallet = async () => {
        if (!window.ethereum) return alert("Get MetaMask!");
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setCurrentAccount(accounts[0]);
        connectContract(accounts[0]);
    };

    const connectContract = async (account) => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const heritTrustContract = new ethers.Contract(CONTRACT_ADDRESS, HeritTrustABI.abi, signer);
            setContract(heritTrustContract);

            // Check Role (Admin is Deployer/DEFAULT_ADMIN_ROLE)
            const isAdmin = await heritTrustContract.hasRole(await heritTrustContract.DEFAULT_ADMIN_ROLE(), account);
            if (isAdmin) {
                setRole('admin');
            } else {
                const isContractor = await heritTrustContract.hasRole(await heritTrustContract.CONTRACTOR_ROLE(), account);
                if (isContractor) setRole('contractor');
                // Check verifier role...
            }
        } catch (error) {
            console.error("Contract connection failed:", error);
        }
    };

    useEffect(() => {
        checkWalletConnected();
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length) {
                    setCurrentAccount(accounts[0]);
                    window.location.reload();
                } else {
                    setCurrentAccount('');
                    setContract(null);
                }
            });
        }
    }, []);

    return (
        <Web3Context.Provider value={{ connectWallet, currentAccount, contract, role, loading }}>
            {children}
        </Web3Context.Provider>
    );
};
