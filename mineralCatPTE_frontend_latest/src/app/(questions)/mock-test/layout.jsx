"use client";

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

const Layout = ({
  children
}) => {
  const pathname = usePathname();
  
  // Routes that should not have the main layout
  const confirmPage = ['/mock-test/confirm-page'];
 
  const isConfirmScreenRoute = confirmPage.some(route => 
    pathname.startsWith(route)
  );

  const sectionalConfirmPage = ['/mock-test/sectional-mock-test/confirm-page'];
 
  const isSectionalConfirmPageConfirmScreenRoute = sectionalConfirmPage.some(route => 
    pathname.startsWith(route)
  );

  if (isSectionalConfirmPageConfirmScreenRoute) {
    return (
      <div>
         {children}
      </div>
    );
  }

  if (isConfirmScreenRoute) {
    return (
      <div>
         {children}
      </div>
    );
  }

    const [mockTest,setMockTest] = useState(true)
 
  return (
    <div className="mx-8 md:mx-80 mt-20">
        <div className='flex flex-col items-center justify-center text-center gap-8'>
            <div className='bg-[#7D0000] w-full text-white py-3 text-xl'>
            {
                mockTest ? "Full Mock Test" : "Sectional Mock Test"
            }
        </div>
        <div className=" flex gap-10 ">
           <Link href="/mock-test" className={` ${mockTest?"text-[#7D0000] border-b-2 border-[#7D0000]":"text-slate-400 border-b-2 border-slate-400"}`} onClick={()=>setMockTest(true)}>Full Mock Test</Link>
           <Link href="/mock-test/sectional-mock-test" className={` ${!mockTest?"text-[#7D0000] border-b-2 border-[#7D0000]":"text-slate-400 border-b-2 border-slate-400"}`} onClick={()=>setMockTest(false)}>Sectional Mock Test</Link>
        </div>
        </div>
      
      <div >{children}</div>
    </div>
  );
};

export default Layout;
