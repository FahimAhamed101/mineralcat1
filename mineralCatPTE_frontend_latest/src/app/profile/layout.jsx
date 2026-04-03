"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image';
import icon from '../../../public/profile-icon.png'
import Link from 'next/link';
import { usePathname } from "next/navigation";
import { IoIosArrowDown } from "react-icons/io";
import { MdKeyboardArrowRight } from "react-icons/md";

const Layout = ({ children }) => {
  const pathname = usePathname();
  const lastSegment = pathname.split("/").filter(Boolean).pop();
  const [loading, setLoading] = useState(false)
  const [bar, setBar] = useState(false);
  const [name, setName] = useState("Profile");
  const baseUrl = process.env.NEXT_PUBLIC_URL;

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      const nameMap = {
        "my-profile": "Profile",
        "plan-info": "Plan Info",
        "payment-history": "Payment History",
        "notifications": "Notification",
      };

      if (lastSegment && nameMap[lastSegment]) {
        setName(nameMap[lastSegment]);
      } else {
        setName("Profile"); // Default fallback
      }

      setLoading(false);
    }, 900);

    return () => clearTimeout(timer);
  }, [lastSegment]);

  async function logout() {
    const accessToken = localStorage.getItem('accessToken');

    try {
      await fetch(`${baseUrl}/user/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/';
    }
  }

  if (loading) {
    return (
      <div className="flex w-full justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#810000]"></div>
      </div>
    );
  }

  return (
    <div>
      {loading ?
        (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#810000]"></div>
          </div>
        ) : (
          <div className='mx-10  md:mx-80 mt-5 md:mt-15'>
            <div>
              <div className='flex relative mt-10 gap-2 mb-2' onClick={() => setBar(!bar)}>
                <Image src={icon} alt='' />
                <h1 className={`text-[#D80000] font-medium text-2xl md:text-3xl`}>{name}</h1>
                <div className={`${bar === false ? "hidden" : "block"} md:hidden grid gap-5 bg-white shadow-2xl border-2 border-[#EF0000] w-full absolute top-10 z-20 p-5 rounded `}>
                  <Link className={`${lastSegment === "my-profile" ? "text-[#EF0000]" : ""}`} href="/profile">My Profile</Link>
                  <Link className={`${lastSegment === "plan-info" ? "text-[#EF0000]" : ""}`} href="/profile/plan-info">Plan Info</Link>
                  <Link className={`${lastSegment === "payment-history" ? "text-[#EF0000]" : ""}`} href="/profile/payment-history">Payment History</Link>
                  <Link className={`${lastSegment === "notifications" ? "text-[#EF0000]" : ""}`} href="/profile/notifications">Notification   </Link>
                </div>
                <div className='flex items-center justify-center md:hidden'>
                  {
                    (bar ? <IoIosArrowDown size={32} /> : <MdKeyboardArrowRight size={32} />)
                  }
                </div>
              </div>
              <div className='border-b-3 border-b-[#D80000]'></div>
            </div>
            <div className='flex'>
              <div className='hidden md:grid gap-8 p-10 pt-6 text-2xl font-medium w-90 max-h-80'>
                <Link className={`${lastSegment === "profile" ? "text-[#EF0000]" : ""}`} href="/profile">My Profile</Link>
                <Link className={`${lastSegment === "plan-info" ? "text-[#EF0000]" : ""}`} href="/profile/plan-info">Plan Info</Link>
                <Link className={`${lastSegment === "payment-history" ? "text-[#EF0000]" : ""}`} href="/profile/payment-history">Payment History</Link>
                <Link className={`${lastSegment === "notifications" ? "text-[#EF0000]" : ""}`} href="/profile/notifications">Notification   </Link>
                <button onClick={logout} className='flex justify-start'>Log Out</button>
              </div>
              {children}
            </div>
          </div>
        )
      }
    </div>
  )
}

export default Layout