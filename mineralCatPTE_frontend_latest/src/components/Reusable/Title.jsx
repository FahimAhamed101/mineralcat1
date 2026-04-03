import React from 'react'

export default function Title({ heading, subheading, pragraph }) {
  return (
    <div>
      <h1 className="lg:text-[64px] text-[30px] text-[#7D0000] font-bold text-center">{heading}</h1>
      <h2 className="lg:text-[64px] text-[30px] text-center text-black">{subheading}</h2>
      <p className="text-center lg:text-[32px] text-[18px] text-gray-500">{pragraph}</p>
    </div>
  )
}