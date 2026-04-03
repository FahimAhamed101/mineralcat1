"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, AlignJustify, X, Crown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import useLoggedInUser from "@/lib/useGetLoggedInUser";
import fetchWithAuth from "@/lib/fetchWithAuth";
import NotificationBell from "@/app/notifications/page";
import { User } from "./User";
import LanguageSkills from "./LanguageSkills";
import logo from "@public/header/logo.png";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

const navItems = [
  { label: "Home", href: "/", hideWhenAuth: true },
  { label: "Features", href: "/features", hideWhenAuth: true },
  { label: "Practice", type: "practice", authOnly: true },
  { label: "Mock Test", href: "/mock-test", authOnly: true },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact Us", href: "/contact-us" },
];

const PAGE_SIZE = 10;

export default function Navbar() {
  const { user, loading, error } = useLoggedInUser();
  const showDashboard = Boolean(user?.user);
  const menuItems = navItems.filter((item) => {
    if (showDashboard && item.hideWhenAuth) {
      return false;
    }
    if (!showDashboard && item.authOnly) {
      return false;
    }
    return true;
  });
  const finalMenuItems = showDashboard
    ? [{ label: "Dashboard", href: "/dashboard" }, ...menuItems]
    : menuItems;
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [notifLoading, setNotifLoading] = useState(false);
  const panelRef = useRef(null);
  const baseUrl = process.env.NEXT_PUBLIC_URL || "";
  const router = useRouter();

  const gradientStyle = {
    background: "linear-gradient(90deg, #EF5634, #5A0000)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    transition: "color 0.3s ease-in-out",
    fontWeight: "bold",
  };

  const normalStyle = {
    color: "#565E6C",
    fontWeight: "bold",
  };

  const handlePracticeClick = () => {
    setPracticeOpen(true);
  };

  const coachingUnlimited =
    user?.user?.userSubscription?.coachingUnlimited === true;
  const coachingDays = Number(user?.user?.userSubscription?.coachingDays || 0);
  const canAccessCoaching = !loading && (coachingUnlimited || coachingDays >= 1);

  const handleCoachingClick = (event) => {
    if (canAccessCoaching) {
      return;
    }

    if (event?.preventDefault) {
      event.preventDefault();
    }

    toast.info("Buy a coaching Plan", { toastId: "coaching-plan-gate" });
  };

  const loadNotifications = useCallback(
    async (initial = false) => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!accessToken || !refreshToken) {
        return;
      }

      try {
        const currentPage = initial ? 1 : page;
        const response = await fetchWithAuth(
          `${baseUrl}/user/notification?page=${currentPage}&limit=${PAGE_SIZE}`
        );
        const data = await response.json();
        const fetched = Array.isArray(data.data) ? data.data : [];

        setHasMore(fetched.length === PAGE_SIZE);

        if (initial) {
          setNotifications(fetched);
          setPage(1);
          setUnreadCount(fetched.unseenCount || 0);
        } else {
          setNotifications((prev) => [...prev, ...fetched]);
        }
      } catch {
        if (initial) {
          setNotifications([]);
          setUnreadCount(0);
          setHasMore(false);
        }
      }
    },
    [page, baseUrl]
  );

  useEffect(() => {
    if (!user) return;
    loadNotifications(true);
    const interval = setInterval(() => loadNotifications(true), 30000);
    return () => clearInterval(interval);
  }, [user, loadNotifications]);

  const loadMore = async () => {
    if (!hasMore || notifLoading) return;
    setNotifLoading(true);
    setTimeout(async () => {
      try {
        const nextPage = page + 1;
        const response = await fetchWithAuth(
          `${baseUrl}/user/notification?page=${nextPage}&limit=${PAGE_SIZE}`
        );
        const data = await response.json();
        const fetched = Array.isArray(data.data) ? data.data : [];
        setHasMore(fetched.length === PAGE_SIZE);
        setNotifications((prev) => [...prev, ...fetched]);
        setPage(nextPage);
      } catch {
        setHasMore(false);
      }
      setNotifLoading(false);
    }, 800);
  };

  const handleNotifClick = () => {
    setNotifOpen(true);
    setUnreadCount(0);
  };
  const handleNotifClose = () => setNotifOpen(false);
  console.log("useLoggedInUser", useLoggedInUser);

  return (
    <>
      <ToastContainer position="top-center" autoClose={4000} />
      <div className="container relative lg:mx-auto bg-white z-10 flex items-center justify-between pt-3 px-4 md:px-0">
        <Link href="/">
          <Image src={logo} width={200} height={100} alt="MineralCat PTE" />
        </Link>
        <button
          onClick={() => setOpenMenu(!openMenu)}
          className="lg:hidden mr-4 cursor-pointer"
          aria-label="Toggle menu"
        >
          <AlignJustify />
        </button>

        <div className="p-px hidden lg:block bg-linear-to-r from-[#5A0000] to-[#EF5634] rounded-lg shadow-[0_10px_20px_-12px_rgba(0,0,0,0.60)]">
          <div className="flex gap-10 items-center bg-white p-4 rounded-lg px-10">
            <div className="flex gap-10 items-center">
              {finalMenuItems.map((item, index) => {
                if (item.type === "practice") {
                  return (
                    <button
                      key={item.label}
                      type="button"
                      className="text-[18px] cursor-pointer transition-colors duration-500 ease-in-out flex items-center gap-2"
                      style={
                        hoveredIndex === index ? gradientStyle : normalStyle
                      }
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={handlePracticeClick}
                    >
                      {item.label}
                      <span className="text-[16px]">&#9662;</span>
                    </button>
                  );
                }

                if (item.type === "coaching") {
                  return (
                    <Link
                      key={item.label}
                      href="/coaching"
                      className="text-[18px] cursor-pointer transition-colors duration-500 ease-in-out"
                      style={hoveredIndex === index ? gradientStyle : normalStyle}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={handleCoachingClick}
                    >
                      {item.label}
                    </Link>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-[18px] cursor-pointer transition-colors duration-500 ease-in-out"
                    style={hoveredIndex === index ? gradientStyle : normalStyle}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {!user && (
              <div className="flex items-center justify-center gap-4">
                <Link
                  href="/auth/sign-up"
                  className="cursor-pointer bg-linear-to-r from-[#EF5634] to-[#5A0000] text-white px-8 py-2 rounded-lg"
                >
                  Sign up
                </Link>
                <Link
                  href="/auth/login"
                  className="flex bg-[#F3F4F6] px-8 py-2 rounded-lg items-center justify-center gap-1 cursor-pointer transition-colors duration-300 hover:text-[#EF5634]"
                >
                  Login <ArrowRight size={18} />
                </Link>
              </div>
            )}

            {user && !loading && (
              <div className="flex items-center gap-4">
                <div
                  className="relative text-[#7D0000] text-[28px] cursor-pointer"
                  onClick={handleNotifClick}
                >
                  <span
                    className={`absolute -top-2 -right-2 bg-[#7D0000] text-white text-xs font-bold rounded-full p-1 w-5 h-5 ${
                      unreadCount === 0 ? "hidden" : ""
                    }`}
                  >
                    {unreadCount}
                  </span>
                  <IoNotificationsOutline />
                </div>
                <NotificationBell
                  open={notifOpen}
                  setOpen={setNotifOpen}
                  notifications={notifications}
                  hasMore={hasMore}
                  loading={notifLoading}
                  onLoadMore={loadMore}
                  onClose={handleNotifClose}
                  panelRef={panelRef}
                  renderItem={(notification) => (
                    <div className="px-4 py-2 border-b border-gray-100 text-gray-900 text-sm">
                      {notification}
                    </div>
                  )}
                />
                <div className="relative">
                  <User user={user} loading={loading} error={error} />
                  <div className="absolute right-20 top-10 bg-yellow-500 flex items-center gap-x-1 text-white p-0.5 text-[12px] rounded">
                    <Crown className="w-[18px] h-auto" />
                    <span>{user.user.userSubscription.credits}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden ${
            openMenu ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setOpenMenu(false)}
        ></div>

        <div
          className={`fixed top-0 right-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
            openMenu ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-6 h-full flex flex-col">
            <div className="flex justify-end mb-8">
              <button
                onClick={() => setOpenMenu(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-6 flex-1">
              {finalMenuItems.map((item, index) => {
                if (item.type === "practice") {
                  return (
                    <button
                      key={item.label}
                      type="button"
                      className="text-[18px] cursor-pointer py-2 transition-colors duration-300 ease-in-out border-b border-gray-100 text-left"
                      style={
                        hoveredIndex === index ? gradientStyle : normalStyle
                      }
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={() => {
                        setOpenMenu(false);
                        handlePracticeClick();
                      }}
                    >
                      {item.label}
                    </button>
                  );
                }

                if (item.type === "coaching") {
                  return (
                    <Link
                      key={item.label}
                      href="/coaching"
                      className="text-[18px] cursor-pointer py-2 transition-colors duration-300 ease-in-out border-b border-gray-100 text-left"
                      style={hoveredIndex === index ? gradientStyle : normalStyle}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={(event) => {
                        handleCoachingClick(event);
                        setOpenMenu(false);
                      }}
                    >
                      {item.label}
                    </Link>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-[18px] cursor-pointer py-2 transition-colors duration-300 ease-in-out border-b border-gray-100"
                    style={hoveredIndex === index ? gradientStyle : normalStyle}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => setOpenMenu(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {!user && (
              <div className="flex flex-col gap-4 mt-8">
                <Link
                  href="/auth/sign-up"
                  className="cursor-pointer bg-linear-to-r from-[#EF5634] to-[#5A0000] text-white px-6 py-3 rounded-lg text-center transition-transform duration-200 hover:scale-105"
                  onClick={() => setOpenMenu(false)}
                >
                  Sign up
                </Link>
                <Link
                  href="/auth/login"
                  onClick={() => setOpenMenu(false)}
                  className="flex bg-[#F3F4F6] px-6 py-3 rounded-lg items-center justify-center gap-2 cursor-pointer transition-colors duration-300 hover:text-[#EF5634] text-center"
                >
                  Login <ArrowRight size={18} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <LanguageSkills isOpen={practiceOpen} setIsOpen={setPracticeOpen} />
    </>
  );
}
