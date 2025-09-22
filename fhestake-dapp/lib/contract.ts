import { ethers } from "ethers";
import abi from "../abis/FHEStake.json";

export const CONTRACT_ADDRESS = "0xa6111e24F7C65a30f7c0E1eF23c91AA2f47d368a";

export function getProviderAndSigner() {
  if (!window.ethereum) throw new Error("MetaMask not installed");
  const provider = new ethers.BrowserProvider(window.ethereum);
  return provider.getSigner();
}

export async function getFHEStakeContract() {
  const signer = await getProviderAndSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, abi.abi, signer);
}
