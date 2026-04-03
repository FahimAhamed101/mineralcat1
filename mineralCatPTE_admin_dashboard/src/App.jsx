import { FaRegBell } from 'react-icons/fa'
import './App.css'
import Menu from './pages/dashboard/menu/Menu'
import dummyPhoto from '/user.svg'
import { Outlet, useNavigate } from 'react-router'
import { useGetLoggedInUser } from './lib/logIn/useGetLoggedInUser'
import { useQuery } from '@tanstack/react-query'
import { useState } from "react"
import fetchWithAuth from './utils/fetchWithAuth'

// Utility: human readable time ago
function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  const months = Math.floor(weeks / 4);
  return `${months} month${months > 1 ? "s" : ""} ago`;
}

function NotificationModal({ open, onClose, notifications, unseenCount }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={onClose}
      ></div>
      {/* Modal */}
      <div className="relative z-50 h-full w-full sm:w-[400px] max-w-[90vw] bg-white shadow-lg flex flex-col"
        style={{
          animation: "slideInRight 0.3s",
          maxHeight: "100vh",
        }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="text-lg font-bold text-[#8B0000]">Notifications</div>
          <button
            onClick={onClose}
            className="text-gray-400 text-2xl hover:text-gray-800"
          >
            &times;
          </button>
        </div>
        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 py-3">
          {notifications?.length === 0 && (
            <div className="text-gray-500 text-center py-12">No notifications found.</div>
          )}
          {notifications?.map((item) => (
            <div key={item._id} className="mb-5 pb-2 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="font-medium text-gray-900">{item.title}</div>
                <span className="text-xs text-gray-400">{timeAgo(item.time)}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {item.targetSubscription && (
                  <span className="bg-[#d7b0b0] text-[#8B0000] px-2 py-0.5 rounded-full">{item.targetSubscription}</span>
                )}
                {item.seen === false && (
                  <span className="ml-2 text-yellow-500">unseen</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes slideInRight {
          0% { transform: translateX(100%);}
          100% { transform: translateX(0);}
        }
      `}</style>
    </div>
  );
}

function App() {
  const { data: user, isLoading, isError, error } = useGetLoggedInUser();
  const navigate = useNavigate();
  const basUrl = import.meta.env.VITE_ADMIN_URL;
  
  const [modalOpen, setModalOpen] = useState(false);

  // Notifications Query
  const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetchWithAuth(`${basUrl}/user/notification`);
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    }
  });

  // Unseen Count Query
  const { data: unseenCountData, isLoading: unseenCountLoading } = useQuery({
    queryKey: ["unseenCount"],
    queryFn: async () => {
      const res = await fetchWithAuth(`${basUrl}/user/get-unseen-notification-count`);
      if (!res.ok) throw new Error("Failed to fetch unseen count");
      return res.json();
    }
  });

  // Notification list and unseen count
  const notifications = notificationsData?.data ?? [];
  const unseenCount = unseenCountData?.unseenCount ?? 0;

  return (
    <>
      {/* menu */}
      <section className='grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-4 p-4'>
        <div className='col-span-1 md:col-span-4 lg:col-span-2 min-h-[95vh] bg-gradient-to-r from-[#7D0000] to-[#973333] p-4 rounded-lg'>
          <Menu />
        </div>

        {/* content */}
        <div className='col-span-1 md:col-span-8 lg:col-span-10 bg-white rounded-lg '>
          {/* header */}
          <header className='flex justify-between items-center mb-4 bg-[#D7B0B0] text-white p-4 rounded-lg'>
            <h1 className='text-2xl font-bold text-[#8B0000]'>Welcome back!</h1>
            <div className='flex items-center justify-center gap-x-5'>
              <button
                className='relative text-[#8B0000] text-2xl bg-white rounded-full flex items-center p-4'
                onClick={() => setModalOpen(true)}
              >
                <FaRegBell />
                {unseenCountLoading ? null : (
                  <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {unseenCount}
                  </span>
                )}
                {/* notification bell */}
              </button>

              <button onClick={() => navigate("/settings/profile")} className='bg-[#8B0000] text-white rounded-full flex items-center'>
                <img src={user?.user?.profile || dummyPhoto} alt="user" className='w-[50px] object-fill h-[50px] rounded-full' />
              </button>
            </div>
          </header>
          {/* main section */}
          <main className='overflow-y-auto p-4 '>
            <Outlet />
          </main>
        </div>
      </section>
      {/* Notification Modal */}
      <NotificationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        notifications={notifications}
        unseenCount={unseenCount}
      />
    </>
  )
}

export default App