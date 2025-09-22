import { useState } from "react";
import { ethers } from "ethers";

export function useUserData(provider: ethers.BrowserProvider | null, contract: ethers.Contract | null, account: string) {
  const [ethBalance, setEthBalance] = useState<string>("0");
  const [stakedAmount, setStakedAmount] = useState<string>("0");
  const [pendingReward, setPendingReward] = useState<string>("0");

  const loadUserData = async () => {
    if (!provider || !contract || !account) return;
    try {
      const balance = await provider.getBalance(account);
      const staked = await contract.balances(account);
      const reward = await contract.earned(account);
      setEthBalance(ethers.formatEther(balance));
      setStakedAmount(ethers.formatEther(staked));
      setPendingReward(ethers.formatEther(reward));
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  return {
    ethBalance,
    stakedAmount,
    pendingReward,
    loadUserData,
    setEthBalance,
    setStakedAmount,
    setPendingReward,
  };
}
