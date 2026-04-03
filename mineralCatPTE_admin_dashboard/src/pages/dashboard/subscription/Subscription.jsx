import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Check, Medal, Trophy, Crown } from "lucide-react"

export default function Component() {
  const plans = [
    {
      name: "Bronze",
      icon: Medal,
      iconColor: "text-amber-600",
      description: "Get started with AI for creatives",
      price: "3.75 EUR",
      originalPrice: "6 EUR",
      period: "/month",
      buttonText: "Get Bronze",
      buttonVariant: "default" ,
      features: [
        {
          title: "Freepik AI Suite with:",
          items: [
            "84,000 AI credits/year — up to 16,800 images or 280 videos, depending on the model",
            "AI generation and editing of images, videos, icons, mockups, and music",
            "Commercial AI license for professionals",
          ],
        },
        {
          title: "Stock content:",
          items: [],
        },
      ],
    },
    {
      name: "Silver",
      icon: Trophy,
      iconColor: "text-gray-500",
      description: "Unlock Premium assets and on-brand visuals",
      price: "9 EUR",
      originalPrice: "15 EUR",
      period: "/month",
      buttonText: "Get Silver",
      buttonVariant: "default" ,
      features: [
        {
          title: "Everything in Bronze, and:",
          items: [
            "216,000 AI credits/year — up to 43,200 images or 720 videos, depending on the model",
            "Train custom AI models for on-brand visuals",
            "Access to Premium stock content: 250M+ high-quality photos, vectors, graphic design templates, and more",
            "Unlimited downloads",
          ],
        },
      ],
    },
    {
      name: "Gold",
      icon: Crown,
      iconColor: "text-yellow-500",
      description: "Boost your creativity with full access to all video, image, and audio AI models",
      price: "21 EUR",
      originalPrice: "34 EUR",
      period: "/month",
      buttonText: "Get Gold",
      buttonVariant: "default" ,
      badge: "Best value",
      features: [
        {
          title: "Everything in Silver, and:",
          items: [
            "540,000 AI credits/year — up to 108,000 images or 1,800 videos, depending on the model",
            "Priority speed when generating images with ChatGPT and Google Imagen 4, and videos with Google Veo 3",
            "Train advanced custom AI models for on-brand visuals: styles, objects, colors, and characters",
          ],
        },
      ],
    },
  ]

  return (
    <div className="w-full lg:max-w-[90%] mt-8 mx-auto p-6">
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
                  <span className="text-3xl font-bold text-blue-600">{plan.price}</span>
                  <span className="text-sm text-gray-500">{plan.period}</span>
                </div>
                <div className="text-sm text-gray-400 line-through text-center">{plan.originalPrice}</div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-6">{plan.buttonText}</Button>

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
