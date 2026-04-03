"use client";
import React from 'react'
import LogoImage from "../../../public/logo.png";
import Image from "next/image";

export default function Logo() {
  return (
    <div className="w-full max-w-[226px] h-auto">
      <Image
        src={LogoImage}
        alt="MineralCat Logo"
        className="w-full h-auto rounded-full object-cover"
        width={226}
        height={65}
        priority
        sizes="(max-width: 640px) 180px, 226px"
      />
    </div>
  )
}