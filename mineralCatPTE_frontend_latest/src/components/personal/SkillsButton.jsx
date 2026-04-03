"use client";
import { FaChevronDown } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SkillsButton({ isOpen, disabled, setIsOpen }) {

  const handleClick = (e) => {
    e.preventDefault(); // Prevent the default action of the button
    toast.info('Please upgrade your subscription to access the mock test!');
  };

  return (
    <div>
      <button
        disabled={disabled}
        onClick={(e) => {
          if (disabled) {
            handleClick(e); // Trigger the toast if the button is disabled
          } else {
            setIsOpen(!isOpen); // Toggle the dropdown if not disabled
          }
        }}
        className="text-[20px] cursor-pointer font-[400] text-gray-900 flex items-center gap-2"
      >
        Practice <FaChevronDown />
      </button>
      <ToastContainer />
    </div>
  );
}