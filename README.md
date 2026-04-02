# 🌍 StacksVault

> **Send money. Save automatically. Build wealth — on Bitcoin.**  
> A programmable remittance protocol on Stacks where senders can instantly transfer funds while automatically locking a percentage into a yield-generating savings vault. Recipients get immediate cash + long-term financial growth.

![Stacks](https://img.shields.io/badge/Stacks-Bitcoin_L2-5546FF?style=for-the-badge)
![Clarity](https://img.shields.io/badge/Clarity-Smart_Contracts-black?style=for-the-badge)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![STX](https://img.shields.io/badge/Token-STX-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-In_Development-yellow?style=for-the-badge)

---

## 📖 Table of Contents

- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [How It Works](#-how-it-works)
- [Architecture](#-architecture)
- [Smart Contracts](#-smart-contracts)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Contract Deployment](#-contract-deployment)
- [Frontend Setup](#-frontend-setup)
- [Running Tests](#-running-tests)
- [User Roles](#-user-roles)
- [Remittance Flow](#-remittance-flow)
- [Savings Parameters](#-savings-parameters)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌍 The Problem

Global remittances exceed **$700B annually**, yet millions of families still struggle financially:

- High fees reduce the value sent home  
- Funds arrive as **raw cash** with no structure  
- Recipients spend immediately due to urgent needs  
- No built-in mechanism for **saving or investing**  
- Families remain stuck in a cycle of short-term survival  

Money is sent to support loved ones — but rarely builds long-term wealth.

---

## ✅ The Solution

**StacksVault** transforms remittances into a **wealth-building tool**.

1. Sender transfers funds globally  
2. Chooses a savings percentage (e.g., 30%)  
3. Recipient gets instant access to the remaining funds  
4. Locked portion is stored in a **vault contract**  
5. Savings grow over time via yield mechanisms  
6. Recipient withdraws later with accumulated value  

Same money. Smarter outcomes.

---
SENDER STACKSVAULT RECIPIENT
│ │ │
│── Send 100 STX ─────────►│ │
│ (30% savings lock) │ │
│ │ │
│ │── 70 STX ────────────────────►│
│ │ (instant access) │
│ │ │
│ │── 30 STX ──► Vault │
│ │ │
│ │ Yield accrues over time │
│ │ │
│ │◄── Withdraw savings ──────────│
│ │ (principal + yield) │


---

## 🏗️ Architecture
┌──────────────────────────────────────────────────────────────┐
│ REACT FRONTEND │
│ Sender │ Recipient │ Savings Dashboard │
└──────────────────────────┬───────────────────────────────────┘
│ @stacks/connect
│ @stacks/transactions
┌──────────────────────────▼───────────────────────────────────┐
│ CLARITY SMART CONTRACTS (STACKS) │
│ remittance │ vault │ yield │ registry │
└──────────────────────────┬───────────────────────────────────┘
│
┌──────────────────────────▼───────────────────────────────────┐
│ OPTIONAL BACKEND (Node.js) │
│ indexing │ notifications │ analytics │
└──────────────────────────────────────────────────────────────┘


---

## 📜 Smart Contracts

### `remittance.clar`
Handles remittance logic and fund splitting.

| Function | Description |
|----------|-------------|
| `send-remittance()` | Splits funds into instant + savings |
| `calculate-split()` | Computes allocation based on percentage |

---

### `vault.clar`
Stores and manages locked savings.

| Function | Description |
|----------|-------------|
| `deposit()` | Store locked funds |
| `withdraw()` | Withdraw savings |
| `get-balance()` | Query user vault balance |
| `get-lock-time()` | Check lock duration |

---

### `yield.clar`
Handles yield accrual using index-based accounting.

| Function | Description |
|----------|-------------|
| `update-yield()` | Updates global yield index |
| `get-user-balance-with-yield()` | Returns balance with yield |

---

### `registry.clar`
Manages users and optional permissions.

| Function | Description |
|----------|-------------|
| `register-user()` | Register participant |
| `is-whitelisted()` | Check access permissions |

---

### Error Codes

```clarity
(define-constant err-invalid-percentage (err u100))
(define-constant err-insufficient-balance (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-no-balance (err u103))
(define-constant err-lock-active (err u104))
🛠️ Tech Stack
Layer	Technology
Blockchain	Stacks (Bitcoin L2)
Smart Contracts	Clarity
Frontend	React + TypeScript
Wallet	Hiro Wallet
SDK	@stacks/connect, @stacks/transactions
Backend	Node.js (optional)
Storage	IPFS (optional)
Testing	Clarinet
📁 Project Structure
stacksvault/
├── contracts/
│   ├── remittance.clar
│   ├── vault.clar
│   ├── yield.clar
│   └── registry.clar
├── tests/
│   ├── remittance_test.ts
│   ├── vault_test.ts
│   └── yield_test.ts
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── hooks/
├── Clarinet.toml
└── README.md
🚀 Getting Started
Prerequisites
npm install -g @hirosystems/clarinet
node --version
Clone the repo
git clone https://github.com/YOUR_USERNAME/stacksvault.git
cd stacksvault
🔗 Contract Deployment
clarinet check
clarinet deploy
💻 Frontend Setup
cd frontend
npm install
npm run dev

Install Hiro Wallet and connect to testnet.

🧪 Running Tests
clarinet test
👥 User Roles
💸 Sender
Sends remittances
Chooses savings percentage
Initiates transaction
👨‍👩‍👧 Recipient
Receives instant funds
Accumulates savings
Withdraws later
🏦 Vault System
Stores locked funds
Applies yield logic
Enforces withdrawal rules
🔁 Remittance Flow
Send → Split → Instant Transfer → Vault Deposit → Yield → Withdraw
📊 Savings Parameters
Parameter	Value
Lock percentage	0–100%
Default savings	20–40%
Yield model	Index-based
Withdrawal	On-demand (or time-locked)
Token	STX / SIP-010
🗺️ Roadmap
Phase 1 — Contracts ✅
 Remittance splitting logic
 Vault storage system
 Yield simulation
 Basic tests
Phase 2 — Frontend 🔄
 Sender interface
 Recipient dashboard
 Savings visualization
Phase 3 — Advanced Features 🔄
 Time-locked savings
 Multi-token support
 Notifications
Phase 4 — Mainnet 🔜
 Security audit
 Mainnet deployment
 Mobile optimization
🤝 Contributing
git checkout -b feat/your-feature
git commit -m "feat: add feature"
git push origin feat/your-feature
📄 License

MIT License

🙏 Acknowledgements
Stacks Foundation — Bitcoin smart contract ecosystem
Hiro Wallet — wallet infrastructure
Clarinet — development and testing tools
<div align="center">

Built on Bitcoin. Built for families.

⭐ Star this repo if StacksVault matters to you

</div> ```

## ⚙️ How It Works
