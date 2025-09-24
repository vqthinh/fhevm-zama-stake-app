# FHEVM Zama Stake App

This project is an **FHEVM-enabled** ETH staking app on Sepolia testnet, using the FHEStake smart contract with **Fully Homomorphic Encryption (FHE)** capabilities and a Next.js/React frontend.
Users can stake ETH, earn automatic rewards with **encrypted reward tracking**, withdraw, and claim rewards using both traditional and **encrypted FHEVM operations**. The contract owner can adjust the reward rate and reset user rewards.

## 🔒 FHEVM Features

- **Encrypted Reward Tracking**: User rewards are stored in encrypted form using FHEVM's `euint32` type
- **Encrypted Reward Claiming**: Users can claim rewards using encrypted inputs with zero-knowledge proofs
- **Privacy-Preserving Operations**: Reward amounts can be processed without revealing actual values
- **Backward Compatibility**: Maintains support for traditional non-encrypted operations

LIVE Demo: https://zama-staking.vercel.app/

Contract: 0xa6111e24F7C65a30f7c0E1eF23c91AA2f47d368a

## Project File Tree

```
fhevm-zama-stake-app/
├── contracts/
│   └── FHEStake.sol
├── fhestake-dapp/
│   ├── abis/
│   │   └── FHEStake.json
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
├── tasks/
│   ├── setRewardRate.ts
│   ├── resetReward.ts
│   ├── balance.ts
│   ├── accounts.ts
│   └── FHEStake.ts
├── test/
│   ├── FHEStake.ts
│   └── FHEStakeSepolia.ts
├── hardhat.config.ts
├── package.json
└── README.md
```

## Main Features

- **🔒 FHEVM Integration**: Encrypted reward tracking using Fully Homomorphic Encryption
- **🔐 Encrypted Operations**: Claim rewards with encrypted inputs and zero-knowledge proofs
- **📊 Traditional Staking**: Stake ETH and earn rewards automatically over time
- **💰 Flexible Withdrawals**: Withdraw staked ETH anytime
- **🏆 Dual Reward System**: Claim ETH rewards using both traditional and encrypted methods
- **🔄 Auto-Update**: Balance and rewards update when connecting/disconnecting wallet
- **🔧 Admin Controls**: Contract owner can adjust reward rate and reset rewards
- **🎨 Modern UI**: Clean interface with MetaMask integration and FHEVM status indicators

## Project Structure

- `contracts/FHEStake.sol`: **FHEVM-enabled** ETH staking smart contract with encrypted reward tracking
- `fhestake-dapp/`: Next.js/React frontend with **FHEVM integration**
- `fhestake-dapp/lib/fhevm.ts`: **FHEVM utility functions** for encrypted operations
- `tasks/`: Hardhat admin tasks (resetReward, setRewardRate, etc.)
- `test/`: Contract tests including **FHEVM-specific test cases**

## Usage Guide

### 1. Install

```bash
# Clone repo
git clone https://github.com/vqthinh/fhevm-zama-stake-app.git
cd fhevm-zama-stake-app

# Install dependencies
npm install
cd fhestake-dapp
npm install
```

### 2. Deploy contract to Sepolia

```bash
cd .. # go to project root
npx hardhat run deploy/deployFHEStake.ts --network sepolia
```

Record the new contract address.

### 3. Update ABI and contract address for frontend

- Copy ABI from `artifacts/contracts/FHEStake.sol/FHEStake.json` to `fhestake-dapp/abis/FHEStake.json`
- Update contract address in `fhestake-dapp/lib/contract.ts`

### 4. Run frontend

```bash
cd fhestake-dapp
npm install  # Install frontend dependencies including FHEVM SDK
npm run dev
```

Visit http://localhost:3000 to use the app.

**🔒 FHEVM Features in Frontend:**
- FHEVM initialization status indicator
- "Claim with FHEVM" button for encrypted reward claiming
- Encrypted reward tracking display
- Zero-knowledge proof generation for encrypted operations

### 5. Contract Admin

- **Set reward rate:**
  ```bash
  npx hardhat setRewardRate --rate <REWARD> --contract <CONTRACT_ADDRESS> --network sepolia
  ```
- **Reset user reward:**
  ```bash
  npx hardhat resetReward --user <USER_ADDRESS> --contract <CONTRACT_ADDRESS> --network sepolia
  ```
- **View deployed contract address:**
  ```bash
  npx hardhat deployments --network sepolia
  ```
- **Check contract balance:**
  ```bash
  npx hardhat balance --contract <CONTRACT_ADDRESS> --network sepolia
  ```

## 🔒 FHEVM Integration Guide

