import React from 'react'
import not from '../../public/not.png'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '../components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Brand Logo - Top Right */}
        

        {/* Main 404 Illustration */}
        <div className="mb-12">
          <Image
            src={not}
            alt="404 Error Illustration"
            width={600}
            height={400}
            className="mx-auto"
            priority
          />
        </div>

        {/* Error Content */}
       

        {/* Go Back Home Button */}
        <div className="mb-8">
          <Link href="/">
            <Button
              size="lg"
              className="bg-red-500 hover:bg-red-600 text-white px-12 py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
            >
              
              Go Back Home
            </Button>
          </Link>
        </div>

        {/* Additional Navigation */}
        {/* <div className="text-gray-500">
          <p className="mb-4">Or try one of these:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/" className="text-red-500 hover:text-red-600 underline">
              Homepage
            </Link>
            <Link href="/about" className="text-red-500 hover:text-red-600 underline">
              About Us
            </Link>
            <Link href="/contact" className="text-red-500 hover:text-red-600 underline">
              Contact
            </Link>
            <Link href="/help" className="text-red-500 hover:text-red-600 underline">
              Help Center
            </Link>
          </div>
        </div> */}
      </div>
    </div>
  )
}
