//app/providers.tsx
"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import {
  RainbowKitProvider,
  getDefaultWallets,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

const { wallets } = getDefaultWallets({
  appName: "Milestone Funding",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
});

/**
 * Wagmi config
 */
const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(), 
    [sepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
  },
  wallets,
});

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider chains={[mainnet, sepolia]}>
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
