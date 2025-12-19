import { createWalletClient, custom } from 'https://esm.sh/viem';
import { base } from 'https://esm.sh/viem/chains';

// Configuration
const CHAIN = base;

// State
const state = {
    connectedAddress: null,
    viewingAddress: null,
    history: [] // [{ address, score, tier, timestamp }]
};

// DOM Elements
const connectBtn = document.getElementById('connect-btn');
const launchAppBtn = document.getElementById('launch-app-btn');
const heroSection = document.querySelector('.hero');
const dashboardSection = document.getElementById('dashboard');
const walletAddressDisplay = document.getElementById('wallet-address');

// Wallet Switcher Elements
const walletContainer = document.querySelector('.wallet-container');
const walletDropdown = document.getElementById('wallet-dropdown');
const dropdownCurrent = document.getElementById('dropdown-current');
const dropdownHistory = document.getElementById('dropdown-history');
const switchAddressBtn = document.getElementById('switch-address-btn');

// Modal Elements
const addressModal = document.getElementById('address-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalSubmitBtn = document.getElementById('modal-submit-btn');
const modalInput = document.getElementById('modal-address-input');

// Banner & Actions
const viewingBanner = document.getElementById('viewing-banner');
const exitViewingModeBtn = document.getElementById('exit-viewing-mode');
const viewingAddressShort = document.getElementById('viewing-address-short');
const generateProofBtn = document.getElementById('generate-proof-btn');

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    console.log('Base Score Institutional App initialized');
    loadHistory();
    checkConnection();

    // Global Event Listeners
    setupEventListeners();
});

function setupEventListeners() {
    if (connectBtn) {
        // Remove old listeners by cloning or just overwriting (assigning onclick is safer for simple scripts)
        // For cleaner event handling, we will rely on our new logic. 
        // Note: The previous script added listeners via addEventListener. 
        // Since we are rewriting the file, the old listeners are gone from the code perspective, 
        // but if the page is not reloaded, they might persist in memory? 
        // We rely on page reload usually, but here we are editing the source.

        connectBtn.onclick = handleConnectClick;
    }

    if (launchAppBtn) launchAppBtn.onclick = connectWallet;

    // Dropdown Toggling - Global Click
    document.addEventListener('click', (e) => {
        if (walletContainer && walletContainer.contains(e.target)) {
            // inside click, handled by button
        } else {
            closeDropdown();
        }
    });

    // Modal
    if (switchAddressBtn) switchAddressBtn.onclick = openModal;
    if (closeModalBtn) closeModalBtn.onclick = closeModal;
    if (modalSubmitBtn) modalSubmitBtn.onclick = handleModalSubmit;
    if (modalInput) {
        modalInput.onkeypress = (e) => {
            if (e.key === 'Enter') handleModalSubmit();
        };
    }

    // Viewing Mode
    if (exitViewingModeBtn) exitViewingModeBtn.onclick = returnToMyScore;

    // Watch for dropdown history clicks
    if (dropdownHistory) {
        dropdownHistory.onclick = (e) => {
            const row = e.target.closest('.dropdown-item');
            if (row && row.dataset.address) {
                viewAddress(row.dataset.address);
                closeDropdown();
            }
        };
    }
}

// --- Wallet Logic ---

