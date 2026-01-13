"use client";

import { useState } from "react";

type FAQItem = {
  question: string;
  answer: string;
};

type FAQCategory = {
  title: string;
  items: FAQItem[];
};

const faqData: FAQCategory[] = [
  {
    title: "For Creators",
    items: [
      {
        question: "Can I cancel my project?",
        answer:
          "Yes, but only while the project is still in the Funding stage. If no one has funded your project yet, your bond is forfeited to the platform owner. If the project has already received funding, your bond is split: 50% goes to the platform owner, and 50% is distributed to investors proportionally along with their refunds. All investors always get back their full invested amount.",
      },
      {
        question: "What happens if a milestone does NOT pass?",
        answer:
          "If a milestone is rejected by investors, the project immediately enters a Failure state. All remaining unreleased funds are automatically refunded to investors, and the creator’s bond is slashed and sent to the platform owner. The creator will not receive any further payments for this project.",
      },
      {
        question: "When do I get paid?",
        answer:
          "Funds are released based on milestone voting: 20% for Milestone 1, 30% for Milestone 2, 50% for Milestone 3. If all milestones pass, bond is returned.",
      },
      {
        question: "How do I claim my funds?",
        answer: "Go to claim fund page",
      },
    ],
  },
  {
    title: "For Investors",
    items: [
      {
        question: "How do I fund a project?",
        answer:
          "Send ETH to a project in Funding stage. Overfunding is refunded automatically. Funding completion triggers a snapshot for voting weight.",
      },
      {
        question: "Can I vote on milestones?",
        answer:
          "Only investors can vote Yes or No during the Voting Round. Voting weight is based on your investment.",
      },
      {
        question: "How are votes finalized?",
        answer:
          "Voting requires ≥70% total weight participation. ≥40% No votes automatically fail the milestone. Yes passes if exceeding remaining possible votes.",
      },
      {
        question: "What happens if a milestone fails?",
        answer:
          "Investors receive a proportional refund of remaining unclaimed funds, and the creator’s bond goes to the platform owner.",
      },
      {
        question: "How do I claim my funds?",
        answer: "Go to claim fund page",
      },
    ],
  },
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="text-4xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
        Frequently Asked Questions
      </h2>

      {faqData.map((category, catIdx) => (
        <div key={catIdx} className="mt-12">
          <h3 className="text-2xl font-bold mb-6 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            {category.title}
          </h3>
          <div className="space-y-3">
            {category.items.map((item, idx) => {
              const isOpen = openIndex === catIdx * 10 + idx;
              return (
                <div
                  key={idx}
                  className="bg-gray-900 dark:bg-gray-950 border border-gray-700 rounded-2xl shadow-lg overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleIndex(catIdx * 10 + idx)}
                    className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-500 hover:text-white transition-all duration-300"
                  >
                    <span className="font-medium text-gray-200 dark:text-gray-100">
                      {item.question}
                    </span>
                    <span
                      className={`text-xl font-bold transition-transform duration-300 ${
                        isOpen ? "rotate-45 text-purple-400" : "text-gray-400"
                      }`}
                    >
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 py-4 bg-gray-800 dark:bg-gray-900 text-gray-300 dark:text-gray-400 border-t border-gray-700 rounded-b-2xl">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
