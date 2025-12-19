# Institutional Credit Scoring: Data Sources & Logic

This document outlines the logic behind the credit metrics and history events displayed in the dashboard. Currently, these are simulated based on the wallet profile, but they represent real on-chain and off-chain data points defined in the Institutional Credit Specification.

## 1. Credit Metrics (評価項目)

### 🏛️ Treasury Health (財務健全性)
**What it references:**
- **On-Chain Assets**: Total Value Locked (TVL) in Safe Multisig wallets (USDC, ETH, cbETH).
- **Runway**: Ratio of liquid assets to monthly burn rate.
- **Diversification**: Concentration risk (e.g., 90% in volatile governance tokens vs Stablecoins).

**Simulation Logic:**
- **Prime (95)**: >$10M Liquid Assets, >24 months runway.
- **High Growth (75)**: >$2M Liquid Assets, >12 months runway (Post-Series A profile).
- **Speculative (35)**: Low liquidity, high dependence on native token price.

### 📈 Cash Flow Strength (収益力)
**What it references:**
- **Revenue Quality**: Consistent on-chain revenue (e.g., Protocol fees, NFT royalties).
- **Stability**: Volatility of monthly inflows.
- **Operating Margin**: Inflows vs Outflows (Burn rate).

**Simulation Logic:**
- **Prime (88)**: Profitable protocol with stable fee generation (e.g., Aave, Uniswap DAO).
- **High Growth (45)**: High revenue growth but high burn rate (Investment phase).
- **Speculative (20)**: Pre-revenue or highly sporadic income.

### 🤝 On-Chain Reputation (信用履歴)
**What it references:**
- **Lending History**: Repayment track record on Aave, Compound, Maple, Goldfinch.
- **Wallet Age**: Time since first transaction (Nonce analysis).
- **Governance**: Active participation in major DAO governance (Signal/Snapshot).

**Simulation Logic:**
- **Prime (98)**: 3+ years history, 0 defaults, high governance activity.
- **High Growth (78)**: 1-2 years history, active but shorter track record.
- **Speculative (40)**: <6 months history, no significant lending interactions.

---

## 2. Transaction History (取引履歴)

The "History" section logs critical credit-related events verified by ZK proofs.

| Event Type | Description | Source |
|:---|:---|:---|
| **Credit Check** | The entity requested a credit reassessment. | **Dashboard Interaction** (User initiated) |
| **Treasury Audit** | Automatic verification of asset balances via ZK circuits. | **Chainlink Functions / Base RPC** |
| **Loan Repayment** | Successfully repaid a loan or interest payment. | **The Graph** (Indexing Lending Protocols) |
| **Wallet Activation** | Initial setup of the credit profile. | **Registry Contract** |

## 3. Profile Mapping (Current Implementation)

For the purpose of the demo, we map the **last character** of the wallet address to these profiles:

- **0-4 → Prime**: Representing blue-chip DeFi protocols or public companies.
- **5-9 → High Growth**: Representing VC-backed startups or growing DAOs.
- **a-f → Speculative**: Representing early-stage projects or experiments.

## 4. Scoring Algorithm & Weights (比重設定)

The Institutional Credit Score (0-850) is calculated based on the weighted sum of the three key metrics.

| Feature (特徴量) | Weight (比重) | Rationale (理由) |
|:---|:---:|:---|
| **Treasury Health** | **40%** | **Collateral Capacity**: In undercollateralized lending, the "worst-case" recovery value (Treasury) is the most critical safety factor. |
| **Cash Flow Strength** | **30%** | **Repayment Capacity**: Ability to service regular interest payments and principal without relying solely on treasury liquidation. |
| **On-Chain Reputation** | **30%** | **Willingness to Repay**: Historical behavior is a strong predictor of future reliability in decentralized systems. |

### Calculation Formula
```javascript
// Base Score: 300 (Minimum)
// Max Additional: 550 (Total 850)

WeightedMetric = (Treasury * 0.4) + (CashFlow * 0.3) + (Reputation * 0.3)
FinalScore = 300 + (WeightedMetric / 100 * 550)
```

**Why 300 Base? (300点の理由)**
- **Traditional Alignment**: Aligns with traditional FICO Score ranges (300-850), making it intuitive for institutional borrowers and lenders.
- **Identity Value**: Just by having a verified entity wallet with valid KYC/KYB (even with low metrics), the entity has non-zero value compared to an anonymous address.
- **Psychological Floor**: Prevents "0 score" shock; a score of 300 indicates "Verified but High Risk", whereas 0 implies "Unverified/Invalid".
