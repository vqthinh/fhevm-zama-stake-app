"use client";

import { useState } from "react";
import { useWallet } from "../hooks/useWallet";
import { useUserData } from "../hooks/useUserData";
import { useStakeActions } from "../hooks/useStakeActions";
import { useRewardRefresh } from "../hooks/useRewardRefresh";
import { ethers } from "ethers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SuccessModal } from "@/components/ui/success-modal";
import { Wallet, ExternalLink, Loader2, TrendingUp, DollarSign, Award } from "lucide-react";

import { useEffect } from "react";
import FHEStakeABI from "../abis/FHEStake.json";
import { CONTRACT_ADDRESS } from "../lib/contract";

const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111 hex

export default function FHEStakePage() {
  // ...existing code...
  const [stakeInput, setStakeInput] = useState<string>("");
  const { account, provider, contract, isConnected, isLoading, loadingAction, connectWallet, disconnectWallet } =
    useWallet();
  const { ethBalance, stakedAmount, pendingReward, loadUserData, setEthBalance, setStakedAmount, setPendingReward } =
    useUserData(provider, contract, account);
  const {
    isLoading: isActionLoading,
    loadingAction: actionLoadingText,
    fhevmEnabled,
    successModal,
    initializeFHEVM,
    closeSuccessModal,
    handleStake,
    handleWithdraw,
    handleClaimReward,
    handleClaimEncryptedReward,
  } = useStakeActions(contract, provider, account, loadUserData);
  useRewardRefresh(isConnected, contract, provider, account, setPendingReward);

  // Tự động load lại dữ liệu khi ví connect
  useEffect(() => {
    if (isConnected) {
      loadUserData();
    }
  }, [isConnected, contract, provider, account]);
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-balance">FHEStake</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Stake your ETH and earn rewards on Sepolia testnet
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Wallet Card */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Wallet className="w-5 h-5" />
                {isConnected ? "Wallet Connected" : "Connect Your Wallet"}
              </CardTitle>
              <CardDescription>
                {isConnected
                  ? "You can now stake, withdraw, and claim rewards."
                  : "Connect your MetaMask wallet to start staking"}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              {!isConnected ? (
                <Button onClick={connectWallet} disabled={isLoading} size="lg" className="min-w-48">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {loadingAction}
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect MetaMask
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex items-center gap-2 justify-center">
                  <Badge variant="outline">Đã kết nối: {account}</Badge>
                  <Button variant="outline" onClick={disconnectWallet}>
                    Ngắt kết nối
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* FHEVM Status Card */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className={fhevmEnabled ? "text-green-500" : "text-yellow-500"}>🔒</span>
                FHEVM Status
              </CardTitle>
              <CardDescription>
                {fhevmEnabled 
                  ? "FHEVM is enabled and ready for encrypted operations"
                  : "Click to enable FHEVM for encrypted rewards"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!fhevmEnabled ? (
                <Button onClick={initializeFHEVM} variant="outline" size="sm">
                  Initialize FHEVM
                </Button>
              ) : (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  ✓ FHEVM Ready
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Balance & Rewards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Staked Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{Number.parseFloat(stakedAmount).toFixed(6)} ETH</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Pending Rewards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-accent">{Number.parseFloat(pendingReward).toFixed(6)} ETH</p>
                <p className="text-sm text-muted-foreground mt-1">Auto-refreshes every 10s</p>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stake */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Stake ETH</CardTitle>
                <CardDescription>Enter the amount of ETH you want to stake</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="stake-amount">Amount (ETH)</Label>
                  <Input
                    id="stake-amount"
                    type="number"
                    step="0.001"
                    placeholder="0.0"
                    value={stakeInput}
                    onChange={(e) => setStakeInput(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={() => handleStake(stakeInput, setStakeInput)}
                  disabled={isActionLoading || !stakeInput || Number.parseFloat(stakeInput) <= 0}
                  className="w-full"
                  size="lg"
                >
                  {isActionLoading && actionLoadingText.includes("Staking") ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Staking...
                    </>
                  ) : (
                    "Stake ETH"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Withdraw / Claim */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Withdraw stake or claim rewards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => handleWithdraw(stakedAmount)}
                  disabled={isActionLoading || Number.parseFloat(stakedAmount) <= 0}
                  variant="outline"
                  className="w-full bg-transparent"
                  size="lg"
                >
                  {isActionLoading && actionLoadingText.includes("Withdrawing") ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Withdrawing...
                    </>
                  ) : (
                    "Withdraw All"
                  )}
                </Button>

                <Button
                  onClick={handleClaimReward}
                  disabled={isActionLoading || Number.parseFloat(pendingReward) <= 0}
                  variant="secondary"
                  className="w-full"
                  size="lg"
                >
                  {isActionLoading && actionLoadingText.includes("Claiming") ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Claiming...
                    </>
                  ) : (
                    "Claim Rewards"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={closeSuccessModal}
        title={successModal.title}
        description={successModal.description}
        transactionHash={successModal.transactionHash}
      />
    </div>
  );
}
