// hooks/useMyInvestments.ts
"use client";

import { useAccount, useReadContract } from "wagmi";
import contractABI from "@/contracts/Milestonefunding.json";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export function useMyInvestments() {
  const { address } = useAccount();

  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractABI.abi,
    functionName: "getMyInvestedProjects",
    account: address,
    args: undefined,
    query: { enabled: !!address },
    watch: true,
  });

  const investments = data && data.length === 9
    ? (data[0] as string[]).map((projectIdStr, i) => ({
        projectId: BigInt(projectIdStr),
        creator: (data[1] as string[])[i],
        name: (data[2] as string[])[i],
        description: (data[3] as string[])[i],
        softCapWei: BigInt((data[4] as string[])[i]),
        totalFunded: BigInt((data[5] as string[])[i]),
        bond: BigInt((data[6] as string[])[i]),
        state: (data[7] as string[])[i],
        invested: BigInt((data[8] as string[])[i]),
      }))
    : [];

  return { investments, isLoading };
}
