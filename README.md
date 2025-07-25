# ModredIP - ERC-6551 Intellectual Property Management System

This project implements the **ModredIP** system, a comprehensive intellectual property management platform built on the **Etherlink blockchain** using the **ERC-6551 token standard**. It provides creators with tools to register, license, and monetize their intellectual property with built-in protection and automated revenue distribution.

## 🎯 **Executive Summary**

**ModredIP** addresses critical challenges in the digital IP ecosystem:

- **IP Protection**: Prevents unauthorized use and ensures proper attribution
- **Revenue Generation**: Enables creators to monetize their IP through licensing
- **Automated Royalties**: Transparent and automatic revenue distribution
- **Dispute Resolution**: On-chain dispute system with arbitration capabilities
- **AI Compatibility**: Designed to work with AI systems and automated content detection

## 🏗️ **Core Features**

### **IP Registration & Ownership**
- Register any IP asset (images, music, text, AI training data, etc.) as NFTs
- ERC-6551 token-bound accounts for each IP asset
- Immutable on-chain record of ownership and metadata
- Support for encrypted IP content

### **Licensing System**
- Mint license tokens with customizable terms
- Configurable royalty percentages and duration
- Commercial use permissions
- Automated license tracking and enforcement

### **Revenue Management**
- Automated royalty distribution based on license terms
- Platform fee collection (configurable, default 2.5%)
- Real-time revenue tracking and claiming
- Transparent payment history

### **Dispute Resolution**
- On-chain dispute raising system
- Arbitration support for conflict resolution
- Automatic IP flagging during disputes
- Resolution tracking and enforcement

### **ERC-6551 Integration**
- Each IP asset gets its own token-bound account
- Enables complex IP management workflows
- Supports multi-signature and DAO governance
- Programmable IP behavior

## 🔧 **Technical Architecture**

### **Smart Contracts**
- **`ModredIP.sol`**: Main IP management contract
- **`ERC6551Registry.sol`**: Registry for token-bound accounts
- **`ERC6551Account.sol`**: Token-bound account implementation

### **Key Components**
- **IP Assets**: ERC-721 NFTs representing intellectual property
- **License Tokens**: On-chain licenses with revenue sharing
- **Royalty Vaults**: Automated revenue distribution system
- **Dispute Module**: Conflict resolution and arbitration

### **Technology Stack**
- **Blockchain**: Etherlink (Tezos EVM-compatible L2)
- **Smart Contracts**: Solidity 0.8.24
- **Development**: Hardhat + TypeChain
- **Deployment**: Hardhat Ignition
- **Testing**: Comprehensive test suite

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+
- Yarn package manager
- Hardhat development environment

### **Installation**
```bash
# Clone the repository
git clone <repository-url>
cd etherlink-marketpulse

# Install dependencies
yarn install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test
```

### **Deployment**
```bash
# Set environment variables
export DEPLOYER_PRIVATE_KEY=your_private_key

# Deploy to Etherlink testnet
npx hardhat ignition deploy ignition/modules/ModredIP.ts --network etherlinkTestnet
```

## 📋 **Usage Examples**

### **Registering IP**
```solidity
// Register a new IP asset
await modredIP.registerIP(
    "QmIPContentHash", // IPFS hash of content
    "QmMetadataHash",  // IPFS hash of metadata
    false              // Not encrypted
);
```

### **Minting a License**
```solidity
// Mint a license with 10% royalty
await modredIP.mintLicense(
    1,                    // IP token ID
    1000,                 // 10% royalty (in basis points)
    86400,                // 1 day duration
    true,                 // Commercial use allowed
    "QmLicenseTerms"      // IPFS hash of license terms
);
```

### **Paying Revenue**
```solidity
// Pay revenue to IP asset
await modredIP.payRevenue(1, { value: ethers.parseEther("1.0") });
```

### **Claiming Royalties**
```solidity
// Claim earned royalties
await modredIP.claimRoyalties(1);
```

## 🛡️ **Security Features**

- **Reentrancy Protection**: Prevents reentrancy attacks
- **Access Control**: Role-based permissions
- **Input Validation**: Comprehensive parameter validation
- **Emergency Pauses**: Admin controls for critical functions
- **Dispute Protection**: Prevents transfers during disputes

## 📊 **Economic Model**

- **Platform Fees**: 2.5% of all revenue (configurable)
- **Royalty Distribution**: Based on license terms
- **Gas Optimization**: Efficient contract design
- **Scalable Architecture**: Supports high transaction volumes

## 🔮 **Future Enhancements**

- **AI Integration**: Automated infringement detection
- **Cross-Chain Support**: Multi-chain IP management
- **Advanced Licensing**: Time-based and conditional licenses
- **DAO Governance**: Community-driven dispute resolution
- **IP Marketplace**: Secondary market for IP assets

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🤝 **Contributing**

We welcome contributions! Please see our contributing guidelines for more information.

---

**ModredIP** - Empowering creators with programmable intellectual property management on the blockchain.
