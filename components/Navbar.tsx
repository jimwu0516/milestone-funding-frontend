// components/Navbar.tsx
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [showClaimMenu, setShowClaimMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItem = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`block px-3 py-2 text-sm font-medium transition-colors
        ${
          active
            ? "text-white"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-200"
        }`}
      >
        {label}
      </Link>
    );
  };

  const claimMenu = (
    <div className="relative">
      <button
        className={`px-3 py-2 text-sm font-medium transition-colors
        ${
          pathname.startsWith("/claim")
            ? "text-white"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-200"
        }`}
        onClick={() => setShowClaimMenu(!showClaimMenu)}
      >
        Claim Fund
      </button>

      {showClaimMenu && (
        <div className="absolute top-full mt-2 w-44 rounded-xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          <Link
            href="/claim/creator"
            className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-purple-500/10 hover:text-purple-500"
          >
            I’m Creator
          </Link>
          <Link
            href="/claim/investor"
            className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-purple-500/10 hover:text-purple-500"
          >
            I’m Investor
          </Link>
          <Link
            href="/claim/owner"
            className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-purple-500/10 hover:text-purple-500"
          >
            I’m Owner
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600"
            >
              Milestone Funding
            </Link>

            <div className="hidden md:flex items-center space-x-4">
              {navItem("/funding", "Funding")}
              {navItem("/my-investments", "My Investments")}
              {navItem("/my-projects", "My Projects")}
              {claimMenu}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {mounted ? (
              <ConnectButton
                showBalance={false}
                accountStatus="address"
                chainStatus="none"
                label="Connect"
                className="text-white rounded-lg px-4 py-2 font-medium hover:opacity-90 transition-opacity"
              />
            ) : (
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 ml-3 rounded-md text-gray-500 hover:text-gray-200 dark:hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? (
                <span className="text-2xl font-bold">×</span>
              ) : (
                <span className="text-2xl font-bold">☰</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItem("/funding", "Funding")}
            {navItem("/my-investments", "My Investments")}
            {navItem("/my-projects", "My Projects")}

            <div>
              <button
                onClick={() => setShowClaimMenu(!showClaimMenu)}
                className="w-full text-left px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-200"
              >
                Claim Fund
              </button>
              {showClaimMenu && (
                <div className="pl-4 space-y-1">
                  <Link
                    href="/claim/creator"
                    className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-purple-500"
                  >
                    I’m Creator
                  </Link>
                  <Link
                    href="/claim/investor"
                    className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-purple-500"
                  >
                    I’m Investor
                  </Link>
                  <Link
                    href="/claim/owner"
                    className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-purple-500"
                  >
                    I’m Owner
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
