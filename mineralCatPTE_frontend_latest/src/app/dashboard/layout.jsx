"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Info, Mail, Phone, ShoppingCart } from "lucide-react";
import useLoggedInUser from "@/lib/useGetLoggedInUser";

const Layout = ({ children }) => {
  const { user, loading } = useLoggedInUser();
  const userData = user?.user;
  const subscription = userData?.userSubscription;
  const [selectedDay, setSelectedDay] = useState(null);

  const [monthOffset, setMonthOffset] = useState(0);

  const calendar = useMemo(() => {
    const today = new Date();
    const viewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const year = viewDate.getFullYear();
    const monthIndex = viewDate.getMonth();
    const monthName = viewDate.toLocaleString("default", { month: "long" });
    const firstDay = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const totalCells = 42;

    const days = Array.from({ length: totalCells }, (_, i) => {
      const dayNumber = i - firstDay + 1;
      if (dayNumber < 1 || dayNumber > daysInMonth) return null;
      return dayNumber;
    });

    return { today, year, monthName, days };
  }, [monthOffset]);

  const credits = subscription?.credits ?? 0;
  const mockTests = subscription?.mockTestLimit ?? 0;
  const planType = subscription?.planType || "Free";
  const displayName = userData?.name || "Name";
  const email = userData?.email || "main@domain.com";
  const phone = userData?.phone || "(430) 065-7387";

  return (
    <div>
      <div className="mx-10 flex flex-col gap-5 md:mx-55 md:flex md:flex-row md:gap-5 mt-10 md:mt-15">
        <div className="md:w-1/4 flex flex-col gap-5">
          <div className="border-2 border-[#E7D7DA] rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="relative bg-[#FCEFF2] px-4 pt-6 pb-4 text-center">
              <div className="absolute -left-6 -top-6 h-16 w-16 rounded-full bg-[#F7D2A1]" />
              <div className="mx-auto h-20 w-20 rounded-full bg-[#E85C8A] flex items-center justify-center">
                {userData?.profile ? (
                  <Image
                    src={userData.profile}
                    alt={displayName}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <Image
                    src="/coaching/user.png"
                    alt="User"
                    width={40}
                    height={40}
                  />
                )}
              </div>
              <h3 className="mt-3 text-lg font-semibold text-[#1F2937]">
                {displayName}
              </h3>
            </div>

            <div className="px-4 py-4 text-sm text-[#4B5563]">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-[#4B5563]">Plan infos</span>
                <span className="text-[#9CA3AF]">"{planType}"</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-[#E53E3E]" />
                    <span>Credits</span>
                  </div>
                  <span className="rounded-full bg-[#FCEFF2] px-2 py-0.5 text-xs">
                    {credits}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-[#E53E3E]" />
                    <span>Mock tests</span>
                  </div>
                  <span className="rounded-full bg-[#FCEFF2] px-2 py-0.5 text-xs">
                    {mockTests}
                  </span>
                </div>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 text-[#E53E3E] font-medium"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Buy Credits and Mock test
                </Link>
              </div>
            </div>

            <div className="px-4 pb-5 text-sm text-[#4B5563]">
              <div className="font-semibold mb-3">General info</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[#E53E3E]">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </div>
                  <span className="text-[#E53E3E] truncate">{email}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[#E53E3E]">
                    <Phone className="h-4 w-4" />
                    <span>Phone number</span>
                  </div>
                  <span className="text-[#E53E3E]">{phone}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-2 border-[#E7D7DA] rounded-2xl bg-white px-4 py-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold tracking-wide text-[#6B7280]">
                {calendar.monthName.toUpperCase()}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="h-7 w-7 rounded-full border text-xs text-[#6B7280] hover:bg-[#FCEFF2]"
                  onClick={() => setMonthOffset((value) => value - 12)}
                  aria-label="Previous year"
                >
                  {"<<"}
                </button>
                <button
                  type="button"
                  className="h-7 w-7 rounded-full border text-xs text-[#6B7280] hover:bg-[#FCEFF2]"
                  onClick={() => setMonthOffset((value) => value - 1)}
                  aria-label="Previous month"
                >
                  {"<"}
                </button>
                <div className="rounded-full border px-3 py-1 text-xs text-[#6B7280]">
                  {calendar.year}
                </div>
                <button
                  type="button"
                  className="h-7 w-7 rounded-full border text-xs text-[#6B7280] hover:bg-[#FCEFF2]"
                  onClick={() => setMonthOffset((value) => value + 1)}
                  aria-label="Next month"
                >
                  {">"}
                </button>
                <button
                  type="button"
                  className="h-7 w-7 rounded-full border text-xs text-[#6B7280] hover:bg-[#FCEFF2]"
                  onClick={() => setMonthOffset((value) => value + 12)}
                  aria-label="Next year"
                >
                  {">>"}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 text-[10px] text-[#9CA3AF] mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-2 text-xs text-[#374151]">
              {calendar.days.map((day, idx) => {
                const isToday = day === calendar.today.getDate();
                const isSelected = day === selectedDay;
                return (
                  <div key={`${day}-${idx}`} className="text-center">
                    {day ? (
                      <button
                        type="button"
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full transition ${
                          isSelected
                            ? "bg-[#7D0000] text-white"
                            : isToday
                            ? "bg-[#E85C8A] text-white"
                            : "text-[#374151] hover:bg-[#FCEFF2]"
                        }`}
                        onClick={() => setSelectedDay(day)}
                        aria-label={`Select day ${day}`}
                      >
                        {day}
                      </button>
                    ) : (
                      <span className="inline-flex h-6 w-6" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {loading && (
            <div className="text-xs text-[#9CA3AF]">Loading profile...</div>
          )}
        </div>
        <div className="md:w-3/4">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
