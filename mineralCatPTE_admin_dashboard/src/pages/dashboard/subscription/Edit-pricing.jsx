import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Badge } from "../../../components/ui/badge";
import { Trash2, Plus, Save, Eye } from "lucide-react";

export default function EditPricing() {
  const [plans, setPlans] = useState([
    {
      name: "Bronze",
      description: "Get started with AI for creatives",
      price: "3.75 EUR",
      originalPrice: "6 EUR",
      period: "/month",
      buttonText: "Get Bronze",
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
      description: "Unlock Premium assets and on-brand visuals",
      price: "9 EUR",
      originalPrice: "15 EUR",
      period: "/month",
      buttonText: "Get Silver",
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
      description: "Boost your creativity with full access to all video, image, and audio AI models",
      price: "21 EUR",
      originalPrice: "34 EUR",
      period: "/month",
      buttonText: "Get Gold",
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
  ]);

  const [isPreview, setIsPreview] = useState(false);

  const updatePlan = (planIndex, field, value) => {
    const updatedPlans = [...plans];
    if (field === "badge" && value === "") {
      delete updatedPlans[planIndex].badge;
    } else {
      updatedPlans[planIndex][field] = value;
    }
    setPlans(updatedPlans);
  };

  const updateFeatureTitle = (planIndex, featureIndex, title) => {
    const updatedPlans = [...plans];
    updatedPlans[planIndex].features[featureIndex].title = title;
    setPlans(updatedPlans);
  };

  const updateFeatureItem = (planIndex, featureIndex, itemIndex, item) => {
    const updatedPlans = [...plans];
    updatedPlans[planIndex].features[featureIndex].items[itemIndex] = item;
    setPlans(updatedPlans);
  };

  const addFeatureItem = (planIndex, featureIndex) => {
    const updatedPlans = [...plans];
    updatedPlans[planIndex].features[featureIndex].items.push("");
    setPlans(updatedPlans);
  };

  const removeFeatureItem = (planIndex, featureIndex, itemIndex) => {
    const updatedPlans = [...plans];
    updatedPlans[planIndex].features[featureIndex].items.splice(itemIndex, 1);
    setPlans(updatedPlans);
  };

  const addFeatureSection = (planIndex) => {
    const updatedPlans = [...plans];
    updatedPlans[planIndex].features.push({ title: "", items: [""] });
    setPlans(updatedPlans);
  };

  const removeFeatureSection = (planIndex, featureIndex) => {
    const updatedPlans = [...plans];
    updatedPlans[planIndex].features.splice(featureIndex, 1);
    setPlans(updatedPlans);
  };

  const savePlans = () => {
    console.log("Saving plans:", plans);
    alert("Plans saved successfully!");
  };

  if (isPreview) {
    return (
      <div className="w-full lg:max-w-[90%] mt-8 mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Preview Mode</h1>
          <Button onClick={() => setIsPreview(false)} variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Back to Edit
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <Card key={index} className="relative flex flex-col h-full border-2">
              {plan.badge && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-100 text-blue-800">
                  {plan.badge}
                </Badge>
              )}
              <CardHeader className="pb-4 text-center">
                <CardTitle className="text-xl font-semibold">{plan.name}</CardTitle>
                <CardDescription className="text-sm text-gray-600">{plan.description}</CardDescription>
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
                      <ul className="space-y-2">
                        {section.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2 text-sm">
                            <span className="text-blue-600 mt-1">✓</span>
                            <span className="text-gray-700">{item}</span>
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
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Pricing Plans</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsPreview(true)} variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={savePlans} className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((plan, planIndex) => (
          <Card key={planIndex} className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor={`name-${planIndex}`}>Plan Name</Label>
                <Input
                  id={`name-${planIndex}`}
                  value={plan.name}
                  onChange={(e) => updatePlan(planIndex, "name", e.target.value)}
                  placeholder="Plan name"
                />
              </div>

              <div>
                <Label htmlFor={`description-${planIndex}`}>Description</Label>
                <Textarea
                  id={`description-${planIndex}`}
                  value={plan.description}
                  onChange={(e) => updatePlan(planIndex, "description", e.target.value)}
                  placeholder="Plan description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor={`price-${planIndex}`}>Price</Label>
                  <Input
                    id={`price-${planIndex}`}
                    value={plan.price}
                    onChange={(e) => updatePlan(planIndex, "price", e.target.value)}
                    placeholder="Price"
                  />
                </div>
                <div>
                  <Label htmlFor={`originalPrice-${planIndex}`}>Original Price</Label>
                  <Input
                    id={`originalPrice-${planIndex}`}
                    value={plan.originalPrice}
                    onChange={(e) => updatePlan(planIndex, "originalPrice", e.target.value)}
                    placeholder="Original price"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor={`period-${planIndex}`}>Period</Label>
                  <Input
                    id={`period-${planIndex}`}
                    value={plan.period}
                    onChange={(e) => updatePlan(planIndex, "period", e.target.value)}
                    placeholder="/month"
                  />
                </div>
                <div>
                  <Label htmlFor={`buttonText-${planIndex}`}>Button Text</Label>
                  <Input
                    id={`buttonText-${planIndex}`}
                    value={plan.buttonText}
                    onChange={(e) => updatePlan(planIndex, "buttonText", e.target.value)}
                    placeholder="Button text"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor={`badge-${planIndex}`}>Badge (Optional)</Label>
                <Input
                  id={`badge-${planIndex}`}
                  value={plan.badge || ""}
                  onChange={(e) => updatePlan(planIndex, "badge", e.target.value)}
                  placeholder="Best value"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">Features</Label>
                  <Button onClick={() => addFeatureSection(planIndex)} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Section
                  </Button>
                </div>

                {plan.features.map((feature, featureIndex) => (
                  <Card key={featureIndex} className="p-4 bg-gray-50">
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          value={feature.title}
                          onChange={(e) => updateFeatureTitle(planIndex, featureIndex, e.target.value)}
                          placeholder="Feature section title"
                          className="flex-1"
                        />
                        <Button
                          onClick={() => removeFeatureSection(planIndex, featureIndex)}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {feature.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex gap-2">
                            <Textarea
                              value={item}
                              onChange={(e) => updateFeatureItem(planIndex, featureIndex, itemIndex, e.target.value)}
                              placeholder="Feature item"
                              className="flex-1"
                              rows={2}
                            />
                            <Button
                              onClick={() => removeFeatureItem(planIndex, featureIndex, itemIndex)}
                              size="sm"
                              variant="destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          onClick={() => addFeatureItem(planIndex, featureIndex)}
                          size="sm"
                          variant="outline"
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Feature Item
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
