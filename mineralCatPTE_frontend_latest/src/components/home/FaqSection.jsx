"use client"

import { useState, useEffect } from "react"
import { Plus, Minus } from "lucide-react"
import Image from "next/image"
import woman from '@/../public/woman.png'

export default function FAQSection() {
  const [faqs, setFaqs] = useState([])
  const [expandedItem, setExpandedItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const baseUrl = process.env.NEXT_PUBLIC_URL || ""

  // Mock API data - replace with your actual API endpoint
  const fetchFAQs = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${baseUrl}/faqs/`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Map the API data to match our structure
      const mappedFaqs = data.map(
        (item, index) => ({
          id: item.id || index + 1,
          question: item.question || "",
          answer: item.answer || "",
        })
      )

      setFaqs(mappedFaqs)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching FAQs:", error)
      setLoading(false)
      setFaqs([])
    }
  }

  useEffect(() => {
    const fetchFAQsEffect = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${baseUrl}/faqs/`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        const mappedFaqs = data.map(
          (item, index) => ({
            id: item.id || index + 1,
            question: item.question || "",
            answer: item.answer || "",
          })
        )

        setFaqs(mappedFaqs)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching FAQs:", error)
        setLoading(false)
        setFaqs([])
      }
    }

    fetchFAQsEffect()
    const interval = setInterval(fetchFAQsEffect, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [baseUrl])

  const toggleExpanded = (id) => {
    setExpandedItem(expandedItem === id ? null : id)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading FAQs from API...</div>
        </div>
      </div>
    )
  }

  if (!loading && faqs.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 mb-4">No FAQs available at the moment.</div>
          <button
            onClick={fetchFAQs}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Frequently Asked <span className="text-red-600">Questions</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 font-medium">Quick answers for a smarter PTE journey!</p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* FAQ List */}
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-red-50 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md transform hover:scale-[1.02]"
              >
                <button
                  onClick={() => toggleExpanded(faq.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none transition-all duration-200 hover:bg-red-100"
                >
                  <span className="text-gray-800 font-medium text-base sm:text-lg pr-4 transition-colors duration-200">
                    {faq.question}
                  </span>
                  <div className="flex-shrink-0">
                    <div className="transition-transform duration-300 ease-in-out">
                      {expandedItem === faq.id ? (
                        <Minus className="w-5 h-5 text-gray-600 transform rotate-0 transition-transform duration-300" />
                      ) : (
                        <Plus className="w-5 h-5 text-gray-600 transform rotate-0 transition-transform duration-300" />
                      )}
                    </div>
                  </div>
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out ${
                    expandedItem === faq.id
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  } overflow-hidden`}
                >
                  <div className="px-6 pb-5">
                    <div className="pt-2 border-t border-red-100 transition-all duration-200">
                      <p className="text-gray-700 text-sm sm:text-base leading-relaxed transform transition-transform duration-300">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Illustration */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md lg:max-w-lg">
              <Image
                src={woman}
                alt="Woman thinking with question marks"
                width={400}
                height={300}
                className="w-[80%] h-auto object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}