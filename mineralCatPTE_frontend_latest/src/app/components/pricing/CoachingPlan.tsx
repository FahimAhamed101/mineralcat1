"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import fetchWithAuth from "@/lib/fetchWithAuth";

type PlanType = "Essential" | "Premium" | "Master";

interface Plan {
  id: PlanType;
  name: string;
  description: string;
  price: string;
  buttonText: string;
  recommended?: boolean;
  features: string[];
}

const subscriptionPlans: Plan[] = [
  {
    id: "Essential",
    name: "Essential",
    description: "For light preparation",
    price: "€ 199.99",
    buttonText: "Get Essential",
    features: [
      "30 Days Coaching",
      "7 Full Mock Tests",
      "250 AI Credits",
      "Skill Overview",
      "Feedback on Main Sections",
      "Basic Study Roadmap",
      "Guided Practice Suggestions",
    ],
  },
  {
    id: "Premium",
    name: "Premium",
    description: "For consistent Progress",
    price: "€ 299.99",
    buttonText: "Get Premium",
    recommended: true,
    features: [
      "60 Days Coaching",
      "7 Full Mock Tests",
      "250 AI Credits",
      "Full Skill Gap Analysis",
      "Feedback on All Skills",
      "Weekly Progress Review",
      "Custom Task Adjustments",
    ],
  },
  {
    id: "Master",
    name: "Master",
    description: "For complete preparation",
    price: "€ 499.99",
    buttonText: "Get Master",
    features: [
      "Until you get your PTE",
      "12 Full Mock Tests",
      "500 AI Credits",
      "Complete Audit + Weekly Strategy",
      "Personalized Coaching",
      "Unlimited Feedback During Coaching",
      "Dedicated Coach",
    ],
  },
];

export default function CoachingPlan() {
  // Remove state and make it a constant - always "Premium" by default
  const selectedPlan: PlanType = "Premium";
  const [loadingPlan, setLoadingPlan] = useState<PlanType | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const plans = subscriptionPlans;
  const gradientClass = "bg-gradient-to-r from-[#A52B1A] to-[#EF5634]";
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

  const coachingPlanPrices: Record<PlanType, number> = {
    Essential: 199.99,
    Premium: 299.99,
    Master: 499.99,
  };

  const handlePlanClick = async (plan: Plan) => {
    setErrorMsg("");
    setLoadingPlan(plan.id);

    try {
      const response = await fetchWithAuth(
        `${baseUrl}/api/stripe/create-coaching-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            price: coachingPlanPrices[plan.id],
            description: `${plan.id} Coaching Plan`,
            coachingPlanType: plan.id,
            successUrl: `${window.location.origin}/pricing?success=true`,
            cancelUrl: `${window.location.origin}/pricing`,
          }),
        }
      );

      if (!response?.ok) {
        throw new Error("Coaching checkout failed");
      }

      const result = await response.json();
      if (result?.status && result?.data?.checkoutUrl) {
        window.location.href = result.data.checkoutUrl;
      } else {
        throw new Error("Missing checkout URL");
      }
    } catch {
      setErrorMsg("Could not create checkout session. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen lg:mx-20 px-6 py-5 md:py-10 lg:px-12">
      {errorMsg && (
        <div className="mb-4 rounded bg-red-100 p-2 text-red-700">
          {errorMsg}
        </div>
      )}
      {/* Header Section */}
      <div className="mb-12 flex flex-col justify-between gap-8 lg:mb-20">
        <div className="grid text-center justify-center">
          <div className="flex justify-center items-center">
            <span className="w-40 hidden md:block border-2 mr-2"></span>
            <h1 className="text-4xl font-bold lg:text-5xl flex items-center">
              <span className="text-[#DE3B40] text-center mr-4">Coaching</span>{" "}
              plans
            </h1>
            <span className="w-40 hidden md:block border-2 ml-2"></span>
          </div>
          <p className="mt-4 text-lg text-gray-600 lg:max-w-4xl">
            Take your <span className="font-bold">PTE Core</span> Core
            preparation to the next level with personalized coaching. Work
            directly with expert trainers who analyze your performance, guide
            your practice, and help you reach your target score faster.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;
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
                {plan.recommended && (
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
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p
                  className={`mt-1 text-sm ${
                    isSelected ? "text-white/90" : "text-gray-600"
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              {/* Body Section - always light background */}
              <div className="bg-white p-8">
                {/* Price */}
                <div className="text-5xl font-bold text-center text-gray-900">
                  {plan.price}
                </div>

                {/* CTA Button */}
                <button
                  className={`mt-6 w-full rounded-lg py-3 font-semibold transition-all ${
                    isSelected
                      ? `${gradientClass} text-white hover:opacity-90`
                      : "border border-gray-800 bg-transparent text-gray-800 hover:bg-gray-100"
                  }`}
                  disabled={loadingPlan === plan.id}
                  onClick={() => handlePlanClick(plan)}
                >
                  {loadingPlan === plan.id ? "Processing..." : plan.buttonText}
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
