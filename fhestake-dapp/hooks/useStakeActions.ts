import { useState } from "react";
import { ethers } from "ethers";
import { FHEVMHelper, createEncryptedRewardInput } from "../lib/fhevm";

interface SuccessModalData {
  isOpen: boolean;
  title: string;
  description: string;
  transactionHash?: string;
}

export function useStakeActions(
  contract: ethers.Contract | null,
  provider: ethers.BrowserProvider | null,
  account: string,
  loadUserData: () => Promise<void>,
) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingAction, setLoadingAction] = useState<string>("");
  const [fhevmEnabled, setFhevmEnabled] = useState<boolean>(false);
  const [successModal, setSuccessModal] = useState<SuccessModalData>({
    isOpen: false,
    title: "",
    description: "",
    transactionHash: undefined
  });

  // Initialize FHEVM when component mounts
  const initializeFHEVM = async () => {
    try {
      const instance = await FHEVMHelper.initializeFHEVM();
      setFhevmEnabled(!!instance);
      return !!instance;
    } catch (error) {
      console.error("Failed to initialize FHEVM:", error);
      setFhevmEnabled(false);
      return false;
    }
  };

  const closeSuccessModal = () => {
    setSuccessModal({ isOpen: false, title: "", description: "", transactionHash: undefined });
  };

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
      
      setSuccessModal({
        isOpen: true,
        title: "Staking Successful!",
        description: `Successfully staked ${stakeInput} ETH. You can now start earning rewards.`,
        transactionHash: tx.hash
      });
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
      
      setSuccessModal({
        isOpen: true,
        title: "Withdrawal Successful!",
        description: `Successfully withdrew ${stakedAmount} ETH from your stake.`,
        transactionHash: tx.hash
      });
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
      
      setSuccessModal({
        isOpen: true,
        title: "Rewards Claimed!",
        description: "Your rewards have been successfully claimed and transferred to your wallet.",
        transactionHash: tx.hash
      });
    } catch (error) {
      console.error("Error claiming reward:", error);
      alert("Claiming reward failed");
    } finally {
      setIsLoading(false);
      setLoadingAction("");
    }
  };

  // New FHEVM-enabled encrypted reward claiming
  const handleClaimEncryptedReward = async (rewardAmount: number) => {
    if (!contract || !provider || !account) return;
    try {
      setIsLoading(true);
      setLoadingAction("Creating encrypted proof...");
      
      // Initialize FHEVM if not already done
      if (!fhevmEnabled) {
        const initialized = await initializeFHEVM();
        if (!initialized) {
          throw new Error("Failed to initialize FHEVM");
        }
      }

      // Create encrypted input for the reward amount
      const encryptedInput = await createEncryptedRewardInput(
        await contract.getAddress(),
        account,
        rewardAmount
      );

      if (!encryptedInput) {
        throw new Error("Failed to create encrypted input");
      }

      setLoadingAction("Claiming encrypted rewards...");
      
      // Call the new encrypted reward claiming function
      const tx = await contract.claimEncryptedReward(
        encryptedInput.inputEuint32,
        encryptedInput.inputProof
      );
      
      await tx.wait();
      await loadUserData();
      
      setSuccessModal({
        isOpen: true,
        title: "Encrypted Rewards Claimed!",
        description: "Your rewards have been successfully claimed using FHEVM encryption.",
        transactionHash: tx.hash
      });
    } catch (error) {
      console.error("Error claiming encrypted reward:", error);
      alert("Claiming encrypted reward failed: " + (error as Error).message);
    } finally {
      setIsLoading(false);
      setLoadingAction("");
    }
  };

  return {
    isLoading,
    loadingAction,
    fhevmEnabled,
    successModal,
    initializeFHEVM,
    closeSuccessModal,
    handleStake,
    handleWithdraw,
    handleClaimReward,
    handleClaimEncryptedReward,
  };
}
