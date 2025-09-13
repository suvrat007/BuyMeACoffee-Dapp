import { useState, useEffect } from 'react';
import { createWalletClient, custom, formatEther, parseEther, defineChain, createPublicClient, type WalletClient } from 'viem';
import { abi, contractAddress } from "../Utils/constant";
import "viem/window";

// Coffee vector icons from Heroicons (using SVG paths for simplicity)
const coffeeVectors = [
  { name: "Espresso", path: "M12 3a9 9 0 00-9 9v7a2 2 0 002 2h14a2 2 0 002-2v-7a9 9 0 00-9-9zm0 2a7 7 0 017 7v1h-2v-1a5 5 0 00-10 0v1H5v-1a7 7 0 017-7zm-7 9h14v5H5v-5z" },
  { name: "Latte", path: "M5 5a7 7 0 0114 0v10a4 4 0 01-4 4H9a4 4 0 01-4-4V5zm2 0v10a2 2 0 002 2h6a2 2 0 002-2V5a5 5 0 00-10 0z" },
  { name: "Cappuccino", path: "M12 3a9 9 0 00-9 9v6a3 3 0 003 3h12a3 3 0 003-3v-6a9 9 0 00-9-9zm0 2a7 7 0 017 7v1h-2a1 1 0 00-1 1v2a1 1 0 001 1h2v1a1 1 0 01-1 1H6a1 1 0 01-1-1v-1h2a1 1 0 001-1v-2a1 1 0 00-1-1H5v-1a7 7 0 017-7z" },
  { name: "Mocha", path: "M6 3a6 6 0 00-6 6v8a3 3 0 003 3h12a3 3 0 003-3V9a6 6 0 00-6-6H6zm0 2h6a4 4 0 014 4v1H4v-1a4 4 0 014-4z" },
  { name: "Americano", path: "M12 2a10 10 0 00-10 10v6a4 4 0 004 4h12a4 4 0 004-4v-6A10 10 0 0012 2zm0 2a8 8 0 018 8v2H4v-2a8 8 0 018-8z" },
  { name: "Macchiato", path: "M5 4a8 8 0 0114 0v12a3 3 0 01-3 3H8a3 3 0 01-3-3V4zm2 0v12a1 1 0 001 1h8a1 1 0 001-1V4a6 6 0 00-12 0z" },
  { name: "Flat White", path: "M12 3a9 9 0 00-9 9v5a2 2 0 002 2h14a2 2 0 002-2v-5a9 9 0 00-9-9zm0 2a7 7 0 017 7v3H5v-3a7 7 0 017-7z" },
  { name: "Affogato", path: "M12 2a10 10 0 00-10 10v4a4 4 0 004 4h12a4 4 0 004-4v-4A10 10 0 0012 2zm0 2a8 8 0 018 8v1H4v-1a8 8 0 018-8z" },
  { name: "Cortado", path: "M6 4a6 6 0 00-6 6v7a3 3 0 003 3h12a3 3 0 003-3v-7a6 6 0 00-6-6H6zm0 2h6a4 4 0 014 4v1H4v-1a4 4 0 014-4z" },
  { name: "Irish Coffee", path: "M5 5a7 7 0 0114 0v10a4 4 0 01-4 4H9a4 4 0 01-4-4V5zm2 0v10a2 2 0 002 2h6a2 2 0 002-2V5a5 5 0 00-10 0zm3 2h4v2h-4V7z" },
];

