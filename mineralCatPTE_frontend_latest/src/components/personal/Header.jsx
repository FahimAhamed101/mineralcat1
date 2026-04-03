"use client";
import { useState } from "react";

import { RxHamburgerMenu } from "react-icons/rx";
import MobileMenu from './MobileMenu';

// Remove TypeScript type annotation, use JS props instead
export default function Header({ setIsOpen, isOpen }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      {/* ...other header content */}
      <button
        className="text-[30px] font-[700] ml-4  p-8 text-gray-600 px-4 py-2 rounded w-[58px] h-[58px] flex items-center justify-center hover:bg-gradient-to-r transition-all duration-300"
        onClick={() => setMenuOpen(true)}
      >
        {/* mobile menu icon */}
        <RxHamburgerMenu />
      </button>
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
      />
    </div>
  );
}