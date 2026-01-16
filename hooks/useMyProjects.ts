//hooks/useMyProjects.ts
"use client";

import { useAccount } from "wagmi";
import { useProjectCount, useProjectCore } from "./useContract";
import { useMemo } from "react";

export function useMyProjects() {
  const { address } = useAccount();
  const { data: projectCount, isLoading: countLoading } = useProjectCount();

  const projectIds = useMemo(() => {
    if (!projectCount || projectCount === BigInt(0)) return [];
    const ids: bigint[] = [];
    for (let i = BigInt(1); i <= projectCount; i++) {
      ids.push(i);
    }
    return ids;
  }, [projectCount]);

  return {
    projectIds,
    isLoading: countLoading,
    address,
  };
}

export function useIsMyProject(projectId: bigint | undefined) {
  const { address } = useAccount();
  const { data: projectCore } = useProjectCore(projectId);

  if (!projectCore || !address) return false;
  const [creator] = projectCore;
  return creator.toLowerCase() === address.toLowerCase();
}
