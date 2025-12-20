// Smart Wallet Simulation Logic

// Smart Wallet Simulation Logic

// State
const state = {
    connectedAddress: null,
    viewingAddress: null,
    history: [], // [{ address, score, tier, timestamp }]
    isVirtual: false // flag for smart wallet
};

// DOM Elements
const connectBtn = document.getElementById('connect-btn');
const launchAppBtn = document.getElementById('launch-app-btn');
const heroSection = document.querySelector('.hero');
const dashboardSection = document.getElementById('dashboard');
const walletAddressDisplay = document.getElementById('wallet-address');
const navLogo = document.querySelector('.nav-logo');

// Wallet Switcher Elements
const walletContainer = document.querySelector('.wallet-container');
const walletDropdown = document.getElementById('wallet-dropdown');
const dropdownCurrent = document.getElementById('dropdown-current');
const dropdownHistory = document.getElementById('dropdown-history');
const switchAddressBtn = document.getElementById('switch-address-btn');

// Login Modal
const loginModal = document.getElementById('login-modal');
const passkeyLoginBtn = document.getElementById('passkey-login-btn');
const loginStep1 = document.getElementById('login-step-1');
const loginStep2 = document.getElementById('login-step-2');

// Address Input Modal
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
    checkVirtualSession();

    // Global Event Listeners
    setupEventListeners();
});

