"use client";
import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

// Helper: Convert ISO date to "x minutes ago" etc.
function getTimeAgo(isoDate) {
  if (!isoDate) return "";
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30); // Approximate
  const diffYear = Math.floor(diffDay / 365); // Approximate

  if (diffMin < 1) return "just now";
  if (diffMin === 1) return "1 minute ago";
  if (diffMin < 60) return `${diffMin} minutes ago`;
  if (diffHr === 1) return "1 hour ago";
  if (diffHr < 24) return `${diffHr} hours ago`;
  if (diffDay === 1) return "1 day ago";
  if (diffDay < 7) return `${diffDay} days ago`;
  if (diffWeek === 1) return "1 week ago";
  if (diffWeek < 4) return `${diffWeek} weeks ago`;
  if (diffMonth === 1) return "1 month ago";
  if (diffMonth < 12) return `${diffMonth} months ago`;
  if (diffYear === 1) return "1 year ago";
  return `${diffYear} years ago`;
}

// NotificationBell: শুধুমাত্র ড্রপডাউন/প্যানেল দেখাবে, স্টেট ও ইভেন্ট parent (Navbar) থেকে নেবে
export default function NotificationBell({
  open,
  setOpen,
  notifications,
  hasMore,
  loading,
  onLoadMore,
  onClose,
  panelRef,
}) {
  // ইনফিনিটি স্ক্রল
  useEffect(() => {
    if (!open) return;
    const listDiv = panelRef?.current;
    if (!listDiv) return;
    const handleScroll = () => {
      if (
        listDiv.scrollTop + listDiv.clientHeight >= listDiv.scrollHeight - 10 &&
        hasMore &&
        !loading
      ) {
        onLoadMore?.();
      }
    };
    listDiv.addEventListener("scroll", handleScroll);
    return () => listDiv.removeEventListener("scroll", handleScroll);
  }, [open, hasMore, loading, notifications, onLoadMore, panelRef]);

  return (
    open && (
      <div
        className="fixed inset-0 flex justify-end items-stretch z-[3000]"
        style={{ pointerEvents: open ? "auto" : "none" }}
      >
        {/* Overlay */}
        <div
          className={`bg-black/30 w-full h-full transition-opacity duration-700`}
          style={{ opacity: open ? 1 : 0 }}
          onClick={onClose}
        />
        {/* Panel */}
        <div
          className={`
            fixed top-0 right-0 h-full max-h-screen w-full sm:w-[480px] bg-white shadow-2xl z-[3100]
            flex flex-col
            transition-all
            duration-[2000ms]
            ease-in-out
            ${open ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
          `}
          // রাউন্ডেড বাদ, শুধু স্কয়ার কর্নার
          style={{
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            boxShadow: "0 0 50px 0 #0003",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-9 py-7 border-b text-black">
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold tracking-wide">Notifications</span>
              <span className="text-xs text-black/80">{notifications.length} total</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition"
              aria-label="Close notification panel"
            >
              <X className="w-7 h-7" />
            </button>
          </div>
          {/* Content */}
          <ul
            ref={panelRef}
            className="flex-1 overflow-y-auto py-5 px-6"
            style={{ minHeight: "180px" }}
          >
            {notifications.length === 0 && !loading ? (
              <li className="py-10 text-gray-400 text-center text-lg">
                No notifications!
              </li>
            ) : (
              notifications.map((n) => (
                <li
                  key={n.id || n._id}
                  className={`
                    mb-3 last:mb-0 p-5 border border-gray-100 shadow-sm bg-white
                    flex items-start gap-3
                    animate-fadein
                  `}
                >
                  <div className="flex-1">
                    <div className="text-gray-900 text-[16.5px] font-medium mb-1">{n.title}</div>
                    <div className="text-xs text-gray-400">
                      {getTimeAgo(n.time)}
                    </div>
                  </div>
                </li>
              ))
            )}
            {/* Loader */}
            {loading && (
              <li className="flex justify-center items-center py-6">
                <span className="animate-spin inline-block w-7 h-7 border-2 border-red-500 border-t-transparent rounded" />
              </li>
            )}
            {!hasMore && notifications.length > 0 && (
              <li className="text-center text-xs text-gray-400 py-2">
                No more notifications
              </li>
            )}
          </ul>
        </div>
        <style jsx>{`
          .animate-fadein {
            animation: fadeinNotif 0.6s;
          }
          @keyframes fadeinNotif {
            from { opacity: 0; transform: translateY(30px);}
            to { opacity: 1; transform: translateY(0);}
          }
        `}</style>
      </div>
    )
  );
}