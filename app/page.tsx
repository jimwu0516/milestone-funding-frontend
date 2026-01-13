// app/page.tsx
"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import CreateProjectForm from "@/components/CreateProjectForm";
import FAQAccordion from "@/components/FAQAccordion";

export default function Home() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const highlightCardClass =
    "flex flex-col items-center text-center p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-pink-600/10";

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
      <Navbar />

      <section className="relative overflow-hidden border-b border-gray-200  dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-24 text-center relative mt-20">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-10 blur-3xl -z-10 animate-pulse-slow"></div>
          <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
            Milestone Funding
          </h1>
          <p className="mt-6 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            A decentralized protocol for funding builders — capital is released
            only when milestones are proven.
          </p>
          <Link
            href="/funding"
            className="mt-8 inline-block bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-blue-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105"
          >
            Browse Funding Projects
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-3xl font-semibold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
            What is Milestone Funding?
          </h2>
          <p className="mt-6 text-gray-600 dark:text-gray-400 leading-relaxed">
            Milestone Funding is a trust-minimized crowdfunding protocol.
            Instead of giving creators all the money upfront, funds are locked
            in a smart contract and released in stages as builders prove
            progress.
          </p>
          <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
            Investors are not passive donors — they actively vote on each
            milestone. If a project fails, remaining funds are automatically
            refunded.
          </p>
        </div>

        <div className="bg-gradient-to-tr from-gray-100 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold">Why it matters</h3>
          <ul className="mt-6 space-y-4 text-gray-600 dark:text-gray-400">
            <li>• No blind trust — everything is enforced on-chain</li>
            <li>• No rug pulls — creators must stake a bond</li>
            <li>• No wasted capital — funds unlock only with progress</li>
            <li>• No centralized platform — only smart contracts</li>
          </ul>
        </div>
      </section>

      <section className="bg-gray-100 dark:bg-gray-950 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
            How it works
          </h2>

          <div className="mt-16 grid md:grid-cols-4 gap-8">
            {[
              {
                title: "Creator stakes",
                icon: "🛡️",
                desc: "Builders must deposit a 10% bond before launching a project. The bond is returned if the project succeeds.",
              },
              {
                title: "Investors fund",
                icon: "💰",
                desc: "Backers deposit ETH into the smart contract, not directly to the creator.",
              },
              {
                title: "Milestones",
                icon: "📈",
                desc: "Funds are released in 3 stages (20% / 30% / 50%) as work is delivered and verified on-chain.",
              },
              {
                title: "Investor voting",
                icon: "🗳️",
                desc: "Investors vote on each milestone. If progress is rejected, remaining funds are refunded automatically.",
              },
            ].map((item, i) => (
              <div key={i} className={`${highlightCardClass}`}>
                <div className="w-12 h-12 mb-4 flex items-center justify-center bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-white text-3xl">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-semibold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
          Why Build on Milestone Funding?
        </h2>
        <p className="mt-6 text-gray-600 dark:text-gray-400 text-center max-w-3xl mx-auto">
          Empower your project with trustless funding, staged milestone
          releases, and investor governance.
        </p>

        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {[
            {
              icon: "🚀",
              title: "Staged Funding",
              desc: "Funds are released in 3 milestones (20% / 30% / 50%) only when progress is proven on-chain.",
            },
            {
              icon: "🗳️",
              title: "Investor Voting",
              desc: "Investors vote on each milestone. High participation and consensus ensures fair approval.",
            },
            {
              icon: "🔒",
              title: "Safe & Trustless",
              desc: "Smart contracts lock funds and enforce rules. If a milestone fails, funds are refunded automatically.",
            },
          ].map((item, i) => (
            <div key={i} className={highlightCardClass}>
              <div className="w-12 h-12 mb-4 flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-3xl">
                {item.icon}
              </div>
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105 cursor-pointer"
          >
            Create My Project
          </button>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
            On-chain investor governance
          </h2>
          <p className="mt-6 text-gray-600 dark:text-gray-400 leading-relaxed">
            Voting power is based on how much you invested, weighted to prevent
            whales from controlling outcomes. A milestone passes only if
            participation is high and consensus is strong.
          </p>
          <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
            Honest builders get funded faster, while bad actors lose their bond
            and reputation.
          </p>
        </div>

        <div className="bg-gradient-to-tr from-gray-100 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold">What happens on failure?</h3>
          <p className="mt-6 text-gray-600 dark:text-gray-400 leading-relaxed">
            If a milestone is rejected, remaining locked funds are automatically
            refunded to investors, and the creator’s bond is slashed. No human
            intervention. Just code.
          </p>
        </div>
      </section>

      <FAQAccordion />

      <footer className="border-t border-gray-200 dark:border-gray-800 py-12 text-center space-y-4">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <a
            href="https://github.com/jimwu0516/MilestoneFunding.git"
            target="_blank"
            className="text-gray-600 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
          >
            GitHub
          </a>

          <span className="text-gray-600 dark:text-gray-400">|</span>

          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
            Donation:
            <a
              href="https://etherscan.io/address/0x4d610A9293A493Db7B5F34937A3280705032D38d"
              target="_blank"
              className=" hover:text-purple-500 dark:hover:text-purple-400 transition-colors truncate max-w-xs"
              title="0x4d610A92..........2D38d"
            >
              0x4d610A92..........2D38d
            </a>
          </span>
        </div>

        <p className="text-gray-500 dark:text-gray-400 text-sm mt-4">
          © 2026 Milestone Funding. All rights reserved.
        </p>
      </footer>

      {showCreateForm && (
        <CreateProjectForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
}
