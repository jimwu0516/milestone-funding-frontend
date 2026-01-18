//app/providers.tsx
"use client";

import { WagmiProvider, createConfig, http, Transport } from "wagmi";
import { mainnet, sepolia, Chain } from "wagmi/chains";
import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const chains: readonly [Chain, ...Chain[]] = [mainnet, sepolia];

const { connectors } = getDefaultWallets({
  appName: "Milestone Funding",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
});

const transports: Record<number, Transport> = {
  [mainnet.id]: http(),
  [sepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
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
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
