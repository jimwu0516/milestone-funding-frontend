//app/providers.tsx
"use client";

import { WagmiProvider, createConfig, http, Transport } from "wagmi";
import { mainnet, sepolia, Chain } from "wagmi/chains";
import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChainGuard } from "@/components/ChainGuard";

const queryClient = new QueryClient();

const DEFAULT_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID);

const allChains: Chain[] = [mainnet, sepolia];

const defaultChain =
  allChains.find((c) => c.id === DEFAULT_CHAIN_ID) ?? sepolia;

const chains: readonly [Chain, ...Chain[]] = [
  defaultChain,
  ...allChains.filter((c) => c.id !== defaultChain.id),
];

const { connectors } = getDefaultWallets({
  appName: "Milestone Funding",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
});

const transports: Record<number, Transport> = {
  [mainnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
  [sepolia.id]: http(),
};

const wagmiConfig = createConfig({
  chains,
  connectors,
  transports,
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <RainbowKitProvider showRecentTransactions>
          <ChainGuard />
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
