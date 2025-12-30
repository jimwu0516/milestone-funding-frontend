"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">
        Milestone Funding
      </h1>

      <ConnectButton />
      
    </main>
  );
}