async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        alert('MetaMask is not installed!');
        return;
    }

    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];

        state.connectedAddress = address;
        // If we were not viewing anyone specific, or just starting, view own
        if (!state.viewingAddress) {
            state.viewingAddress = address;
        }

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${CHAIN.id.toString(16)}` }],
            });
        } catch (switchError) {
            // Ignore error for demo
        }

        console.log('Connected:', address);
        updateUI();

        // If viewing own, fetch score
        if (state.viewingAddress.toLowerCase() === state.connectedAddress.toLowerCase()) {
            fetchAndRenderScore(state.viewingAddress);
        }

    } catch (error) {
        console.error('Connection error:', error);
    }
}

async function checkConnection() {
    if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            state.connectedAddress = accounts[0];
            // If checking connection on load and not viewing anything, view own
            if (!state.viewingAddress) {
                state.viewingAddress = state.connectedAddress;
            }
            console.log('Restored connection:', state.connectedAddress);
            updateUI();
            fetchAndRenderScore(state.viewingAddress);
        }
    }
}

function handleConnectClick(e) {
    if (!state.connectedAddress) {
        connectWallet();
    } else {
        // Already connected, toggle dropdown
        // e.stopPropagation() is needed on the button click to avoid immediate close by document listener
        if (e) e.stopPropagation();
        toggleDropdown();
    }
}

// --- Viewing Logic ---

function viewAddress(address) {
    if (!isValidAddress(address)) {
        alert('Invalid address format');
        return;
    }

    state.viewingAddress = address.toLowerCase();
    closeModal();
    updateUI();
    fetchAndRenderScore(state.viewingAddress);
}

function returnToMyScore() {
    if (state.connectedAddress) {
        viewAddress(state.connectedAddress);
    } else {
        connectWallet();
    }
}

function fetchAndRenderScore(address) {
    console.log('Fetching score for:', address);

    // Reset UI state
    resetOffers();

    // Simulate API call
    setTimeout(() => {
        const data = getMockDataForAddress(address);
        updateScoreUI(data.score, data.tier, data.metrics);
        unlockOffers(data.score, data.tier);
        renderHistoryTable(data.history);

        // Add to history
        addToHistory(address, data.score, data.tier);
    }, 600);
}

// --- UI Updates ---

function updateUI() {
    // 1. Toggle Sections
    if (state.connectedAddress || state.viewingAddress) {
        if (heroSection) heroSection.style.display = 'none';
        if (dashboardSection) {
            dashboardSection.style.display = 'block';
            // Scroll only if just switching to dashboard? No, maybe annoying if switching addresses.
        }
    } else {
        if (heroSection) heroSection.style.display = 'flex';
        if (dashboardSection) dashboardSection.style.display = 'none';
    }

    // 2. Connect Button & Dropdown
    if (state.connectedAddress) {
        connectBtn.classList.add('connected');

        // If viewing someone else, show "Viewing: 0x..."
        if (state.viewingAddress && state.connectedAddress.toLowerCase() !== state.viewingAddress.toLowerCase()) {
            connectBtn.textContent = `Viewing: ${shorten(state.viewingAddress)}`;
            connectBtn.style.background = '#6B7D94'; // Slate
            connectBtn.style.color = '#fff';
            connectBtn.style.border = '1px solid rgba(255,255,255,0.2)';
        } else {
            connectBtn.textContent = shorten(state.connectedAddress);
            connectBtn.style.background = ''; // reset to CSS
            connectBtn.style.color = '';
            connectBtn.style.border = '';
        }

        // Dropdown Current
        if (dropdownCurrent) {
            dropdownCurrent.innerHTML = `
                <div class="dropdown-item-content">
                    <h4>${shorten(state.connectedAddress)}</h4>
                    <p>Connected Wallet</p>
                </div>
                ${(!state.viewingAddress || state.connectedAddress.toLowerCase() === state.viewingAddress.toLowerCase()) ? '<span style="color:#10B981">●</span>' : ''}
            `;
            dropdownCurrent.onclick = () => {
                viewAddress(state.connectedAddress);
                closeDropdown();
            };
        }

    } else {
        connectBtn.textContent = 'Connect Entity Wallet';
        connectBtn.classList.remove('connected');
        connectBtn.style.background = ''; // reset
    }

    // 3. Banner
    if (viewingBanner) {
        if (state.viewingAddress && state.connectedAddress &&
            state.viewingAddress.toLowerCase() !== state.connectedAddress.toLowerCase()) {

            viewingBanner.style.display = 'flex';
            if (viewingAddressShort) viewingAddressShort.textContent = shorten(state.viewingAddress);

            // Disable actions
            if (generateProofBtn) {
                generateProofBtn.disabled = true;
                generateProofBtn.style.opacity = '0.5';
                generateProofBtn.textContent = 'Proof Generation Disabled';
                generateProofBtn.style.cursor = 'not-allowed';
            }
        } else {
            viewingBanner.style.display = 'none';

            // Enable actions
            if (generateProofBtn) {
                generateProofBtn.disabled = false;
                generateProofBtn.style.opacity = '1';
                generateProofBtn.textContent = 'Generate ZK Proof';
                generateProofBtn.style.cursor = 'pointer';
            }
        }
    }

    // 4. Update Wallet Display in Dashboard
    if (walletAddressDisplay && state.viewingAddress) {
        walletAddressDisplay.textContent = state.viewingAddress;
    }

    // 5. Render Dropdown History
    renderDropdownHistory();
}

// --- History Management ---

function loadHistory() {
    const stored = localStorage.getItem('base_score_history');
    if (stored) {
        try {
            state.history = JSON.parse(stored);
        } catch (e) {
            console.error('Failed to parse history');
        }
    }
}

function addToHistory(address, score, tier) {
    if (!address) return;

    // Remove existing if present to move to top
    const normalized = address.toLowerCase();
    state.history = state.history.filter(h => h.address.toLowerCase() !== normalized);

    // Add new
    state.history.unshift({
        address: normalized,
        score: score,
        tier: tier,
        timestamp: Date.now()
    });

    // Limit to 5
    if (state.history.length > 5) state.history.pop();

    localStorage.setItem('base_score_history', JSON.stringify(state.history));

    // Re-render if dropdown open (or just to be safe)
    renderDropdownHistory();
}

function renderDropdownHistory() {
    if (!dropdownHistory) return;

    if (state.history.length === 0) {
        dropdownHistory.innerHTML = '<div style="padding:1rem; text-align:center; color:gray; font-size:0.8rem;">No recent history</div>';
        return;
    }

    dropdownHistory.innerHTML = state.history.map(item => `
        <div class="dropdown-item ${item.address.toLowerCase() === state.viewingAddress?.toLowerCase() ? 'active' : ''}" data-address="${item.address}">
            <div class="dropdown-item-content">
                <h4>${shorten(item.address)}</h4>
                <p>Score: ${item.score} (${item.tier})</p>
            </div>
        </div>
    `).join('');
}


// --- Modal & Helpers ---

function toggleDropdown() {
    if (!state.connectedAddress || !walletDropdown) return;
    walletDropdown.classList.toggle('show');
}

function closeDropdown() {
    if (walletDropdown) walletDropdown.classList.remove('show');
}

function openModal() {
    closeDropdown();
    if (addressModal) {
        addressModal.classList.add('open');
        if (modalInput) modalInput.focus();
    }
}

function closeModal() {
    if (addressModal) addressModal.classList.remove('open');
    if (modalInput) modalInput.value = '';
}

function handleModalSubmit() {
    const val = modalInput.value.trim();
    if (!val) return;

    // Mock ENS resolution
    if (val.endsWith('.eth')) {
        // Deterministic mock resolve: Hash the string to get a mock address
        let hash = 0;
        for (let i = 0; i < val.length; i++) {
            hash = val.charCodeAt(i) + ((hash << 5) - hash);
        }
        // Convert to hex
        let color = '#';
        let addr = '0x';
        for (let i = 0; i < 20; i++) {
            // Simple pseudo-random byte
            const byte = Math.abs((hash >> (i * 2)) & 0xFF).toString(16).padStart(2, '0');
            addr += byte;
        }
        // Ensure length
        if (addr.length < 42) addr = addr.padEnd(42, '0');

        viewAddress(addr);
    } else {
        viewAddress(val);
    }
}

function isValidAddress(address) {
    if (!address) return false;
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function shorten(addr) {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}


// --- Mock Data & Dashboard Logic ---

// Mock Data Generators based on Address (Institutional Logic)
function getMockDataForAddress(address) {
    // Generate profile based on the last character of the address
    const lastChar = address.slice(-1).toLowerCase();

    let tier, metrics, history;

    // 1. Define Metrics based on Profile
    if (/[0-4]/.test(lastChar)) {
        // Wallet 1: Prime Tier (Ideal)
        tier = 'PRIME';
        metrics = { treasury: 95, cashFlow: 88, reputation: 98 };
        history = [
            { date: '2025-12-19', event: 'Credit Check', status: 'Approved', tx: address.slice(0, 6) + '...a1' },
            { date: '2025-11-20', event: 'Treasury Audit', status: 'Verified', tx: '0xb2...c3' },
            { date: '2025-10-05', event: 'Loan Repayment', status: 'Verified', tx: '0xd4...e5' }
        ];

    } else if (/[5-9]/.test(lastChar)) {
        // Wallet 2: High Growth (Growth Phase)
        tier = 'HIGH GROWTH';
        metrics = { treasury: 75, cashFlow: 45, reputation: 78 };
        history = [
            { date: '2025-12-19', event: 'Credit Check', status: 'Approved', tx: address.slice(0, 6) + '...f6' },
            { date: '2025-12-10', event: 'Liquidity Provision', status: 'Verified', tx: '0xa1...b2' }
        ];

    } else {
        // Wallet 3: Speculative (Early Stage)
        tier = 'SPECULATIVE';
        metrics = { treasury: 35, cashFlow: 20, reputation: 40 };
        history = [
            { date: '2025-12-19', event: 'Credit Check', status: 'Pending Review', tx: address.slice(0, 6) + '...c8' },
            { date: '2025-12-18', event: 'Wallet Activation', status: 'Verified', tx: '0x12...34' }
        ];
    }

    // 2. Calculate Weighted Score
    // Weight: Treasury 40%, Cash Flow 30%, Reputation 30%
    const weightedSum = (metrics.treasury * 0.4) + (metrics.cashFlow * 0.3) + (metrics.reputation * 0.3);

    // Formula: Base 300 + (WeightedSum% of 550)
    // Example: 100% -> 300 + 550 = 850
    // Example: 50%  -> 300 + 275 = 575
    const score = Math.floor(300 + (weightedSum / 100 * 550));

    return { score, tier, metrics, history };
}

function resetOffers() {
    const cards = document.querySelectorAll('.benefit-card');
    cards.forEach(card => {
        card.classList.remove('active');
        const status = card.querySelector('.benefit-status');
        if (status) {
            status.textContent = 'PENDING';
            status.classList.remove('unlocked');
            status.classList.add('locked');
        }
        const details = card.querySelector('.benefit-details p:first-child');
        if (details) details.textContent = 'Checking eligibility...';
    });
}

function updateScoreUI(score, tierName, metrics) {
    const scoreDisplay = document.getElementById('score-display');
    const tierDisplay = document.getElementById('tier-display');
    const metricsContainer = document.getElementById('metrics-container');

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
        if (tierName === 'PRIME') tierDisplay.style.color = '#D4AF37';
        else if (tierName === 'HIGH GROWTH') tierDisplay.style.color = '#10B981';
        else tierDisplay.style.color = '#6B7D94';
    }

    if (metricsContainer && metrics) {
        metricsContainer.innerHTML = `
            <div class="metric-item">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
                    <span style="color: var(--color-secondary-silver);">Treasury Health</span>
                    <span style="font-family: var(--font-mono);">${metrics.treasury}/100</span>
                </div>
                <div class="progress-bar"><div class="progress-fill" style="width: ${metrics.treasury}%"></div></div>
            </div>
            <div class="metric-item">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
                    <span style="color: var(--color-secondary-silver);">Cash Flow Strength</span>
                    <span style="font-family: var(--font-mono);">${metrics.cashFlow}/100</span>
                </div>
                <div class="progress-bar"><div class="progress-fill" style="width: ${metrics.cashFlow}%"></div></div>
            </div>
            <div class="metric-item">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
                    <span style="color: var(--color-secondary-silver);">On-Chain Reputation</span>
                    <span style="font-family: var(--font-mono);">${metrics.reputation}/100</span>
                </div>
                <div class="progress-bar"><div class="progress-fill" style="width: ${metrics.reputation}%"></div></div>
            </div>
        `;
    }
}

function unlockOffers(score, tier) {
    const delay = 1000;
    setTimeout(() => {
        if (score >= 400) activateCard('benefit-revolving', 'Limit: $50,000');
        else rejectCard('benefit-revolving');

        if (score >= 600) activateCard('benefit-term', 'Limit: $250,000');
        else rejectCard('benefit-term');

        if (score >= 800) activateCard('benefit-advisory', 'VIP Access Granted');
        else rejectCard('benefit-advisory');
    }, delay);
}

function activateCard(cardId, offerText) {
    const card = document.getElementById(cardId);
    if (!card) return;
    card.classList.add('active');
    const status = card.querySelector('.benefit-status');
    if (status) {
        status.textContent = 'APPROVED';
        status.classList.remove('locked');
        status.classList.add('unlocked');
    }
    if (offerText) {
        const details = card.querySelector('.benefit-details p:first-child');
        if (details) details.textContent = offerText;
    }
}

function rejectCard(cardId) {
    const card = document.getElementById(cardId);
    if (!card) return;
    const status = card.querySelector('.benefit-status');
    if (status) status.textContent = 'NOT ELIGIBLE';
    const details = card.querySelector('.benefit-details p:first-child');
    if (details) details.textContent = 'Score requirements not met';
}

function renderHistoryTable(mockHistory) {
    const tbody = document.getElementById('history-table-body');
    if (!tbody) return;
    const historyData = mockHistory || [];
    tbody.innerHTML = historyData.map(item => `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding: 1.5rem;">${item.date}</td>
            <td style="padding: 1.5rem; color: var(--color-primary); font-family: var(--font-body); font-weight: 600;">${item.event}</td>
            <td style="padding: 1.5rem;">
                <span style="padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.8rem; background: ${item.status === 'Approved' || item.status === 'Verified' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)'}; color: ${item.status === 'Approved' || item.status === 'Verified' ? '#10B981' : 'var(--color-secondary-slate)'};">${item.status}</span>
            </td>
            <td style="padding: 1.5rem; font-family: var(--font-mono); color: var(--color-secondary-bronze);">${item.tx}</td>
        </tr>
    `).join('');
}

// Watch for wallet changes from MetaMask directly
if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            console.log('Wallet disconnected');
            state.connectedAddress = null;
            // Maybe keep viewing, but connection is gone
            updateUI();
        } else if (accounts[0] !== state.connectedAddress) {
            console.log('Wallet changed:', accounts[0]);
            state.connectedAddress = accounts[0];
            // If we were viewing our own address, switch view to new address
            // If viewing someone else, keep viewing them but update connection status
            if (state.viewingAddress === null || state.viewingAddress.toLowerCase() === state.connectedAddress?.toLowerCase()) {
                state.viewingAddress = state.connectedAddress;
                fetchAndRenderScore(state.viewingAddress);
            }
            updateUI();
        }
    });
}
