"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { Chain } from "wagmi/chains";
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
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
});

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID);
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "";

const customChain: Chain = {
  id: chainId,
  name: chainId === 1 ? "Ethereum Mainnet" : chainId === 97 ? "BSC Testnet" : "Custom Chain",
  network: chainId === 1 ? "homestead" : chainId === 97 ? "bsc-testnet" : "custom",
  nativeCurrency: {
    decimals: 18,
    name: chainId === 97 ? "Binance Coin" : "Ether",
    symbol: chainId === 97 ? "BNB" : "ETH",
  },
  rpcUrls: {
    default: { http: [rpcUrl] },
  },
  blockExplorers: {
    default: {
      name: "Explorer",
      url:
        chainId === 97
          ? "https://testnet.bscscan.com"
          : chainId === 1
          ? "https://etherscan.io"
          : "",
    },
  },
  testnet: chainId !== 1,
};

const config = createConfig({
  chains: [customChain],
  transports: {
    [customChain.id]: http(),
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
        <RainbowKitProvider chains={[customChain]}>
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