const Body = () => {
  const [connected, setConnected] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [contractBalance, setContractBalance] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [currentCoffee, setCurrentCoffee] = useState<{ name: string, path: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refreshCooldown, setRefreshCooldown] = useState<number>(0);

  // Cooldown timer for refresh button
  useEffect(() => {
    if (refreshCooldown > 0) {
      const timer = setTimeout(() => {
        setRefreshCooldown(refreshCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [refreshCooldown]);

  const handleConnectWallet = async () => {
    if (window.ethereum) {
      try {
        setIsLoading(true);
        const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log("Connected account:", account[0]);
        setConnected(account[0]);
      } catch (error) {
        alert("Failed to connect wallet. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("MetaMask not found. Install it to continue.");
    }
  };

  const getRandomCoffee = () => {
    const randomIndex = Math.floor(Math.random() * coffeeVectors.length);
    return coffeeVectors[randomIndex];
  };

  const fund = async () => {
    const ethAmount = amount;
    console.log(`Funding with ${ethAmount} ETH...`);

    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      alert("Please enter a valid amount!");
      return;
    }

    if (typeof window.ethereum !== 'undefined') {
      try {
        setIsLoading(true);
        const walletClient = createWalletClient({
          transport: custom(window.ethereum),
        });
        const [connectedAccount] = await walletClient.requestAddresses();
        const currentChain = await getCurrentChain(walletClient);
        const publicClient = createPublicClient({
          transport: custom(window.ethereum),
        });
        const { request } = await publicClient.simulateContract({
          address: contractAddress,
          abi: abi,
          functionName: "fund",
          account: connectedAccount,
          value: parseEther(ethAmount),
          chain: currentChain,
        });

        const txHash = await walletClient.writeContract(request);
        console.log("Transaction Hash:", txHash);

        // Set random coffee after successful funding
        const randomCoffee = getRandomCoffee();
        setCurrentCoffee(randomCoffee);
        setAmount(""); // Clear input

        // Refresh balances
        getBalance();
      } catch (error) {
        console.error("Funding failed:", error);
        alert("Transaction failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getBalance = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }

    // Start cooldown
    setRefreshCooldown(5);

    try {
      setIsLoading(true);
      const publicClient = createPublicClient({
        transport: custom(window.ethereum),
      });

      // User balance
      if (connected) {
        const userBalance = await publicClient.getBalance({
          address: connected as `0x${string}`,
        });
        console.log("User Balance:", formatEther(userBalance));
        setBalance(formatEther(userBalance));
      }

      // Contract balance
      const contractBal = await publicClient.getBalance({
        address: contractAddress,
      });
      console.log("Contract Balance:", formatEther(contractBal));
      setContractBalance(formatEther(contractBal));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const withdraw = async () => {
    console.log("Withdrawing...");

    if (typeof window.ethereum !== "undefined") {
      try {
        setIsLoading(true);
        const walletClient = createWalletClient({
          transport: custom(window.ethereum),
        });

        const [connectedAccount] = await walletClient.requestAddresses();
        const currentChain = await getCurrentChain(walletClient);

        const publicClient = createPublicClient({
          transport: custom(window.ethereum),
        });

        // Simulate contract call to prepare request
        const { request } = await publicClient.simulateContract({
          address: contractAddress,
          abi: abi,
          functionName: "withdraw",
          account: connectedAccount,
          chain: currentChain,
        });

        // Send actual transaction
        const txHash = await walletClient.writeContract(request);
        console.log("Withdraw Transaction Hash:", txHash);

        // Remove coffee after successful withdrawal
        setCurrentCoffee(null);

        // Refresh balances
        getBalance();
      } catch (error) {
        console.error("Withdraw failed:", error);
        alert("Withdrawal failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("Please install MetaMask");
    }
  };

  async function getCurrentChain(client: WalletClient): Promise<ReturnType<typeof defineChain>> {
    const chainId = await client.getChainId();
    const currentChain = defineChain({
      id: chainId,
      name: "Custom Chain",
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ["http://localhost:8545"],
        },
      },
    });
    return currentChain;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-stone-100 via-amber-50 to-orange-100 relative overflow-x-hidden lg:overflow-y-hidden">
      {/* Background Images */}
      <div
        className="absolute inset-0 opacity-85"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1447933601403-0c6688de566e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2061&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      ></div>
      {/* <div
        className="absolute top-10 right-10 w-64 h-64 opacity-30 transform rotate-12 hidden lg:block"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      ></div>
      <div
        className="absolute bottom-10 left-10 w-48 h-48 opacity-30 transform -rotate-12 hidden lg:block"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      ></div> */}

      {/* Content */}
      <div className="relative z-10 w-full px-4 py-6 flex flex-col lg:h-screen lg:overflow-hidden">
        {/* Header */}
        <div className="text-center mb-6 flex-shrink-0">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-sm">
            Buy Me a Coffee
          </h1>
          <p className="text-base md:text-lg text-white font-medium">
            Fund the contract and get a surprise coffee reward
          </p>
        </div>

        <div className="max-w-6xl mx-auto flex-1 flex items-start lg:items-center overflow-y-auto lg:overflow-y-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
            {/* Left Column - Instructions */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-stone-200">
                <h3 className="text-lg font-semibold text-stone-700 mb-3">How it works</h3>
                <ol className="list-decimal list-inside text-stone-600 space-y-1 text-sm">
                  <li>Connect your MetaMask wallet</li>
                  <li>Enter the ETH amount you'd like to fund</li>
                  <li>Click Fund to get a random coffee reward</li>
                  <li>Your coffee stays until you withdraw funds</li>
                </ol>
              </div>

              {/* Balance Cards */}
              {connected && (
                <div className="mt-4 space-y-3">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-3 border border-stone-200">
                    <h4 className="text-xs font-semibold text-stone-500 mb-1">Your Balance</h4>
                    <p className="text-lg md:text-xl font-bold text-stone-700">
                      {balance ? `${parseFloat(balance).toFixed(4)} ETH` : '-- ETH'}
                    </p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-3 border border-stone-200">
                    <h4 className="text-xs font-semibold text-stone-500 mb-1">Contract Balance</h4>
                    <p className="text-lg md:text-xl font-bold text-orange-600">
                      {contractBalance ? `${parseFloat(contractBalance).toFixed(4)} ETH` : '-- ETH'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Middle Column - Main Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 md:p-6 border border-stone-200">
                {/* Connect Wallet Section */}
                {!connected ? (
                  <div className="text-center">
                    <button
                      onClick={handleConnectWallet}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-stone-600 to-stone-700 hover:from-stone-700 hover:to-stone-800 
                                 text-white font-semibold py-3 md:py-4 px-6 rounded-xl shadow-md transform hover:scale-105 
                                 transition-all duration-200 text-base md:text-lg disabled:opacity-50 cursor-pointer"
                    >
                      {isLoading ? "Connecting..." : "Connect Your Wallet"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Connected Status */}
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                      <p className="text-green-700 font-medium text-sm">
                        Wallet Connected: {connected.slice(0, 6)}...{connected.slice(-4)}
                      </p>
                    </div>

                    {/* Balance Button with Cooldown */}
                    <button
                      onClick={getBalance}
                      disabled={isLoading || refreshCooldown > 0}
                      className={`w-full ${refreshCooldown > 0 ? 'blur-sm' : ''} 
                                 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                                 text-white font-semibold py-3 px-6 rounded-xl shadow-md transform hover:scale-105 
                                 transition-all duration-200 disabled:opacity-50 cursor-pointer`}
                    >
                      {refreshCooldown > 0 ? `Wait ${refreshCooldown}s` : 
                       isLoading ? "Loading..." : "Refresh Balance"}
                    </button>

                    {/* Fund Section */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-stone-700">Fund & Get Coffee</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-stone-600 font-medium mb-1 text-sm">
                            Amount (ETH)
                          </label>
                          <input
                            type="number"
                            placeholder="0.01"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-stone-300 
                                     focus:border-orange-400 focus:outline-none text-base bg-white/50"
                            step="0.001"
                            min="0"
                          />
                        </div>
                        <button
                          onClick={fund}
                          disabled={isLoading || !amount}
                          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 
                                   text-white font-semibold py-3 px-6 rounded-xl shadow-md transform hover:scale-105 
                                   transition-all duration-200 disabled:opacity-50 cursor-pointer"
                        >
                          {isLoading ? "Funding..." : "Fund Contract"}
                        </button>
                      </div>
                    </div>

                    {/* Withdraw Button */}
                    {currentCoffee && (
                      <button
                        onClick={withdraw}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 
                                 text-white font-semibold py-3 px-6 rounded-xl shadow-md transform hover:scale-105 
                                 transition-all duration-200 disabled:opacity-50 cursor-pointer"
                      >
                        {isLoading ? "Withdrawing..." : "Withdraw Funds"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Coffee Reward */}
            <div className="lg:col-span-1">
              {currentCoffee ? (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-orange-200 rounded-2xl shadow-lg p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-semibold text-stone-700 mb-4 text-center">
                    Your Coffee Reward
                  </h3>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <svg
                        className="w-12 h-12 md:w-16 md:h-16 text-orange-700"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d={currentCoffee.path} />
                      </svg>
                    </div>
                    <h4 className="text-xl md:text-2xl font-bold text-orange-700">
                      {currentCoffee.name}
                    </h4>
                    <p className="text-stone-600 font-medium text-center text-sm">
                      Enjoy your {currentCoffee.name}!
                    </p>
                    <div className="bg-white/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-stone-500 italic">
                        Your coffee stays until you withdraw funds
                      </p>
                    </div>
                  </div>
                </div>
              ) : connected ? (
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-4 md:p-6 border border-stone-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-stone-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <span className="text-2xl md:text-3xl text-stone-400">?</span>
                    </div>
                    <p className="text-stone-500 text-sm md:text-base">
                      Fund the contract to get your surprise coffee!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-4 md:p-6 border border-stone-200 flex items-center justify-center">
                  <p className="text-stone-500 text-sm md:text-base text-center">
                    Connect your wallet to get started
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 lg:mt-4 text-white flex-shrink-0">
          <p className="italic text-sm">Built with care and lots of coffee</p>
        </div>
      </div>
    </div>
  );
};

export default Body;