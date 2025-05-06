# SoulCertify

<div align="center">
  <img src="packages/nextjs/public/SoulCertify_logo_bg.png" alt="SoulCertify Logo" width="200" />
  <h3 align="center">Decentralized Academic Credential Management</h3>
  <p align="center">
    A platform for issuing, verifying, and managing educational certificates as Soulbound Tokens (SBTs) on the blockchain.
  </p>
</div>

## 📋 Overview

SoulCertify is a decentralized application (dApp) built on Ethereum that revolutionizes how academic credentials are issued, managed, and verified. By leveraging blockchain technology and Soulbound Tokens (non-transferable NFTs), SoulCertify provides a secure, transparent, and tamper-proof system for educational institutions to issue digital certificates that can be easily verified by employers and other organizations.

### 🌟 Key Features

- **Soulbound Tokens (SBTs)**: Non-transferable tokens that represent academic achievements and credentials, ensuring authenticity and preventing fraud.
- **Academic Credentials**: Issue verifiable degrees, certificates, and qualifications that can be easily verified by employers and institutions.
- **Verification System**: Simple blockchain-based verification system that allows anyone to check the validity of certificates.
- **Student Approval**: Students must approve their certificates, ensuring accuracy and consent.
- **Revocation Capability**: Institutions can revoke certificates if necessary.
- **Permanent Storage**: Certificates are stored permanently on the blockchain, eliminating the risk of loss.

## 🔧 Technology Stack

- **Frontend**: Next.js, TailwindCSS, RainbowKit, Framer Motion
- **Smart Contracts**: Solidity, Hardhat
- **Blockchain Interaction**: Wagmi, Viem
- **Development**: TypeScript, Yarn

## 🚀 Getting Started

### Prerequisites

Before you begin, you need to install the following tools:

- [Node.js (>= v20.18.3)](https://nodejs.org/en/download/)
- [Yarn (v1 or v2+)](https://yarnpkg.com/getting-started/install)
- [Git](https://git-scm.com/downloads)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/soulcertify.git
   cd soulcertify
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

### Running the Application

1. Start a local Ethereum network:
   ```bash
   yarn chain
   ```

2. Deploy the smart contracts:
   ```bash
   yarn deploy
   ```

3. Start the frontend application:
   ```bash
   yarn start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## 🏗️ Project Structure

The project is organized as a Yarn monorepo with the following packages:

### `packages/hardhat`

Contains the Solidity smart contracts and deployment scripts:

- `contracts/Certificate.sol`: The main contract for issuing and managing educational certificates as Soulbound Tokens.
- `deploy/`: Contains deployment scripts for the smart contracts.
- `test/`: Contains test files for the smart contracts.

### `packages/nextjs`

Contains the frontend application:

- `app/`: Next.js app router pages and components.
- `components/`: Reusable React components.
- `hooks/`: Custom React hooks for blockchain interactions.
- `public/`: Static assets.
- `styles/`: Global CSS and styling.
- `utils/`: Utility functions.

## 📝 Smart Contracts

### Certificate.sol

The main smart contract that handles the issuance and management of educational certificates as Soulbound Tokens.

#### Key Functions:

- `issueCertificate`: Issues a new certificate to a student.
- `approveCertificate`: Allows a student to approve their certificate.
- `revokeCertificate`: Allows the contract owner to revoke a certificate.
- `updateCertificate`: Updates the certificate data.
- `getCertificate`: Retrieves the certificate data for a given token ID.
- `getStudentCertificates`: Gets all certificates owned by a student.
- `verifyCertificate`: Verifies if a certificate is valid and approved.

## 🔄 How It Works

1. **Issue Certificate**: An educational institution issues a certificate as a Soulbound Token.
2. **Student Approval**: The student reviews and approves the certificate details.
3. **Blockchain Storage**: The approved certificate is stored permanently on the blockchain.
4. **Verification**: Employers or other institutions can verify the certificate's authenticity.

## 🧪 Testing

Run the smart contract tests:

```bash
yarn test
```

## 🌐 Deployment

### Local Development

For local development, follow the "Running the Application" steps above.

### Production Deployment

#### Smart Contracts

To deploy to a live network (e.g., Arbitrum Sepolia):

```bash
yarn deploy --network arbitrumSepolia
```

#### Frontend

Deploy the frontend to Vercel:

```bash
yarn vercel
```

Or build for IPFS:

```bash
yarn ipfs
```

## 🔐 Security Considerations

- The Certificate contract uses OpenZeppelin's Ownable for access control.
- Certificates are non-transferable (soulbound) to prevent unauthorized transfers.
- Students must approve their certificates, adding a layer of verification.
- Institutions can revoke certificates if necessary.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Built with [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2)
- [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)
- [Ethereum Foundation](https://ethereum.org/)
- [BuidlGuidl](https://buidlguidl.com/)