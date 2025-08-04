# ModredIP - Intellectual Property Management System

A comprehensive IP management system built on the Etherlink blockchain, featuring IP asset registration, license management, revenue sharing, and dispute resolution.

## 🚀 Features

### Core Functionality
- **IP Asset Registration**: Register off-chain IP (books, images, songs) as NFTs with metadata stored on IPFS
- **License Management**: Mint programmable license tokens with detailed terms (commercial use, attribution, revenue share, derivatives)
- **Revenue Payment**: Tip IP assets or pay revenue percentages
- **Revenue Claiming**: Claim accumulated royalties from IP asset vaults
- **Dispute Resolution**: Raise and resolve disputes against IP assets using on-chain arbitration

### Technical Stack
- **Blockchain**: Etherlink Testnet (Chain ID: 128123)
- **Smart Contracts**: Solidity with ERC-6551 token standard
- **Frontend**: React + TypeScript + Vite + Thirdweb SDK
- **Backend**: Node.js + Express + TypeScript + Viem
- **Storage**: IPFS via Pinata
- **Deployment**: Hardhat Ignition

## 🏗️ Architecture

### Frontend-Backend Integration
The system uses a hybrid approach where:
- **Frontend**: Handles user interface, file uploads, and metadata creation
- **Backend**: Manages blockchain interactions, contract calls, and API endpoints
- **Smart Contracts**: Execute on-chain logic and store IP asset data

### API Endpoints
- `POST /api/register` - Register IP assets with metadata
- `POST /api/license/mint` - Mint license tokens with detailed terms
- `GET /` - Backend health check

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+
- Yarn package manager
- Etherlink testnet wallet with XTZ tokens

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd etherlink-marketpulse

# Install root dependencies
yarn install

# Install frontend dependencies
cd app
yarn install

# Install backend dependencies
cd ../backend
yarn install
```

### 2. Environment Configuration
Create `.env` files in both `app/` and `backend/` directories:

**Frontend (.env)**
```env
VITE_PINATA_JWT=your_pinata_jwt_token
```

**Backend (.env)**
```env
PRIVATE_KEY=your_private_key
PINATA_API_KEY=your_pinata_api_key
PINATA_API_SECRET=your_pinata_api_secret
```

### 3. Deploy Smart Contracts
```bash
# Deploy to Etherlink testnet
npx hardhat ignition deploy ignition/modules/ModredIP.ts --network etherlink-testnet
```

### 4. Update Contract Addresses
After deployment, update `app/src/deployed_addresses.json` with the new contract addresses.

### 5. Start Development Servers

**Backend (Terminal 1)**
```bash
cd backend
yarn dev
# Server runs on http://localhost:5000
```

**Frontend (Terminal 2)**
```bash
cd app
yarn dev
# App runs on http://localhost:5173
```

## 📱 Usage

### 1. Connect Wallet
- Use the ConnectButton to connect your Etherlink wallet
- Ensure you have XTZ tokens for gas fees

### 2. Register IP Asset
1. Upload your IP file (PDF, image, audio, etc.)
2. Enter IP name and description
3. Click "Upload to IPFS" to store metadata
4. Click "Register IP" to create the asset on-chain

### 3. Mint License
1. Select an IP asset from the dropdown
2. Configure license terms (commercial use, attribution, etc.)
3. Click "Mint License" to create the license token

### 4. Manage Revenue
- **Pay Revenue**: Send payments to IP assets
- **Claim Royalties**: Withdraw accumulated royalties

## 🔧 Development

### Project Structure
```
etherlink-marketpulse/
├── app/                    # Frontend React application
│   ├── src/
│   │   ├── App.tsx        # Main application component
│   │   └── deployed_addresses.json
├── backend/               # Backend Express server
│   ├── src/
│   │   ├── controllers/   # API route handlers
│   │   ├── services/      # Business logic
│   │   └── routes/        # API route definitions
├── contracts/             # Smart contracts
│   ├── ModredIP.sol      # Main IP management contract
│   ├── ERC6551Registry.sol
│   └── ERC6551Account.sol
└── ignition/             # Deployment configuration
    └── modules/
        └── ModredIP.ts
```

### Key Components

#### Frontend Integration
- **Backend API Calls**: Frontend makes HTTP requests to backend endpoints
- **File Upload**: Direct IPFS upload via Pinata API
- **Metadata Management**: JSON metadata creation and storage
- **Real-time Status**: Backend connection status indicator

#### Backend Services
- **IP Registration**: Handles contract interactions for IP asset creation
- **License Minting**: Manages license token creation with detailed terms
- **Yakoa Integration**: IP infringement monitoring
- **Error Handling**: Comprehensive error management and logging

#### Smart Contracts
- **ModredIP.sol**: Core IP management functionality
- **ERC-6551**: Token-bound accounts for IP ownership
- **Royalty System**: Automated revenue distribution
- **Dispute Resolution**: On-chain arbitration mechanisms

## 🧪 Testing

### Run Tests
```bash
# Smart contract tests
npx hardhat test

# Frontend build test
cd app
yarn build

# Backend test
cd backend
yarn dev
```

### Test Network
- **Network**: Etherlink Testnet (Ghostnet)
- **Chain ID**: 128123
- **Native Token**: XTZ
- **Explorer**: https://testnet-explorer.etherlink.com

## 🔒 Security

- **Private Key Management**: Use environment variables for sensitive data
- **IPFS Security**: Metadata stored on decentralized IPFS network
- **Smart Contract Audits**: Contracts follow OpenZeppelin security patterns
- **Input Validation**: Comprehensive validation on both frontend and backend

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the smart contract code

---

**Built with ❤️ for the Etherlink ecosystem**
