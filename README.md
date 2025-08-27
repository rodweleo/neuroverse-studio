# Neuroverse

A Decentralized AI agent marketplace built on the Internet Computer Protocol (ICP) that enables users to create, deploy, and monetize AI agents in a fully decentralized environment. Additionally, users are incentivised for each agent created, and the $NEURO tokens earned can be used within the app or help with governance or staking operations.

---

# Presentations

- **Pitch Deck:** [Pitch Deck](https://www.canva.com/design/DAGuFAT-k7E/xcRwsxdpAvYvnvHsmZoJiw/edit?utm_content=DAGuFAT-k7E&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)
- **App Demo:** [Application Demo](https://loom.com/share/folder/6dc0f526ab2a48c98e77b8344f9fcb65)

## CANISTERS [LIVE]
**Frontend** : (https://l3s3w-uyaaa-aaaaj-a2fuq-cai.icp0.io)

**Backend**: (https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=l4t5c-zaaaa-aaaaj-a2fua-cai)

**Neuroverse NativeToken ($NEURO)**: (https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=7ekdu-syaaa-aaaaj-a2gaq-cai)

## Table of Contents

- [Overview](#overview)
- [Background](#background)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Folder Structure](#folder-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Overview

NeuroVerse addresses the centralization problem in AI development by providing a platform where developers and users can create, share, and monetize AI agents without relying on traditional cloud infrastructure. Built on ICP's blockchain technology, it ensures permanent availability, transparent transactions, and true ownership of AI assets.

## Background

Building and deploying AI agents today requires deep technical knowledge, expensive infrastructure, and limited ownership. Most platforms are centralized, restrict extensibility, and don't offer clear monetization for tool developers or contributors. As a result, non-technical users are left out, and developers have no sustainable incentive to build useful AI integrations. That is why Neuroverse was built.  
Neuroverse is a Web3-native, no-code platform that lets anyone create, customize, deploy, and monetize AI agents. All this is powered by the Internet Computer Protocol (ICP).  
Neuroverse was inspired by platforms like **_n8n_** and _**Make.com**_, but built entirely on-chain. Neuroverse grants users complete ownership of their agents and offer developers an open marketplace to monetize their tools.

**Who is it for?**

- AI developers seeking to deploy and monetize agents
- Users looking to interact with decentralized AI
- Web3 and blockchain enthusiasts

---

## Features

1. **AI Agent Creation & Deployment**

- Custom knowledge base integration (upload and manage documents)
- Configurable agent personalities and system prompts
- Template-based quick start options

2. **Monetization System**

- Direct ICP token earnings for agent creators
- Usage-based pricing model (free, premium, token-gated)
- Transparent transaction and earnings history

3. **Decentralized Infrastructure**

- Blockchain-based data storage (ICP canisters)
- Censorship-resistant deployment
- User-owned agents and data

4. **Modern User Interface**

- Responsive, mobile-friendly design
- Real-time chat interactions with AI agents
- Holographic and 3D visual elements

5. **Marketplace & Management**

- Discover, search, and filter AI agents
- Agent management dashboard for creators
- Developer portal for tool and agent submission

6. **Authentication & Payments**

- Internet Identity, Plug Wallet, and other Web3 auth
- ICP token payments and wallet integration

---

## Tech Stack

- **Frontend**

  - React (TypeScript)
  - TailwindCSS
  - Vite
  - Radix UI, Zustand, React Query, and more

- **Backend**

  - Internet Computer Protocol (ICP)
  - Motoko language (canisters)
  - MOPS package manager
  - Cloudflare Workers

- **AI/ML**

  - Langchain
  - Google Gemini

- **Other**
  - DFX SDK for local development and deployment
  - ICP Ledger and Auth libraries

---

## Installation

### System Requirements

- Node.js >= 16.0.0
- npm >= 7.0.0
- [DFX SDK](https://internetcomputer.org/docs/current/developer-docs/setup/install)
- Internet Computer Wallet (Plug, Stoic, etc.)

### Setup Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/rodweleo/neuroverse-studio.git
   cd neuroverse-studio
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the local ICP replica:**

   ```bash
   dfx start --clean --background
   ```

4. **Deploy the canisters:**

   ```bash
   dfx deploy
   ```

5. **Start the frontend development server:**
   ```bash
   cd src/neuroverse_frontend
   npm run dev
   ```

---

## Usage

- Access the app at [http://localhost:8080](http://localhost:8080) after running the dev server.
- Register or log in using Internet Identity or Plug Wallet.
- Deploy your own AI agent or interact with agents in the marketplace.
- Manage your agents, earnings, and knowledge base from the dashboard.

### Common Commands

- `npm run dev` – Start the frontend in development mode
- `npm run build` – Build the frontend for production
- `dfx start` – Start the local ICP replica
- `dfx deploy` – Deploy backend and frontend canisters

---

## Configuration

- **Environment Variables:**  
  The project may use a `.env` file for configuration (see `.gitignore` for exclusion).  
  By default, DFX outputs environment variables to `.env` as specified in `dfx.json`.
- **Network Configuration:**
  - Local development uses `regtest` Bitcoin network.
  - Production uses `testnet` (see `src/neuroverse_backend/Main.mo` for details).
- **ICP Canister IDs:**
  - Managed in `canister_ids.json` (auto-generated by DFX).

---

## Folder Structure

```
neuroverse-ai-hub/
│
├── dfx.json                # DFX project and canister configuration
├── mops.toml               # Motoko package manager config
├── package.json            # Root npm workspace config
├── canister_ids.json       # ICP canister IDs (auto-generated)
├── src/
│   ├── neuroverse_backend/ # Motoko backend canisters (AI, Bitcoin, FileVault, etc.)
│   └── neuroverse_frontend/
│       ├── src/            # React frontend source code
│       │   ├── components/ # UI and feature components
│       │   ├── hooks/      # React hooks
│       │   ├── functions/  # API and utility functions
│       │   ├── services/   # Local service logic (chat, analytics, payment, etc.)
│       │   ├── pages/      # App pages and routes
│       │   ├── utils/      # Utility functions and types
│       │   └── ...         # Other frontend assets
│       ├── public/         # Static assets (images, icons, etc.)
│       ├── package.json    # Frontend npm config
│       └── ...             # Frontend config files
└── README.md               # Project documentation

```

**Key Files:**

- `dfx.json`: Canister and network configuration for ICP
- `src/neuroverse_backend/Main.mo`: Main Motoko backend logic
- `src/neuroverse_frontend/src/App.tsx`: Frontend app entry point
- `src/neuroverse_frontend/package.json`: Frontend dependencies and scripts

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository and create a new branch for your feature or bugfix.
2. Follow the existing code style and structure.
3. Add tests or documentation as appropriate.
4. Submit a pull request with a clear description of your changes.

**Development tips:**

- Use `npm run lint` to check code style.
- Use DFX for local canister development and testing.
- See the `src/neuroverse_frontend/README.md` (if available) for frontend-specific notes.

---

## License

_No license file was found in the repository. Please add a LICENSE file to clarify usage rights._

---

## Contact

- **Project:** Neuroverse
- **Author/Organization:** Rodwell Leo
- **Questions/Support:** Please open an issue or contact the maintainers via the website.

---

If you are a new developer joining the project, please review this README, explore the folder structure, and reach out via the contact methods above for onboarding or questions.
