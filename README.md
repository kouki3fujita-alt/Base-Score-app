# Base Score: Institutional Credit Protocol

**The first ZK-proven credit scoring layer for undercollateralized lending on Base.**

This repository contains the frontend and logic for the Base Score application, designed for the "12/13-20 大喜利.hack vibecoding mini hackathon".

## 📚 Documentation

- **[Project Overview (SUBMIT.md)](./SUBMIT.md)**: Features, Concept, and Hackathon submission details.
- **[Data Sources & Logic](./data_sources_and_logic.md)**: Detailed explanation of the scoring algorithm, mock data sources, and credit metrics (Treasury, Cash Flow, Reputation).

## 🚀 Features

- **Smart Wallet Login**: Instant onboarding via Passkey simulation (no extension required).
- **Multi-Wallet Switcher**: Seamlessly toggle between connected wallet and viewing other entity addresses.
- **Institutional Scoring**: Weighted scoring logic (0-850) based on on-chain financial health.
- **ZK Privacy (Concept)**: Architecture for proving creditworthiness without revealing sensitive data.

## 🛠 Tech Stack

- **Frontend**: Vanilla JS, CSS3, HTML5
- **Chain**: Base (Coinbase L2)
- **Libs**: Viem, Ethers.js

## 📦 Deployment

This project acts as a **Base Mini App**.
- `manifest.json` included for frame/mini-app support.
- Ready for deployment on Vercel/Netlify.
