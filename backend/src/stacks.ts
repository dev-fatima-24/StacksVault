import { StacksTestnet, StacksMainnet } from "@stacks/network";
import {
  callReadOnlyFunction,
  cvToValue,
  standardPrincipalCV,
  uintCV,
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  ClarityValue,
} from "@stacks/transactions";

const isMainnet = process.env.STACKS_NETWORK === "mainnet";
export const network = isMainnet ? new StacksMainnet() : new StacksTestnet();

export const VAULT_CONTRACT_ADDRESS = process.env.VAULT_CONTRACT_ADDRESS!;
export const VAULT_CONTRACT_NAME = "vault";
export const REMITTANCE_CONTRACT_ADDRESS = process.env.REMITTANCE_CONTRACT_ADDRESS!;
export const REMITTANCE_CONTRACT_NAME = "remittance";

export async function readVaultBalance(userAddress: string): Promise<bigint> {
  const result = await callReadOnlyFunction({
    network,
    contractAddress: VAULT_CONTRACT_ADDRESS,
    contractName: VAULT_CONTRACT_NAME,
    functionName: "get-balance-with-yield",
    functionArgs: [standardPrincipalCV(userAddress)],
    senderAddress: userAddress,
  });
  return BigInt(cvToValue(result));
}

export async function readLockedBalance(userAddress: string): Promise<bigint> {
  const result = await callReadOnlyFunction({
    network,
    contractAddress: VAULT_CONTRACT_ADDRESS,
    contractName: VAULT_CONTRACT_NAME,
    functionName: "get-balance",
    functionArgs: [standardPrincipalCV(userAddress)],
    senderAddress: userAddress,
  });
  return BigInt(cvToValue(result));
}

export async function readAccruedYield(userAddress: string): Promise<bigint> {
  const result = await callReadOnlyFunction({
    network,
    contractAddress: VAULT_CONTRACT_ADDRESS,
    contractName: VAULT_CONTRACT_NAME,
    functionName: "get-accrued-yield",
    functionArgs: [standardPrincipalCV(userAddress)],
    senderAddress: userAddress,
  });
  return BigInt(cvToValue(result));
}
