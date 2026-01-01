//components/Navbar.tsx
"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              Milestone Funding
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8 flex-1 justify-center">
            <Link
              href="/my-projects"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium"
            >
              My Projects
            </Link>
          </div>

          <div className="flex-shrink-0">
            {mounted && <ConnectButton
              showBalance={false}
              chainStatus="none"
            />
            }
            {!mounted && (
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

