// hooks/useContract.ts
"use client";

import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useReadContracts,
} from "wagmi";
import contractABI from "@/contracts/Milestonefunding.json";

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
const CONTRACT_ABI = contractABI.abi;

export function useContractAddress() {
  return CONTRACT_ADDRESS;
}

export function useContractABI() {
  return CONTRACT_ABI;
}

export function useProjectCount() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "projectCount",
  });
}

export function useAllFundingProjects() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getAllFundingProjects",
  });
}

export function useProjectCore(projectId: bigint | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getProjectCore",
    args: projectId !== undefined ? [projectId] : undefined,
    query: {
      enabled: projectId !== undefined,
    },
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
    bond: bigint
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
  userAddress: `0x${string}` | undefined
) {
  const enabled = projectId !== undefined && !!userAddress;
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getMyVotes",
    args: enabled ? [projectId!, userAddress!] : undefined,
    query: { enabled },
    watch: true,
  });
}

export function useClaimableInvestor() {
  const { address } = useAccount();
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getClaimableInvestor",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useClaimableCreator() {
  const { address } = useAccount();
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getClaimableCreator",
    args: address ? [address] : undefined,
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
    watch: true,        
    enabled: !!address,
  });
}


export function useClaimInvestor() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claim = () =>
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "claimInvestor",
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

export function useMyInvestments() {
  const { address } = useAccount();

  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
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
          state: Number(data[8][i]),
          invested: BigInt(data[9][i]),
          milestones: data[10][i] as string[],
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
          state: Number(data[8][i]),
          invested: BigInt(data[9][i]),
          milestones: data[10][i] as string[],
        }))
      : [];

  return { investments, isLoading, refetch };
}

