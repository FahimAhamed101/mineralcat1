import Image from "next/image"
import computer from '@/../public/computer.png'
export default function Platform() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Our platform <span className="text-red-600">offers</span>
          </h2>
          <p className="text-xl text-gray-600 font-medium">Preparing for the Pearson Test of English (PTE)?</p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              {/* Full-length Mock Tests */}
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-red-600 rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 className="text-2xl font-bold text-red-600 mb-4">Full-length Mock Tests</h3>
                  <div className="space-y-3 text-gray-700">
                    <p className="text-lg">AI Scoring & Instant Feedback</p>
                    <p className="text-lg">Personalized Progress Tracking</p>
                    <p className="text-lg">Practice for All Sections</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex flex-col items-center">
            {/* Image Container with Border */}
            <div className="relative w-full max-w-md">
              <div className="border-4 border-red-200 rounded-2xl p-4 bg-white shadow-lg">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                  <Image
                    src={computer}
                    alt="Student using laptop for PTE preparation"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-center mt-6 max-w-sm leading-relaxed">
              Simulate real exam conditions with AI-evaluated tests to build confidence and accuracy.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
