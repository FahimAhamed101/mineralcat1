import React, { useState, useEffect, useCallback } from "react";
import fetchWithAuth from "../../lib/fetchWithAuth";
import { Bell } from "lucide-react";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [readIds, setReadIds] = useState([]); // যারা রিড হয়েছে
  const [open, setOpen] = useState(false);

  // Bell এ ক্লিক করলে সব রিড ধরে রাখো
  const handleBellClick = () => {
    setReadIds((prev) => {
      const currentIds = notifications.map(n => n.id);
      // আগেরগুলো রেখে নতুনগুলো যোগ করো (unique)
      return Array.from(new Set([...prev, ...currentIds]));
    });
    setUnreadCount(0);
    setOpen(true);
    // fetchWithAuth("/api/notifications/mark-read", { method: "POST" });
  };

  // নতুন নোটিফিকেশন ফেচ
  const fetchNotifications = useCallback(async () => {
    const data = await fetchWithAuth("/api/notifications").then(res => res.json());
    setNotifications(data.notifications || []);
    // কেবল নতুন আইডি গুলো কাউন্ট হবে (যারা আগের readIds-এ নেই)
    const newUnread = (data.notifications || []).filter(n => !readIds.includes(n.id)).length;
    setUnreadCount(newUnread);
  }, [readIds]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <div className="relative">
      <button onClick={handleBellClick} className="relative p-2 rounded-full hover:bg-gray-100">
        <Bell className="w-7 h-7 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-lg z-50 border max-h-96 overflow-y-auto">
          <div className="p-4 border-b flex items-center justify-between">
            <span className="font-semibold text-gray-700">Notifications</span>
            <span className="text-xs text-gray-400">{notifications.length} total</span>
          </div>
          <ul>
            {notifications.length === 0 ? (
              <li className="p-5 text-gray-400 text-center">No notifications</li>
            ) : (
              notifications.map((n) => (
                <li key={n.id} className={`${!n.read ? "bg-red-50" : ""} px-5 py-3 border-b last:border-b-0`}>
                  <div className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${!n.read ? "bg-red-500" : "bg-gray-300"}`} />
                    <div>
                      <p className="text-gray-800 text-sm">{n.message}</p>
                      <span className="text-xs text-gray-400">{n.timeAgo}</span>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}