import { useState } from "react";
import { ethers } from "ethers";
import FHEStakeABI from "../abis/FHEStake.json";
import { CONTRACT_ADDRESS } from "../lib/contract";

export function useWallet() {
  const [account, setAccount] = useState<string>("");
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingAction, setLoadingAction] = useState<string>("");

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask is not installed!");
        return;
      }
      setIsLoading(true);
      setLoadingAction("Connecting wallet...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      // Switch to Sepolia
      try {
        await provider.send("wallet_switchEthereumChain", [{ chainId: "0xaa36a7" }]);
      } catch (error: any) {
        if (error.code === 4902) {
          await provider.send("wallet_addEthereumChain", [
            {
              chainId: "0xaa36a7",
              chainName: "Sepolia Test Network",
              nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://sepolia.infura.io/v3/"],
              blockExplorerUrls: ["https://sepolia.etherscan.io/"],
            },
          ]);
        }
      }
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, FHEStakeABI.abi, signer);
      setProvider(provider);
      setContract(contract);
      setAccount(accounts[0]);
      setIsConnected(true);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet");
    } finally {
      setIsLoading(false);
      setLoadingAction("");
    }
  };

  const disconnectWallet = () => {
    setAccount("");
    setProvider(null);
    setContract(null);
    setIsConnected(false);
  };

  return {
    account,
    provider,
    contract,
    isConnected,
    isLoading,
    loadingAction,
    connectWallet,
    disconnectWallet,
  };
}
