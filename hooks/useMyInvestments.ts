// hooks/useMyInvestments.ts
"use client";

import { useAccount, useReadContract } from "wagmi";
import contractABI from "@/contracts/Milestonefunding.json";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

const PROJECT_STATES = [
  "Cancelled",
  "Funding",
  "BuildingStage1",
  "VotingRound1",
  "FailureRound1",
  "BuildingStage2",
  "VotingRound2",
  "FailureRound2",
  "BuildingStage3",
  "VotingRound3",
  "FailureRound3",
  "Completed",
];

export function useMyInvestments() {
  const { address } = useAccount();

  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractABI.abi,
    functionName: "getMyInvestedProjects",
    account: address,
    args: undefined,
    query: { enabled: !!address },
    watch: true,
  });

  const investments =
    data && data.length === 11
      ? (data[0] as string[]).map((_, i) => ({
          projectId: BigInt(data[0][i]),
          creator: data[1][i],
          name: data[2][i],
          description: data[3][i],
          category: data[4][i], 
          softCapWei: BigInt(data[5][i]),
          totalFunded: BigInt(data[6][i]),
          bond: BigInt(data[7][i]),
          state: PROJECT_STATES[Number(data[8][i])],
          invested: BigInt(data[9][i]),
          milestones: data[10][i] as string[],
        }))
      : [];

  return { investments, isLoading, refetch };
}
