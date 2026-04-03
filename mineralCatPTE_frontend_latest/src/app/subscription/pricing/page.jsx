"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Medal, Trophy, Crown } from "lucide-react"
import fetchWithAuth from "@/lib/fetchWithAuth"

export default function Component() {
  const [loadingPlan, setLoadingPlan] = useState(null)
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const plans = [
    {
      name: "Bronze",
      icon: Medal,
      iconColor: "text-amber-600",
      description: "Get started with AI for creatives",
      price: "29.99",
      period: "/month",
      buttonText: "Get Started",
      buttonVariant: "default",
      features: [
        {
          title: "Freepik AI Suite with:",
          items: [
            "5 Full Mock Tests",
            "100 AI credits/month —",
            "Commercial AI license for professionals",
          ],
        },
        {
          title: "Stock content:",
          items: [],
        },
      ],
      apiData: {
        price: 29.99,
        description: "Bronze Plan Subscription (1 Month)",
        planValidity: "30",
        planType: "Bronze"
      }
    },
    {
      name: "Silver",
      icon: Trophy,
      iconColor: "text-gray-500",
      description: "Unlock Premium assets and on-brand visuals",
      price: "49.99",
      period: "/month",
      buttonText: "Get Started",
      buttonVariant: "default",
      features: [
        {
          title: "Everything in Bronze, and:",
          items: [
            "10 Full Mock Tests",
            "300 AI credits/month —",
            "Commercial AI license for professionals",
          ],
        },
      ],
      apiData: {
        price: 49.99,
        description: "Silver Plan Subscription (1 Month)",
        planValidity: "30",
        planType: "Silver"
      }
    },
    {
      name: "Gold",
      icon: Crown,
      iconColor: "text-yellow-500",
      description: "Boost your creativity with full access to all video, image, and audio AI models",
      price: "69.99",
      period: "/month",
      buttonText: "Get Started",
      buttonVariant: "default" ,
      badge: "Best value",
      features: [
        {
          title: "Everything in Silver, and:",
          items: [
            "15 Full Mock Tests",
            "700 AI credits/month —",
            "Commercial AI license for professionals",
          ],
        },
      ],
      apiData: {
        price: 69.99,
        description: "Gold Plan Subscription (1 Month)updated",
        planValidity: "30",
        planType: "Gold"
      }
    },
  ]
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
  const handlePlanClick = async (plan, idx) => {
    setErrorMsg("")
    setSuccessMsg("")
    setLoadingPlan(idx)
    try {
      // Change API url as needed
      const response = await fetchWithAuth(`${baseUrl}/api/stripe/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...plan.apiData,
          successUrl: `${window.location.origin}/pricing?success=true`,
          cancelUrl: `${window.location.origin}/pricing`,
        })
      })
      if (!response.ok) {
        throw new Error("Subscription failed")
      }
      const result = await response.json()
      if (result?.status && result?.data?.checkoutUrl) {
        window.location.href = result.data.checkoutUrl
        return
      }
      setSuccessMsg(`Successfully subscribed to ${plan.name}!`)
    } catch (err) {
      setErrorMsg(`Could not subscribe to ${plan.name}.`)
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="w-full lg:max-w-[90%] mt-8 mx-auto p-6">
      {successMsg && <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">{successMsg}</div>}
      {errorMsg && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{errorMsg}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <Card
            key={index}
            className="relative flex flex-col h-full border-2 hover:border-blue-200 transition-all duration-300 hover:shadow-lg"
          >
            {plan.badge && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                {plan.badge}
              </Badge>
            )}
            <CardHeader className="pb-4 text-center">
              <div className="flex justify-center mb-3">
                {plan.icon && <plan.icon className={`w-8 h-8 ${plan.iconColor}`} />}
              </div>
              <CardTitle className="text-xl font-semibold">{plan.name}</CardTitle>
              <CardDescription className="text-sm text-gray-600 min-h-[40px]">{plan.description}</CardDescription>
              <div className="pt-4">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-3xl font-bold text-[#7F0B0B]">€{plan.price}</span>
                  <span className="text-sm text-gray-500">{plan.period}</span>
                </div>
                <div className="text-sm text-gray-400 line-through text-center">{plan.originalPrice}</div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <Button
                className="w-full bg-[#590000] hover:bg-[#7F0B0B] text-white mb-6"
                disabled={loadingPlan === index}
                onClick={() => handlePlanClick(plan, index)}
              >
                {loadingPlan === index ? "Processing..." : plan.buttonText}
              </Button>

              <div className="space-y-4 flex-1">
                {plan.features.map((section, sectionIndex) => (
                  <div key={sectionIndex}>
                    {section.title && <h4 className="font-medium text-sm mb-3">{section.title}</h4>}
                    <ul className="space-y-3">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
