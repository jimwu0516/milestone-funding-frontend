// hooks/useMyProjects.ts
"use client";

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { useMemo } from "react";
import contractJSON from "@/contracts/Milestonefunding.json";
import type { Abi } from "abitype";
import { useProjectCore } from "@/hooks/useContract";

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
const CONTRACT_ABI: Abi = contractJSON.abi as Abi;

export function useMyProjects() {
  const { address } = useAccount();

  const { data: projectCount, isLoading: countLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "projectCount",
  });

  const contracts = useMemo(() => {
    if (!projectCount) return [];
    return Array.from({ length: Number(projectCount) }, (_, i) => ({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "getProjectCore",
      args: [BigInt(i + 1)],
    }));
  }, [projectCount]);

  const { data: allProjectsData, isLoading: dataLoading } = useReadContracts({
    contracts,
    query: { enabled: contracts.length > 0 },
  });

  const myProjects = useMemo(() => {
    if (!allProjectsData || !address) return { active: [], inactive: [] };

    const activeStates = [1, 2, 3, 5, 6, 8, 9];
    const results = { active: [] as bigint[], inactive: [] as bigint[] };

    allProjectsData.forEach((res, index) => {
      if (res.status === "success" && res.result) {
        const [creator, , , , , , , state] = res.result as any[];
        const projectId = BigInt(index + 1);

        if (creator.toLowerCase() === address.toLowerCase()) {
          if (activeStates.includes(state)) {
            results.active.push(projectId);
          } else {
            results.inactive.push(projectId);
          }
        }
      }
    });

    return results;
  }, [allProjectsData, address]);

  return {
    activeIds: myProjects.active,
    inactiveIds: myProjects.inactive,
    isLoading: countLoading || dataLoading,
  };
}

export function useIsMyProject(projectId: bigint | undefined) {
  const { address } = useAccount();
  const { data: projectCore } = useProjectCore(projectId);

  if (!projectCore || !address) return false;

  const [creator] = projectCore as [string, ...any[]];
  return creator.toLowerCase() === address.toLowerCase();
}
