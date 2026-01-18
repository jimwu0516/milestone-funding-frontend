"use client";

import { useEffect } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

const TARGET_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID);

export function ChainGuard() {
  const { isConnected } = useAccount();
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (!isConnected) return;
    if (!TARGET_CHAIN_ID) return;

    if (currentChainId !== TARGET_CHAIN_ID) {
      switchChain?.({ chainId: TARGET_CHAIN_ID });
    }
  }, [isConnected, currentChainId, switchChain]);

  return null;
}
