import { createWalletClient, custom, http, parseEther, formatEther } from 'https://esm.sh/viem';
import { mainnet, base } from 'https://esm.sh/viem/chains';

// Configuration
const CHAIN = base;

// State
let walletClient;
let account;
let publicClient;

const connectBtn = document.getElementById('connect-btn');
const launchAppBtn = document.getElementById('launch-app-btn');
const heroSection = document.querySelector('.hero');
const dashboardSection = document.getElementById('dashboard');
const walletAddressDisplay = document.getElementById('wallet-address');

async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        alert('MetaMask is not installed!');
        return;
    }

    try {
        let address;

        // If already connected, assume user wants to switch/change wallet
        if (account) {
            try {
                await window.ethereum.request({
                    method: "wallet_requestPermissions",
                    params: [{ eth_accounts: {} }]
                });
            } catch (err) {
                console.log("User cancelled permission request/switch");
                return; // Exit if user cancelled
            }
        }

        // Request account access (returns new account if permissions changed, or current if not)
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        address = accounts[0];
        account = address;

        // Create Viem Client
        walletClient = createWalletClient({
            account,
            chain: CHAIN,
            transport: custom(window.ethereum)
        });

        // Switch Chain if needed
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${CHAIN.id.toString(16)}` }],
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                alert('Please add Base chain to your wallet.');
            }
        }

        console.log('Connected:', address);
        // Ensure UI updates even if address is same but "re-connected"
        updateUIOnConnect();

    } catch (error) {
        console.error('Connection error:', error);
    }
}

function updateUIOnConnect() {
    if (!account) return;

    // Update Header Button
    connectBtn.textContent = `${account.slice(0, 6)}...${account.slice(-4)}`;
    connectBtn.classList.add('connected');

    // Hide Hero, Show Dashboard (Simple transition for MVP)
    heroSection.style.display = 'none';
    if (dashboardSection) {
        dashboardSection.style.display = 'block';
        dashboardSection.scrollIntoView({ behavior: 'smooth' });
    }

    if (walletAddressDisplay) {
        walletAddressDisplay.textContent = account;
        walletAddressDisplay.onclick = connectWallet; // Allow clicking address to switch
    }

    // Trigger Score Calculation
    calculateAndProveScore();
    renderHistory();
}


// Mock Data Generators based on Address
function getMockDataForAddress(address) {
    // Generate a pseudo-random score based on the last char of the address
    const lastChar = address.slice(-1).toLowerCase();
    const code = lastChar.charCodeAt(0);

    let score, tier, history;

    if (code % 2 === 0) {
        // High Score
        score = 850;
        tier = 'ELITE';
        history = [
            { date: '2025-12-19', tier: 'ELITE', status: 'Active', tx: address.slice(0, 6) + '...e1' },
            { date: '2025-10-15', tier: 'ADVANCED', status: 'Expired', tx: '0xab...cd' }
        ];
    } else if (code % 3 === 0) {
        // Mid Score
        score = 650;
        tier = 'ADVANCED';
        history = [
            { date: '2025-12-19', tier: 'ADVANCED', status: 'Active', tx: address.slice(0, 6) + '...a2' }
        ];
    } else {
        // Low Score
        score = 350;
        tier = 'BEGINNER';
        history = [
            { date: '2025-12-19', tier: 'BEGINNER', status: 'Active', tx: address.slice(0, 6) + '...b3' }
        ];
    }

    return { score, tier, history };
}

async function calculateAndProveScore() {
    console.log('Starting ZK Proof Generation for:', account);

    // Reset Benefits UI first
    resetBenefits();

    console.log('Generating Proof...');
    await new Promise(r => setTimeout(r, 800));
    console.log('Proof Generated!');

    // Get Dynamic Mock Data
    const { score, tier, history } = getMockDataForAddress(account);
    console.log(`Mocking data for ${account}: Score ${score} (${tier})`);

    updateScoreUI(score, tier);
    unlockBenefits(score);
    renderHistory(history);
}

function resetBenefits() {
    const cards = document.querySelectorAll('.benefit-card');
    cards.forEach(card => {
        card.classList.remove('active');
        const status = card.querySelector('.benefit-status');
        if (status) {
            status.textContent = 'LOCKED';
            status.classList.remove('unlocked');
            status.classList.add('locked');
        }
    });
}


function updateScoreUI(score, tierName) {
    const scoreDisplay = document.querySelector('#dashboard .card-title').nextElementSibling.nextElementSibling.querySelector('div');
    const tierDisplay = document.querySelector('#dashboard h4');

    if (scoreDisplay) {
        let currentScore = 0;
        const interval = setInterval(() => {
            currentScore += 10;
            if (currentScore >= score) {
                currentScore = score;
                clearInterval(interval);
            }
            scoreDisplay.textContent = currentScore;
        }, 20);
    }

    if (tierDisplay) {
        tierDisplay.textContent = `TIER: ${tierName}`;
    }
}

function unlockBenefits(score) {
    const delay = 1000;

    setTimeout(() => {
        if (score >= 400) activateCard('benefit-gas');
        if (score >= 600) {
            const el = document.getElementById('benefit-aerodrome');
            if (el) { el.onclick = () => window.open('https://aerodrome.finance/', '_blank'); }
            activateCard('benefit-aerodrome');
        }
        if (score >= 800) {
            const el = document.getElementById('benefit-aave');
            if (el) { el.onclick = () => window.open('https://aave.com/', '_blank'); }
            activateCard('benefit-aave');
        }
    }, delay);
}

function activateCard(cardId) {
    const card = document.getElementById(cardId);
    if (!card) return;

    card.classList.add('active');
    const status = card.querySelector('.benefit-status');
    if (status) {
        status.textContent = 'UNLOCKED';
        status.classList.remove('locked');
        status.classList.add('unlocked');
    }
}

function renderHistory(mockHistory) {
    const tbody = document.getElementById('history-table-body');
    if (!tbody) return;

    // Use passed history or fallback
    const historyData = mockHistory || [];

    tbody.innerHTML = historyData.map(item => `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding: 1.5rem;">${item.date}</td>
            <td style="padding: 1.5rem; color: var(--color-primary); font-family: var(--font-mono);">${item.tier}</td>
            <td style="padding: 1.5rem;">
                <span style="
                    padding: 0.25rem 0.75rem; 
                    border-radius: 999px; 
                    font-size: 0.8rem; 
                    background: ${item.status === 'Active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
                    color: ${item.status === 'Active' ? '#10B981' : 'var(--color-secondary-slate)'};
                ">${item.status}</span>
            </td>
            <td style="padding: 1.5rem; font-family: var(--font-mono); color: var(--color-secondary-bronze);">${item.tx}</td>
        </tr>
    `).join('');
}

// Event Listeners
if (connectBtn) {
    connectBtn.addEventListener('click', connectWallet);
}

if (launchAppBtn) {
    launchAppBtn.addEventListener('click', connectWallet);
}

// Listen for account changes
if (window.ethereum) {
    window.ethereum.on('accountsChanged', handleAccountsChanged);
}

async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        console.log('Please connect to MetaMask.');
        account = null;
        connectBtn.textContent = 'Connect Wallet';
        window.location.reload();
    } else if (accounts[0] !== account) {
        account = accounts[0];
        console.log('Account changed to:', account);
        updateUIOnConnect();
    }
}



// Auto connect if authorized previously
async function checkConnection() {
    if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            account = accounts[0];
            console.log('Restored connection:', account);
            updateUIOnConnect();
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Base Score App initialized');
    checkConnection();
});
