import { useState } from "react";
import { ethers } from "ethers";

export function useStakeActions(
  contract: ethers.Contract | null,
  provider: ethers.BrowserProvider | null,
  account: string,
  loadUserData: () => Promise<void>,
) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingAction, setLoadingAction] = useState<string>("");

  const handleStake = async (stakeInput: string, setStakeInput: (v: string) => void) => {
    if (!contract || !provider || !stakeInput) return;
    try {
      setIsLoading(true);
      setLoadingAction("Staking ETH...");
      const amount = ethers.parseEther(stakeInput);
      // ABI stake() payable: chỉ truyền value
      const tx = await contract.stake({ value: amount });
      await tx.wait();
      setStakeInput("");
      await loadUserData();
      alert("Staking successful!");
    } catch (error) {
      console.error("Error staking:", error);
      alert("Staking failed");
    } finally {
      setIsLoading(false);
      setLoadingAction("");
    }
  };

  const handleWithdraw = async (stakedAmount: string) => {
    if (!contract || !provider) return;
    try {
      setIsLoading(true);
      setLoadingAction("Withdrawing ETH...");
      // stakedAmount là string ETH, cần chuyển về wei
      const tx = await contract.withdraw(ethers.parseEther(stakedAmount));
      await tx.wait();
      await loadUserData();
      alert("Withdrawal successful!");
    } catch (error) {
      console.error("Error withdrawing:", error);
      alert("Withdrawal failed");
    } finally {
      setIsLoading(false);
      setLoadingAction("");
    }
  };

  const handleClaimReward = async () => {
    if (!contract || !provider) return;
    try {
      setIsLoading(true);
      setLoadingAction("Claiming rewards...");
      const tx = await contract.claimReward();
      await tx.wait();
      await loadUserData();
      alert("Reward claimed successfully!");
    } catch (error) {
      console.error("Error claiming reward:", error);
      alert("Claiming reward failed");
    } finally {
      setIsLoading(false);
      setLoadingAction("");
    }
  };

  return {
    isLoading,
    loadingAction,
    handleStake,
    handleWithdraw,
    handleClaimReward,
  };
}
