import { useEffect } from "react";
import { ethers } from "ethers";

export function useRewardRefresh(
	isConnected: boolean,
	contract: ethers.Contract | null,
	provider: ethers.BrowserProvider | null,
	account: string,
	setPendingReward: (v: string) => void
) {
	useEffect(() => {
		if (!isConnected || !contract || !provider || !account) return;
		let interval: NodeJS.Timeout;
		const fetchReward = async () => {
			try {
				const reward = await contract.earned(account);
				setPendingReward(ethers.formatEther(reward));
			} catch (err) {
				// silent fail
			}
		};
		fetchReward();
		interval = setInterval(fetchReward, 10000);
		return () => clearInterval(interval);
	}, [isConnected, contract, provider, account, setPendingReward]);
}
