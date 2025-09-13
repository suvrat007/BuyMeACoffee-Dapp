# ☕ Buy Me a Coffee DApp

A minimal **React + Vite decentralized application (DApp)** that integrates with Ethereum smart contracts using **Viem** and **MetaMask**.  

It comes with **Hot Module Replacement (HMR)**, ESLint rules, and a **coffee‑themed UI** for funding contracts with fun random rewards.

---

## 🚀 Quick Start

### 1. Clone the Repository
git clone https://github.com/suvrat007/BuyMeACoffee-Dapp.git
cd BuyMeACoffee-Dapp



### 2. Install Dependencies
npm install


### 3. Configure Smart Contract
Update `src/Utils/constant.ts` with your **contract address** and **ABI**.

### 4. Start Development Server
npm run dev


The app will be live at: [http://localhost:5173](http://localhost:5173)

---

## ✨ Features
- **Wallet Integration**: Seamless MetaMask connection  
- **Smart Contract Interaction**: Fund and withdraw with Viem  
- **Random Rewards**: Coffee icons as incentives  
- **Responsive Design**: Mobile‑first with Tailwind CSS  
- **Balance Tracking**: Real‑time tracking with cooldown  
- **Loading States**: Smooth UX with loaders  

---

## 🛠 Technologies Used
- React  
- Vite  
- Viem (Ethereum library)  
- Tailwind CSS  
- TypeScript  
- MetaMask  

---


### Deploy with Anvil
anvil --load-state fundme-anvil.json --block-time 5



---

## 🏗 Local Development Setup

1. **Start Hardhat Node**
anvil --load-state fundme-anvil.json --block-time 5


2. **Deploy Contract**
npx hardhat run scripts/deploy.js --network localhost



3. **Configure MetaMask**
- Network: `http://localhost:8545`  
- Chain ID: `31337`  
- Import account private key from Anvil output  

4. **Run DApp**
npm run dev



---

## 📂 Project Structure
BuyMeACoffee-Dapp/
├── src/
│ ├── Utils/
│ │ └── constant.ts # Contract config
│ ├── components/
│ │ └── Body.tsx # Main DApp component
│ ├── App.tsx # Root component
│ ├── main.tsx # Entry point
│ └── index.css # Global styles
│
├── public/ # Public assets (icons/logos)
│ └── vite.svg
│
├── contracts/ # Smart contracts
├── scripts/ # Deployment scripts
├── index.html # HTML template
├── package.json # Dependencies & scripts
├── vite.config.ts # Vite configuration
├── tsconfig.json # TypeScript config
└── README.md # Documentation



---

## 🧪 Testing Setup

### Unit Tests (Vitest + React Testing Library)
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
npm run test



### End-to-End Tests (Playwright)
npm init playwright@latest
npm run test:e2e



---

## 🌍 Deployment

### Build Production
npm run build


## ❗ Troubleshooting
- **MetaMask not connecting** → Check network setup  
- **Contract not found** → Verify `constant.ts` has correct deployed address  
- **HMR issues** → Restart server: `npm run dev`  
- **TypeScript build errors** → Run `npm run build`  

---

## 🤝 Contributing
1. **Fork** the repo  
2. Create your branch:  
git checkout -b feature/amazing-feature

text
3. **Commit your changes**:  
git commit -m 'Add amazing feature'

text
4. **Push branch**:  
git push origin feature/amazing-feature

text
5. Open a **Pull Request**  

---

## 📜 License
This project is licensed under the **MIT License**.  

> Built with ☕ and powered by Ethereum  
> Made with ❤️ using Vite + React  