function setupEventListeners() {
    if (connectBtn) connectBtn.onclick = openLoginModal;
    if (launchAppBtn) launchAppBtn.onclick = openLoginModal;

    if (passkeyLoginBtn) passkeyLoginBtn.onclick = handlePasskeyLogin;

    // Logo Click - Reset App
    if (navLogo) {
        navLogo.onclick = (e) => {
            e.preventDefault();
            resetApp();
        };
    }

    // Dropdown Toggling - Global Click
    document.addEventListener('click', (e) => {
        if (walletContainer && walletContainer.contains(e.target)) {
            // inside click, handled by logic
        } else {
            closeDropdown();
        }
    });

    // Modal
    if (switchAddressBtn) switchAddressBtn.onclick = openAddressModal;
    if (closeModalBtn) closeModalBtn.onclick = closeAddressModal;
    if (modalSubmitBtn) modalSubmitBtn.onclick = handleAddressSubmit;
    if (modalInput) {
        modalInput.onkeypress = (e) => {
            if (e.key === 'Enter') handleAddressSubmit();
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

// --- Smart Wallet Logic ---

function checkVirtualSession() {
    const storedSession = localStorage.getItem('virtual_session_address');
    if (storedSession) {
        loginWithVirtualAddress(storedSession);
    }
}

function openLoginModal() {
    if (state.connectedAddress) {
        toggleDropdown();
        return;
    }
    // Reset Modal State
    if (loginStep1) loginStep1.style.display = 'block';
    if (loginStep2) loginStep2.style.display = 'none';
    if (loginModal) loginModal.classList.add('open');
}

function closeLoginModal() {
    if (loginModal) loginModal.classList.remove('open');
}

function handlePasskeyLogin() {
    // Show Loading
    if (loginStep1) loginStep1.style.display = 'none';
    if (loginStep2) loginStep2.style.display = 'block';

    // Simulate Biometric Scan & Chain Creation Delay
    setTimeout(() => {
        createVirtualWallet();
    }, 1500);
}

function createVirtualWallet() {
    // Generate a random address representing a smart wallet (ending in 8ase for fun)
    const randomHex = Array(36).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    const address = `0x${randomHex}8ae5`; // 8aes -> Base-ish

    // Persist
    localStorage.setItem('virtual_session_address', address);

    loginWithVirtualAddress(address);
    closeLoginModal();
}

function loginWithVirtualAddress(address) {
    state.connectedAddress = address;
    state.isVirtual = true;

    // If we were not viewing anyone specific, view own
    if (!state.viewingAddress) {
        state.viewingAddress = address;
    }

    console.log('Smart Wallet Connected:', address);
    updateUI();

    if (state.viewingAddress && state.connectedAddress && state.viewingAddress.toLowerCase() === state.connectedAddress.toLowerCase()) {
        fetchAndRenderScore(state.viewingAddress);
    }
}

function resetApp() {
    // Clear State
    state.connectedAddress = null;
    state.viewingAddress = null;
    state.isVirtual = false;

    // Clear Persistence
    localStorage.removeItem('virtual_session_address');

    // Reset UI
    updateUI();

    // Close dropdowns/modals
    closeDropdown();
    closeLoginModal();
    closeAddressModal();

    console.log('App reset to initial state');
}


// --- Viewing Logic ---

function viewAddress(address) {
    if (!address) return;

    state.viewingAddress = address.toLowerCase();
    closeAddressModal();
    updateUI();
    fetchAndRenderScore(state.viewingAddress);
}

function returnToMyScore() {
    if (state.connectedAddress) {
        viewAddress(state.connectedAddress);
    } else {
        openLoginModal();
    }
}

function fetchAndRenderScore(address) {
    console.log('Fetching score for:', address);

    // Reset UI state
    resetOffers();

    // Simulate API call
    setTimeout(() => {
        const data = getMockDataForAddress(address); // Use the weighted logic
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
        if (dashboardSection) dashboardSection.style.display = 'block';
    } else {
        if (heroSection) heroSection.style.display = 'flex';
        if (dashboardSection) dashboardSection.style.display = 'none';
    }

    // 2. Connect Button & Dropdown
    if (state.connectedAddress) {
        if (connectBtn) connectBtn.classList.add('connected');

        // If viewing someone else, show "Viewing: 0x..."
        if (state.viewingAddress && state.connectedAddress.toLowerCase() !== state.viewingAddress.toLowerCase()) {
            if (connectBtn) {
                connectBtn.textContent = `Viewing: ${shorten(state.viewingAddress)}`;
                connectBtn.style.background = '#6B7D94'; // Slate
                connectBtn.style.color = '#fff';
                connectBtn.style.border = '1px solid rgba(255,255,255,0.2)';
            }
        } else {
            // Smart Wallet ID (Passkey)
            if (connectBtn) {
                connectBtn.innerHTML = '🔑 ' + shorten(state.connectedAddress);
                connectBtn.style.background = '#fff';
                connectBtn.style.color = '#000';
                connectBtn.style.border = 'none';
            }
        }

        // Dropdown Current
        if (dropdownCurrent) {
            dropdownCurrent.innerHTML = `
                <div class="dropdown-item-content">
                    <h4>${shorten(state.connectedAddress)}</h4>
                    <p>${state.isVirtual ? 'Smart Wallet (Passkey)' : 'Connected Wallet'}</p>
                </div>
                ${(!state.viewingAddress || (state.connectedAddress && state.viewingAddress.toLowerCase() === state.connectedAddress.toLowerCase())) ? '<span style="color:#10B981">●</span>' : ''}
            `;
            dropdownCurrent.onclick = () => {
                viewAddress(state.connectedAddress);
                closeDropdown();
            };
        }
    } else {
        if (connectBtn) {
            connectBtn.innerHTML = 'Login with Passkey';
            connectBtn.classList.remove('connected');
            connectBtn.style.background = '#fff';
            connectBtn.style.color = '#000';
        }
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
    const normalized = address.toLowerCase();
    state.history = state.history.filter(h => h.address.toLowerCase() !== normalized);
    state.history.unshift({
        address: normalized,
        score: score,
        tier: tier,
        timestamp: Date.now()
    });
    if (state.history.length > 5) state.history.pop();
    localStorage.setItem('base_score_history', JSON.stringify(state.history));
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

function openAddressModal() {
    closeDropdown();
    if (addressModal) {
        addressModal.classList.add('open');
        if (modalInput) modalInput.focus();
    }
}

function closeAddressModal() {
    if (addressModal) addressModal.classList.remove('open');
    if (modalInput) modalInput.value = '';
}

function handleAddressSubmit() {
    const val = modalInput.value.trim();
    if (!val) return;
    // Mock ENS resolution (same as before)
    if (val.endsWith('.eth')) {
        let hash = 0;
        for (let i = 0; i < val.length; i++) hash = val.charCodeAt(i) + ((hash << 5) - hash);
        let addr = '0x';
        for (let i = 0; i < 20; i++) addr += Math.abs((hash >> (i * 2)) & 0xFF).toString(16).padStart(2, '0');
        if (addr.length < 42) addr = addr.padEnd(42, '0');
        viewAddress(addr);
    } else {
        viewAddress(val);
    }
}

function shorten(addr) {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}


// --- Mock Data Logic (Weighted) ---

function getMockDataForAddress(address) {
    if (!address) return { score: 0, tier: 'UNKNOWN', metrics: null, history: [] };

    // 1. Deterministic Hash from Address
    let hash = 0;
    for (let i = 0; i < address.length; i++) {
        hash = (hash << 5) - hash + address.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    const seed = Math.abs(hash);

    // 2. Generate Metrics (0-100) based on seed segments
    const treasury = (seed % 100);
    const cashFlow = ((seed >> 2) % 100);
    const reputation = ((seed >> 4) % 100);

    // Ensure roughly realistic minimums
    const m_treasury = 40 + (treasury * 0.6);
    const m_cashFlow = 20 + (cashFlow * 0.8);
    const m_reputation = 30 + (reputation * 0.7);

    // 3. Calculate Weighted Score
    const weightedSum = (m_treasury * 0.4) + (m_cashFlow * 0.3) + (m_reputation * 0.3);
    const score = Math.floor(300 + (weightedSum / 100 * 550));

    // 4. Determine Tier
    let tier = 'SPECULATIVE';
    if (score >= 700) tier = 'PRIME';
    else if (score >= 500) tier = 'HIGH GROWTH';

    // 5. Generate Textual History
    let history = [];
    const txPrefix = address.slice(0, 6);

    if (tier === 'PRIME') {
        history = [
            { date: '2025-12-20', event: 'Liquidity Proof Verified', status: 'Verified', tx: txPrefix + '...a1' },
            { date: '2025-11-15', event: 'Loan Repayment (On-Time)', status: 'Approved', tx: txPrefix + '...b2' }
        ];
    } else if (tier === 'HIGH GROWTH') {
        history = [
            { date: '2025-12-18', event: 'Credit Limit Increased', status: 'Approved', tx: txPrefix + '...c3' },
            { date: '2025-10-30', event: 'New Collateral Added', status: 'Verified', tx: txPrefix + '...d4' }
        ];
    } else {
        history = [
            { date: '2025-12-19', event: 'Wallet Activation', status: 'Verified', tx: txPrefix + '...e5' },
            { date: '2025-12-01', event: 'Low Balance Warning', status: 'Pending', tx: txPrefix + '...f6' }
        ];
    }

    return {
        score,
        tier,
        metrics: {
            treasury: Math.round(m_treasury),
            cashFlow: Math.round(m_cashFlow),
            reputation: Math.round(m_reputation)
        },
        history
    };
}


// --- Dashboard UI Helpers ---

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
