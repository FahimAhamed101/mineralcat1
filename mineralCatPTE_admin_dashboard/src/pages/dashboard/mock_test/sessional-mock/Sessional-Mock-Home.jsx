import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SessionalMockHome() {
  const navigate = useNavigate();

  const handleSectionClick = (section) => {
    navigate(`/mock/${section.toLowerCase()}-tests`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start pt-12 px-4">
      {/* Main Title */}
      <h1 className="text-3xl font-bold text-[#333333] mb-12 text-center">
        Sectional mock~Test
      </h1>
      
      {/* Test Sections Grid */}
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Speaking - Blue */}
        <div 
          className="bg-[#3498db] rounded-xl p-8 text-white text-center shadow-md hover:shadow-lg transition-all cursor-pointer"
          onClick={() => handleSectionClick('Speaking')}
        >
          <h2 className="text-2xl font-bold mb-2">Speaking</h2>
          {/* <p className="text-xl">23 Mock~Test</p> */}
        </div>
        
        {/* Reading - Green */}
        <div 
          className="bg-[#2ecc71] rounded-xl p-8 text-white text-center shadow-md hover:shadow-lg transition-all cursor-pointer"
          onClick={() => handleSectionClick('Reading')}
        >
          <h2 className="text-2xl font-bold mb-2">Reading</h2>
          {/* <p className="text-xl">23 Mock~Test</p> */}
        </div>
        
        {/* Writing - Red */}
        <div 
          className="bg-[#e74c3c] rounded-xl p-8 text-white text-center shadow-md hover:shadow-lg transition-all cursor-pointer"
          onClick={() => handleSectionClick('Writing')}
        >
          <h2 className="text-2xl font-bold mb-2">Writing</h2>
          {/* <p className="text-xl">23 Mock~Test</p> */}
        </div>
        
        {/* Listening - Purple */}
        <div 
          className="bg-[#9b59b6] rounded-xl p-8 text-white text-center shadow-md hover:shadow-lg transition-all cursor-pointer"
          onClick={() => handleSectionClick('Listening')}
        >
          <h2 className="text-2xl font-bold mb-2">Listening</h2>
          {/* <p className="text-xl">23 Mock~Test</p> */}
        </div>
      </div>
    </div>
  );
}