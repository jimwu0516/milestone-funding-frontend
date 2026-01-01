// hooks/useContract.ts
"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import contractABI from "@/contracts/Milestonefunding.json";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

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
    query: {
      enabled: projectId !== undefined,
    },
  });
}

export function useProjectMeta(projectId: bigint | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getProjectMeta",
    args: projectId !== undefined ? [projectId] : undefined,
    query: {
      enabled: projectId !== undefined,
    },
  });
}

export function useAllInvestments(projectId: bigint | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getAllInvestments",
    args: projectId !== undefined ? [projectId] : undefined,
    query: {
      enabled: projectId !== undefined,
    },
  });
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

  return {
    fund,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useCreateProject() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const create = (name: string, description: string, softCapWei: bigint, bond: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "createProject",
      args: [name, description, softCapWei],
      value: bond,
    });
  };

  return {
    create,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
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

  return {
    cancel,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

