//components/Navbar.tsx
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [showClaimMenu, setShowClaimMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link
              href="/"
              className="text-xl font-bold text-gray-900 dark:text-white"
            >
              Milestone Funding
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8 flex-1 justify-center">
          <Link
              href="/my-investments"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium"
            >
              My Investments
            </Link>
            <Link
              href="/my-projects"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium"
            >
              My Projects
            </Link>

            <div
              className="relative"
              onMouseEnter={() => setShowClaimMenu(true)}
              onMouseLeave={() => setShowClaimMenu(false)}
            >
              <button className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium">
                Claim Fund
              </button>

              {showClaimMenu && (
                <div className="absolute top-full mt-1 w-40 bg-white dark:bg-gray-800 shadow-lg rounded-lg z-50">
                  <Link
                    href="/claim/creator"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    I'm Creator
                  </Link>
                  <Link
                    href="/claim/investor"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    I'm Investor
                  </Link>
                  <Link
                    href="/claim/owner"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    I'm Owner
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="flex-shrink-0">
            {mounted && (
              <ConnectButton showBalance={false} chainStatus="none" />
            )}
            {!mounted && (
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
