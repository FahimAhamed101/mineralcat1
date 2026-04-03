import React from 'react'

const PlanInfo = () => {
  return (
    <div className='grid mt-2 border-2 border-[#973333] rounded w-300'>
  <h1 className='bg-[#973333] text-white h-10 text-center p-1 flex items-center justify-center'>Premium Plan</h1>

  <div className='flex flex-col md:flex-row gap-5 w-full h-full p-4'>
    <div className='feature bg-[#F8F3E7] flex-1 flex flex-col'>
      <h1 className='bg-[#B47E00] text-white text-center p-2'>Feature</h1>
      <ul className='grid gap-4 p-4'>
        <li>5 Full Mock Tests</li>
        <li>100 AI credits/month —</li>
        <li>Commercial AI license for professionals</li>
        <li>Progress Tracking</li>
        
      </ul>
    </div>

    <div className='premium bg-[#F2E6E6] flex-1 flex flex-col'>
      <h1 className='bg-[#D30000] text-white text-center p-2'>Premium</h1>
      <ul className='grid gap-4 p-4'>
        <li>5 Full Mock Tests</li>
        <li>100 AI credits/month —</li>
        <li>Commercial AI license for professionals</li>
        <li>Progress Tracking</li>
      </ul>
    </div>

    <div className='free bg-[#F2EBE6] flex-1 flex flex-col'>
      <h1 className='bg-[#FC974F] text-white text-center p-2'>Free</h1>
      <ul className='grid gap-4 p-4'>
        <li>5 Full Mock Tests</li>
        <li>100 AI credits/month —</li>
        <li>Commercial AI license for professionals</li>
        <li>Progress Tracking</li>
      </ul>
    </div>
  </div>
</div>
  )
}

export default PlanInfo