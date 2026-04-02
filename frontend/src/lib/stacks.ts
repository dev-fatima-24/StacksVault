import { openContractCall } from "@stacks/connect";
import { StacksTestnet, StacksMainnet } from "@stacks/network";
import {
  uintCV,
  standardPrincipalCV,
  AnchorMode,
  PostConditionMode,
} from "@stacks/transactions";

const isMainnet = process.env.NEXT_PUBLIC_STACKS_NETWORK === "mainnet";
const network = isMainnet ? new StacksMainnet() : new StacksTestnet();

const [REMITTANCE_ADDR, REMITTANCE_NAME] =
  (process.env.NEXT_PUBLIC_REMITTANCE_CONTRACT ?? "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.remittance").split(".");

const [VAULT_ADDR, VAULT_NAME] =
  (process.env.NEXT_PUBLIC_VAULT_CONTRACT ?? "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.vault").split(".");

export function sendRemittance({
  recipient,
  amount,
  lockPct,
}: {
  recipient: string;
  amount: number;
  lockPct: number;
}): Promise<string> {
  return new Promise((resolve, reject) => {
    openContractCall({
      network,
      contractAddress: REMITTANCE_ADDR,
      contractName: REMITTANCE_NAME,
      functionName: "send-remittance",
      functionArgs: [
        standardPrincipalCV(recipient),
        uintCV(amount),
        uintCV(lockPct),
      ],
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => resolve(data.txId),
      onCancel: () => reject(new Error("Cancelled")),
    });
  });
}

export function withdrawFromVault(amount: number): Promise<string> {
  return new Promise((resolve, reject) => {
    openContractCall({
      network,
      contractAddress: VAULT_ADDR,
      contractName: VAULT_NAME,
      functionName: "withdraw",
      functionArgs: [uintCV(amount)],
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => resolve(data.txId),
      onCancel: () => reject(new Error("Cancelled")),
    });
  });
}
