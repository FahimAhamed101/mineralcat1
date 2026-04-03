import { useState } from "react";
import { X } from "lucide-react";
import { useGetAllCounts } from "../../../hooks/useGetAllCounts";
import { useDashboardData } from "../../../hooks/use-dashboard-data";
import dummyPhoto from "/user.svg";

export default function DashboardHome() {
  const baseUrl = import.meta.env.VITE_ADMIN_URL || "";
  const { recentUsers, isLoading, error } = useDashboardData(baseUrl);
  const { allDataCount, loading } = useGetAllCounts(baseUrl);

  const [viewUser, setViewUser] = useState(null); // মোডাল জন্য সিলেক্টেড ইউজার

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-error">
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={
            <div className="mask mask-squircle bg-red-100 p-3">
              {/* icon SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          }
          value={allDataCount?.userCount}
          label="Total User"
          bgColor="bg-red-50"
        />
        <StatCard
          icon={
            <div className="mask mask-squircle bg-red-100 p-3">
              {/* icon SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
          }
          value={allDataCount?.questionCount}
          label="Total Question"
          bgColor="bg-red-50"
        />
        <StatCard
          icon={
            <div className="mask mask-squircle bg-red-100 p-3">
              {/* icon SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
          }
          value={allDataCount?.mockTestCount}
          label="Total MockTest"
          bgColor="bg-red-50"
        />
      </div>

      {/* Recent Users List */}
      <div className="bg-red-800 text-white p-4 mb-2">
        <h2 className="text-xl font-bold">Recent Users List</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr className="bg-base-200">
              <th className="text-left">SI NO.</th>
              <th className="text-left">Name</th>
              <th className="text-left">Email</th>
              <th className="text-left">Joining Date</th>
              <th className="text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers?.map((user) => (
              <tr key={user?._id} className="my-12 mb-3.5 border-b-2">
                <td>
                  {typeof user._id === "number"
                    ? String(user._id).padStart(6, "0")
                    : user._id.substring(0, 6)}
                </td>
                <td>{user?.name}</td>
                <td>{user?.email}</td>
                <td>{user?.joinedDate}</td>
                <td>
                  <button
                    className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-gray-300 transition-colors duration-200 bg-gray-700 text-white hover:bg-gray-800 p-3"
                    onClick={() => setViewUser(user)} // এখানে ক্লিক করলে মোডাল ওপেন হবে
                  >
                    See Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {viewUser && (
        <>
          {/* Blur Background */}
          <div className="fixed inset-0 backdrop-blur-sm bg-white/30 z-40"></div>

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200">
                <h2 className="text-gray-600 text-sm font-medium tracking-wide">
                  USER INFORMATION
                </h2>
                <button
                  onClick={() => setViewUser(null)}
                  className="text-red-500 hover:text-red-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="px-6 pb-6">
                {/* Profile Image */}
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 ">
                    (
                    <img
                      src={viewUser.photoUrl || dummyPhoto}
                      alt="Profile"
                      className="w-full h-full object-cover "
                      error={
                        <img
                          src={dummyPhoto}
                          alt="Default Profile"
                          className="w-full h-full object-cover"
                        />
                      }
                    />
                    )
                  </div>
                </div>

                {/* User Details Header */}
                <div className="text-center mb-6">
                  <p className="text-gray-500 text-sm mb-1">
                    See all details about
                  </p>
                  <h3 className="text-2xl font-semibold text-gray-800">
                    {viewUser.name}
                  </h3>
                </div>



                {/* User Information */}
                <div className="space-y-3 mb-8">
                  <div className="flex">
                    <span className="text-gray-600 w-28 text-sm">SI No.</span>
                    <span className="text-gray-600 mr-2">:</span>
                    <span className="text-gray-800 text-sm">
                      {typeof viewUser._id === "number"
                        ? String(viewUser._id).padStart(6, "0")
                        : viewUser._id.substring(0, 6)}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-28 text-sm">
                      User name
                    </span>
                    <span className="text-gray-600 mr-2">:</span>
                    <span className="text-gray-800 text-sm">
                      {viewUser.name}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-28 text-sm">Email</span>
                    <span className="text-gray-600 mr-2">:</span>
                    <span className="text-gray-800 text-sm">
                      {viewUser.email}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-28 text-sm">
                      Joining Date
                    </span>
                    <span className="text-gray-600 mr-2">:</span>
                    <span className="text-gray-800 text-sm">
                      {viewUser.joinedDate}
                    </span>
                  </div>
                </div>

                {/* Close Button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => setViewUser(null)}
                    className="bg-red-700 hover:bg-red-800 text-white px-12 py-2 rounded-full text-sm font-medium transition-colors"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// StatCard Component
function StatCard({ icon, value, label, bgColor }) {
  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body p-0 flex flex-row">
        <div className={`${bgColor} p-4 flex items-center justify-center`}>
          {icon}
        </div>
        <div className="p-4 flex-1">
          <h3 className="text-5xl font-bold text-gray-800">{value}</h3>
          <p className="text-lg text-red-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