### Smart Contract FHEVM Features

The `FHEStake.sol` contract includes the following FHEVM enhancements:

1. **Encrypted Reward Storage**:
   ```solidity
   mapping(address => euint32) public encryptedRewards;
   ```

2. **Encrypted Reward Claiming**:
   ```solidity
   function claimEncryptedReward(externalEuint32 inputEuint32, bytes calldata inputProof) external
   ```

3. **FHE Permissions Management**:
   ```solidity
   FHE.allowThis(encryptedRewards[msg.sender]);
   FHE.allow(encryptedRewards[msg.sender], msg.sender);
   ```

### Frontend FHEVM Integration

1. **Initialize FHEVM**:
   ```typescript
   import { initializeFHEVM } from './lib/fhevm';
   const fhevmInstance = await initializeFHEVM();
   ```

2. **Create Encrypted Inputs**:
   ```typescript
   const encryptedInput = await createEncryptedRewardInput(
     contractAddress,
     userAddress,
     rewardAmount
   );
   ```

3. **Call Encrypted Functions**:
   ```typescript
   await contract.claimEncryptedReward(
     encryptedInput.inputEuint32,
     encryptedInput.inputProof
   );
   ```

### Testing FHEVM Features

Run FHEVM-specific tests:
```bash
npm test  # Includes both traditional and FHEVM tests
```

The test suite includes:
- Encrypted reward initialization
- Encrypted reward updates during staking
- Encrypted reward claiming (mock for local testing)
- FHEVM permission management

### Deployment on Sepolia

FHEVM features require deployment on Sepolia testnet where the FHEVM coprocessor is available:

```bash
npx hardhat deploy --network sepolia
```

**Note**: Local hardhat testing uses mock FHEVM operations. Full FHEVM functionality requires Sepolia deployment.

## Notes

- **FHEVM Integration**: This project now supports Fully Homomorphic Encryption for private reward operations
- **Sepolia Testnet**: Required for full FHEVM functionality (local testing uses mocks)
- **Backward Compatibility**: All original staking features remain fully functional
- **Encrypted Privacy**: User reward amounts can be processed without revealing actual values
- You need Sepolia testnet ETH to stake
- Contract owner is the deployer wallet

## Contact

- Author: vqthinh
- Repo: https://github.com/vqthinh/fhevm-zama-stake-app

A Hardhat-based template for developing Fully Homomorphic Encryption (FHE) enabled Solidity smart contracts using the
FHEVM protocol by Zama.

## Quick Start

For detailed instructions see:
[FHEVM Hardhat Quick Start Tutorial](https://docs.zama.ai/protocol/solidity-guides/getting-started/quick-start-tutorial)

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm or yarn/pnpm**: Package manager

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   ```bash
   npx hardhat vars set MNEMONIC

   # Set your Infura API key for network access
   npx hardhat vars set INFURA_API_KEY

   # Optional: Set Etherscan API key for contract verification
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

3. **Compile and test**

   ```bash
   npm run compile
   npm run test
   ```

4. **Deploy to local network**

   ```bash
   # Start a local FHEVM-ready node
   npx hardhat node
   # Deploy to local network
   npx hardhat deploy --network localhost
   ```

5. **Deploy to Sepolia Testnet**

   ```bash
   # Deploy to Sepolia
   npx hardhat deploy --network sepolia
   # Verify contract on Etherscan
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

6. **Test on Sepolia Testnet**

   ```bash
   # Once deployed, you can run a simple test on Sepolia.
   npx hardhat test --network sepolia
   ```

## 📁 Project Structure

```
fhevm-hardhat-template/
├── contracts/           # Smart contract source files
│   └── FHECounter.sol   # Example FHE counter contract
├── deploy/              # Deployment scripts
├── tasks/               # Hardhat custom tasks
├── test/                # Test files
├── hardhat.config.ts    # Hardhat configuration
└── package.json         # Dependencies and scripts
```

## 📜 Available Scripts

| Script             | Description              |
| ------------------ | ------------------------ |
| `npm run compile`  | Compile all contracts    |
| `npm run test`     | Run all tests            |
| `npm run coverage` | Generate coverage report |
| `npm run lint`     | Run linting checks       |
| `npm run clean`    | Clean build artifacts    |

## 📚 Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Setup Guide](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup)
- [FHEVM Testing Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat/write_test)
- [FHEVM Hardhat Plugin](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat)

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/zama-ai/fhevm/issues)
- **Documentation**: [FHEVM Docs](https://docs.zama.ai)
- **Community**: [Zama Discord](https://discord.gg/zama)

---

**Built with ❤️ by the Zama team**
