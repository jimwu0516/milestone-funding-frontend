//components/TxModal.tsx
"use client";

import { ReactNode } from "react";

type TxModalProps = {
  isOpen: boolean;
  onClose: () => void;
  status: "pending" | "confirming" | "success" | "error";
  hash?: string | null;
  errorMessage?: string;
  children?: ReactNode;
  buttonClass?: string;
};

const ETHERSCAN_TX_BASE = process.env.NEXT_PUBLIC_ETHERSCAN_TX_BASE;

export default function TxModal({
  isOpen,
  onClose,
  status,
  hash,
  errorMessage,
  children,
  buttonClass = "px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow transform hover: cursor-pointer",
}: TxModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/20">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 shadow-xl text-center">
        {status === "pending" && (
          <>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Submitting...
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Please confirm</p>
          </>
        )}

        {status === "confirming" && (
          <>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Pending...
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Submitted</p>
            {hash && (
              <a
                href={`${ETHERSCAN_TX_BASE}/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline"
                title="View on Etherscan"
              >
                {hash.slice(0, 10)}...{hash.slice(-8)}
                <span className="text-[10px]">↗</span>
              </a>
            )}
          </>
        )}

        {status === "success" && (
          <>
            <div className="inline-block w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">
              Success！
            </h3>
            <button
              onClick={onClose}
              className={`${buttonClass} bg-green-600 hover:bg-green-700 text-white`}
            >
              OK
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
              Error
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {errorMessage || "Try again"}
            </p>
            <button
              onClick={onClose}
              className={`${buttonClass} bg-red-600 hover:bg-red-700 text-white`}
            >
              OK
            </button>
          </>
        )}

        {children}
      </div>
    </div>
  );
}
