"use client";

import { useState } from "react";
import { Check } from "lucide-react";

type TabType = "subscription" | "mocktest";
type PlanType = "starter" | "pro" | "elite";

interface Plan {
  id: PlanType;
  name: string;
  description: string;
  mock?: string;
  mockTestCount?: number;
  apiPrice?: number;
  price: string;
  buttonText: string;
  recommended?: boolean;
  features: string[];
}

const subscriptionPlans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For light preparation",
    price: "€ 29.99",
    buttonText: "Get Starter",
    features: [
      "5 Full Mock Tests",
      "100 AI Credits",
      "Premium scoring",
      "Official PTE criteria",
      "Weekly Predictions",
      "Performance Tracking",

      "No expiration",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "For consistent progress",
    price: "€ 49.99",
    buttonText: "Get Pro",
    recommended: true,
    features: [
      "7 Full Mock Tests",
      "250 AI Credits",
      "Premium scoring",
      "Official PTE criteria",
      "Weekly Predictions",
      "Performance Tracking",

      "No expiration",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    description: "For complete preparation",
    price: "€ 69.99",
    buttonText: "Get Elite",
    features: [
      "12 Full Mock Tests",
      "500 AI Credits",
      "Premium scoring",
      "Official PTE criteria",
      "Weekly Predictions",
      "Performance Tracking",

      "No expiration",
    ],
  },
];

const mockTestPlans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Basic mock tests",
    mock: "1 Full Mock test",
    mockTestCount: 1,
    apiPrice: 4.99,
    price: "€ 4.99",
    buttonText: "Get Starter",
    features: [
      "1 Mock Test",
      "Premium scoring",
      "Official PTE criteria",
      "No expiration",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "Advanced mock tests",
    mock: "3 Full Mock test",
    mockTestCount: 3,
    apiPrice: 12.99,
    price: "€ 12.99",
    buttonText: "Get Pro",
    recommended: true,
    features: [
      "3 Mock Tests",
      "Premium scoring",
      "Official PTE criteria",
      "No expiration",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    description: "Premium mock tests",
    mock: "5 Full Mock test",
    mockTestCount: 5,
    apiPrice: 19.99,
    price: "€ 19.99",
    buttonText: "Get Elite",
    features: [
      "5 Mock Tests",
      "Premium scoring",
      "Official PTE criteria",
      "No expiration",
    ],
  },
];

export default function ChoosePlan() {
  const [activeTab, setActiveTab] = useState<TabType>("subscription");

  // Remove selectedPlan state and make it a constant
  const selectedPlan: PlanType = "pro"; // Always "pro" by default

  const plans =
    activeTab === "subscription" ? subscriptionPlans : mockTestPlans;
  const gradientClass = "bg-gradient-to-r from-[#A52B1A]  to-[#EF5634]";

  return (
    <div className="min-h-screen lg:mx-20 px-6 py-15 lg:px-12">
      {/* Header Section */}
      <div className="mb-12 flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
        <div className="flex-1">
          <h1 className="text-4xl font-bold lg:text-5xl">
            Choose your <span className="text-[#DE3B40]">plan</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 lg:max-w-2xl">
            Find the perfect plan for your{" "}
            <span className="font-bold">PTE Core</span> preparation and practice
            with real exam simulations, AI scoring, and personalized feedback.
          </p>
        </div>

        <div className="flex gap-2 justify-between rounded-full border border-gray-300 bg-white p-1">
          <button
            onClick={() => setActiveTab("subscription")}
            className={`rounded-full px-6 py-2 font-semibold transition-all ${
              activeTab === "subscription"
                ? `${gradientClass} text-white`
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            Subscription
          </button>
          <button
            onClick={() => setActiveTab("mocktest")}
            className={`rounded-full px-6 py-2 font-semibold transition-all ${
              activeTab === "mocktest"
                ? `${gradientClass} text-white`
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            Mock Test
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const isMockTest = activeTab === "mocktest";

          return (
            <div
              key={plan.id}
              // Remove onClick handler to prevent selection changes
              className="relative overflow-hidden rounded-2xl border border-gray-200 transition-all"
            >
              {/* Header Section with gradient when selected */}
              <div
                className={`p-6 transition-all ${
                  isSelected
                    ? `${gradientClass} text-white`
                    : "bg-[#e0e0e0] text-gray-900"
                }`}
              >
                {/* Recommended Badge */}
                {!isMockTest && plan.recommended && (
                  <div
                    className={`absolute right-6 rounded-full px-4 py-1 text-sm font-semibold ${
                      isSelected
                        ? "bg-white text-[#EF5634]"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    Recommended
                  </div>
                )}

                {/* Plan Name and Description */}
                {isMockTest ? (
                  <h3 className="text-2xl font-bold text-center bg-white text-black rounded-2xl py-1 md:mx-30">
                    {plan.mock}
                  </h3>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <p
                      className={`mt-1 text-sm ${
                        isSelected ? "text-white/90" : "text-gray-600"
                      }`}
                    >
                      {plan.description}
                    </p>
                  </>
                )}
              </div>

              {/* Body Section - always light background */}
              <div className="bg-white p-8">
                {/* Price */}
                <div className="text-5xl font-bold text-center  text-gray-900">
                  {plan.price}
                </div>

                {/* CTA Button */}
                <button
                  className={`mt-6 w-full rounded-lg py-3 font-semibold transition-all ${
                    isSelected
                      ? `${gradientClass} text-white hover:opacity-90`
                      : "border border-gray-800 bg-transparent text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  {plan.buttonText}
                </button>

                {/* Features List */}
                <div className="mt-8">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Features
                  </h4>
                  <ul className="mt-4 space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-3 text-sm text-gray-700"
                      >
                        <Check size={18} className="text-[#EF5634]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
