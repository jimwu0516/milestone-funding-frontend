// hooks/useContract.ts
"use client";

import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useReadContracts,
} from "wagmi";
import type { Abi } from "abitype";
import contractJSON from "@/contracts/Milestonefunding.json";

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

const CONTRACT_ABI: Abi = contractJSON.abi as Abi;

export function useContractAddress() {
  return CONTRACT_ADDRESS;
}

export function useContractABI() {
  return CONTRACT_ABI;
}

export function useProjectCount() {
  const result = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "projectCount",
  });

  const data = result.data as bigint | undefined;

  return { ...result, data };
}

export function useAllFundingProjects() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getAllFundingProjects",
    query: {
      refetchInterval: 5000,
    },
  });
}

export function useProjectCore(projectId: bigint | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getProjectCore",
    args: projectId !== undefined ? [projectId] : undefined,
    query: { enabled: projectId !== undefined },
  });
}

export function useProjectVoting(projectId: bigint | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getProjectVoting",
    args: projectId !== undefined ? [projectId] : undefined,
    query: { enabled: projectId !== undefined },
  });
}

export function useProjectMeta(projectId: bigint | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getProjectMeta",
    args: projectId !== undefined ? [projectId] : undefined,
    query: { enabled: projectId !== undefined },
  });
}

export function useAllInvestments(projectId: bigint | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getAllInvestments",
    args: projectId !== undefined ? [projectId] : undefined,
    query: { enabled: projectId !== undefined },
  });
}

export function useCreateProject() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const create = (
    name: string,
    description: string,
    softCapWei: bigint,
    category: number,
    milestoneDescriptions: [string, string, string],
    bond: bigint,
  ) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "createProject",
      args: [name, description, softCapWei, category, milestoneDescriptions],
      value: bond,
    });
  };

  return { create, isPending, isConfirming, isSuccess, error, hash };
}

export function useFundProject() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const fund = (projectId: bigint, value: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "fund",
      args: [projectId],
      value,
    });
  };

  return { fund, isPending, isConfirming, isSuccess, error, hash };
}

export function useCancelProject() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const cancel = (projectId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "cancelProject",
      args: [projectId],
    });
  };

  return { cancel, isPending, isConfirming, isSuccess, error, hash };
}

export function useSubmitMilestone() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const submit = (projectId: bigint, cid: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "submitMilestone",
      args: [projectId, cid],
    });
  };

  return { submit, isPending, isConfirming, isSuccess, error, hash };
}

export function useVote() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const vote = (projectId: bigint, option: 1 | 2) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "vote",
      args: [projectId, option],
    });
  };

  return { vote, hash, isPending, isConfirming, isSuccess, error };
}

export function useMyVotes(
  projectId: bigint | undefined,
  userAddress: `0x${string}` | undefined,
) {
  const enabled = projectId !== undefined && !!userAddress;
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getMyVotes",
    args: enabled ? [projectId!, userAddress!] : undefined,
    query: { enabled, refetchInterval: 5000 },
  });
}

export function useClaimableRefund() {
  const { address } = useAccount();
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getAllClaimableRefund",
    account: address,
    query: { enabled: !!address, refetchInterval: 5000 },
  });
}

export function useClaimableCreator() {
  const { address } = useAccount();
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getClaimableCreator",
    account: address,
    query: { enabled: !!address },
  });
}

export function useClaimableOwner() {
  const { address } = useAccount();
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getClaimableOwner",
    account: address,
    query: { enabled: !!address, refetchInterval: 5000 },
  });
}

export type InvestedRawData = readonly [
  string[], // projectIds
  string[], // creators
  string[], // names
  string[], // descriptions
  number[], // categories
  string[], // softCapWei
  string[], // totalFunded
  string[], // bond
  number[], // state
  string[], // invested
  string[][], // milestones
];

export function useMyInvestments() {
  const { address } = useAccount();

  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getMyInvestedProjects",
    account: address,
    args: [],
    query: { enabled: !!address },
  });

  const investedData = data as InvestedRawData | undefined;

  const investments =
    investedData && investedData.length === 11
      ? investedData[0].map((_: string, i: number) => ({
          projectId: BigInt(investedData[0][i]),
          creator: investedData[1][i],
          name: investedData[2][i],
          description: investedData[3][i],
          category: investedData[4][i],
          softCapWei: BigInt(investedData[5][i]),
          totalFunded: BigInt(investedData[6][i]),
          bond: BigInt(investedData[7][i]),
          state: Number(investedData[8][i]),
          invested: BigInt(investedData[9][i]),
          milestones: investedData[10][i],
        }))
      : [];

  return { investments, isLoading, refetch };
}

export function useMilestoneDescriptions(projectId: bigint | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getMilestoneDescriptions",
    args: projectId !== undefined ? [projectId] : undefined,
    query: { enabled: projectId !== undefined },
  });
}

export function useProjectsByCreator(creator?: `0x${string}`) {
  const { data: count } = useProjectCount();

  const projectCalls =
    count && creator
      ? Array.from({ length: Number(count) }).map((_, i) => ({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "getProjectCore",
          args: [BigInt(i)],
        }))
      : [];

  const { data, isLoading } = useReadContracts({
    contracts: projectCalls,
    query: { enabled: !!creator && !!count },
  });

  const projects =
    data
      ?.map((res: any, i: number) => {
        if (!res?.result) return null;
        const [
          projectCreator,
          name,
          description,
          category,
          softCapWei,
          totalFunded,
          bond,
          state,
        ] = res.result;

        if (projectCreator.toLowerCase() !== creator?.toLowerCase())
          return null;

        return {
          projectId: BigInt(i),
          creator: projectCreator,
          name,
          description,
          category,
          softCapWei,
          totalFunded,
          bond,
          state,
        };
      })
      .filter(Boolean) ?? [];

  return { projects, isLoading };
}

export function useProjectsByInvestor(address?: `0x${string}`) {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getMyInvestedProjects",
    account: address,
    args: [],
    query: { enabled: !!address },
  });

  const investedData = data as InvestedRawData | undefined;

  const investments =
    investedData && investedData.length === 11
      ? investedData[0].map((_: string, i: number) => ({
          projectId: BigInt(investedData[0][i]),
          creator: investedData[1][i],
          name: investedData[2][i],
          description: investedData[3][i],
          category: investedData[4][i],
          softCapWei: BigInt(investedData[5][i]),
          totalFunded: BigInt(investedData[6][i]),
          bond: BigInt(investedData[7][i]),
          state: Number(investedData[8][i]),
          invested: BigInt(investedData[9][i]),
          milestones: investedData[10][i],
        }))
      : [];

  return { investments, isLoading, refetch };
}

export function useClaimAllRefund() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claim = () =>
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "claimAllRefund",
    });

  return { claim, isPending, isConfirming, isSuccess, error, hash };
}

export function useClaimCreator() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claim = () =>
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "claimCreator",
    });

  return { claim, isPending, isConfirming, isSuccess, error, hash };
}

export function useClaimOwner() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claim = () =>
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "claimOwner",
    });

  return { claim, isPending, isConfirming, isSuccess, error, hash };
}
