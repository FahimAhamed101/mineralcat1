/* eslint-disable no-unused-vars */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { EnhancedUsersLoader } from "../../../components/public/enhanced-users-loader";
import { ChevronDown, ArrowUpRight } from "lucide-react";
import fetchWithAuth from "../../../utils/fetchWithAuth";
import CustomTabs from "./CustomTabs";

const ITEMS_PER_PAGE = 9;

const TABS = [
  { label: "Subscription Tiers", icon: <ArrowUpRight /> },
];

const packageConfig = {
  "Subscription Tiers": [
    {
      name: "Package Earnings",
      emoji: "📦",
      color: "bg-gradient-to-br from-gray-500 to-gray-700",
    },
    {
      name: "Bronze",
      emoji: "🟠",
      color: "bg-gradient-to-br from-orange-400 to-orange-600",
    },
    {
      name: "Silver",
      emoji: "🟢",
      color: "bg-gradient-to-br from-green-400 to-green-600",
    },
    {
      name: "Gold",
      emoji: "🟣",
      color: "bg-gradient-to-br from-purple-400 to-purple-600",
    },
  ],
};

const Earning = () => {
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState("Package Earnings");
  const [isPackageDropdownOpen, setIsPackageDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const activeTab = TABS[activeTabIdx].label;
  const baseUrl = import.meta.env.VITE_ADMIN_URL || "";

  // Fetch earnings data (dynamically using planType)
  const { data: earningsData, isLoading: earningsLoading } = useQuery({
    queryKey: ["earnings", activeTab, selectedPackage],
    queryFn: async () => {
      try {
        if (baseUrl) {
          // planType determined from selectedPackage (default gold if not found)
          let planType = selectedPackage.toLowerCase();
          if (planType === "package earnings") planType = "all";
          const response = await fetchWithAuth(
            `${baseUrl}/admin/earnings?planType=${planType}`
          );
          if (!response.ok) throw new Error("Failed to fetch earnings data");
          return response.json();
        }
      } catch (error) {
        console.log("Using default earnings data:", error.message);
      }
      // fallback format matching given structure (empty)
      return {
        totalUsers: 0,
        usersByPackage: {
          bronze: { total_user: 0, total_earning: 0 },
          silver: { total_user: 0, total_earning: 0 },
          gold: { total_user: 0, total_earning: 0 }
        },
        totalEarnings: 0,
        users: [],
      };
    },
  });

  // Prepare package stats/cards
  const currentPackages = packageConfig[activeTab] || [];
  const usersByPackage = earningsData?.usersByPackage || {};
  const totalEarnings = earningsData?.totalEarnings || 0;
  const allUsers = earningsData?.users || [];
  const totalUsers = earningsData?.totalUsers || 0;

  // Filter users by selected package
  let users;
  if (selectedPackage === "Package Earnings") {
    users = allUsers;
  } else {
    users = allUsers.filter(
      (user) =>
        user.package?.toLowerCase() === selectedPackage.toLowerCase()
    );
  }

  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = users.slice(startIndex, endIndex);

  const handlePackageSelect = (packageName) => {
    setSelectedPackage(packageName);
    setCurrentPage(1);
    setIsPackageDropdownOpen(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (earningsLoading) {
    return <EnhancedUsersLoader />;
  }

  return (
    <div className="overflow-y-hidden p-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* CustomTabs centered */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center justify-between w-full gap-6 shadow-sm rounded-xl p-4">
            <div>
              <CustomTabs
                tabs={TABS}
                active={activeTabIdx}
                onTabClick={(idx) => {
                  setActiveTabIdx(idx);
                  setSelectedPackage("Package Earnings");
                  setCurrentPage(1);
                  setIsPackageDropdownOpen(false);
                }}
              />
            </div>
            <div className="inline-flex items-center bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg">
              <span className="text-base font-medium mr-3"> Total Earning</span>
              <span className="text-xl font-bold">
                ${totalEarnings.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        {/* Header with Package Dropdown */}
        <div className="flex flex-wrap justify-between w-full flex-row-reverse items-center mb-8 gap-4">
          <div>
            <button
              onClick={() => setIsPackageDropdownOpen(!isPackageDropdownOpen)}
              className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-5 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              style={{ minWidth: 160 }}
            >
              {selectedPackage}
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  isPackageDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isPackageDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl z-20 animate-fadeIn">
                <div className="py-2">
                  {currentPackages.map((pkg) => (
                    <button
                      key={pkg.name}
                      onClick={() => handlePackageSelect(pkg.name)}
                      className={`w-full flex items-center gap-2 px-5 py-2 text-base font-medium transition-colors duration-150 ${
                        selectedPackage === pkg.name
                          ? `${pkg.color} text-white shadow font-bold`
                          : "text-gray-700 hover:bg-gray-100"
                      } rounded-lg`}
                    >
                      <span className="text-lg">{pkg.emoji}</span>
                      <span>{pkg.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Package Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-7 mb-12">
          {currentPackages.map((pkg) => {
            // stats from earningsData.usersByPackage
            let packageInfo;
            if (pkg.name === "Package Earnings") {
              packageInfo = { totalUsers, totalMoney: totalEarnings };
            } else {
              const key = pkg.name.toLowerCase();
              const info = usersByPackage[key] || { total_user: 0, total_earning: 0 };
              packageInfo = { totalUsers: info.total_user, totalMoney: info.total_earning };
            }
            const isSelected = selectedPackage === pkg.name;

            return (
              <div
                key={pkg.name}
                onClick={() => handlePackageSelect(pkg.name)}
                className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  isSelected ? "shadow-2xl scale-105" : "hover:shadow-lg"
                }`}
                style={{ minHeight: 155 }}
              >
                <div
                  className={`${pkg.color} text-white rounded-2xl p-7 shadow-lg h-full flex flex-col justify-between`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{pkg.emoji}</span>
                      <h3 className="text-xl font-bold tracking-wide">
                        {pkg.name}
                      </h3>
                    </div>
                    {isSelected && (
                      <div className="w-3 h-3 bg-white rounded-full ring-2 ring-offset-2 ring-white"></div>
                    )}
                  </div>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm opacity-90">Total Users:</span>
                      <span className="font-bold text-lg">
                        {packageInfo.totalUsers}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm opacity-90">Total Earning:</span>
                      <span className="font-bold text-lg">
                        ${packageInfo.totalMoney?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Users Table */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
          <div className="bg-gradient-to-r from-red-700 to-rose-600 text-white px-8 py-5">
            <h2 className="text-xl font-semibold m-0 tracking-wide">
              {selectedPackage} Users{" "}
              <span className="opacity-80">({users.length})</span>
            </h2>
          </div>
          {earningsLoading ? (
            <div className="p-8">
              <EnhancedUsersLoader />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[700px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-base font-semibold text-gray-700">
                        User ID
                      </th>
                      <th className="text-left px-6 py-3 text-base font-semibold text-gray-700">
                        Name
                      </th>
                      <th className="text-left px-6 py-3 text-base font-semibold text-gray-700">
                        Payment Date
                      </th>
                      <th className="text-left px-6 py-3 text-base font-semibold text-gray-700">
                        Expire Date
                      </th>
                      <th className="text-left px-6 py-3 text-base font-semibold text-gray-700">
                        Est. Token
                      </th>
                      <th className="text-left px-6 py-3 text-base font-semibold text-gray-700">
                        Est. Mock Test
                      </th>
                      <th className="text-left px-6 py-3 text-base font-semibold text-gray-700">
                        Package
                      </th>
                      {/* Money column removed */}
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.length > 0 ? (
                      currentUsers.map((user, index) => (
                        <UserTableRow key={`${user.userId}-${index}`} user={user} />
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-6 py-8 text-center text-gray-400 font-medium"
                        >
                          No users found for {selectedPackage}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center px-6 py-4 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className={`flex items-center px-3 py-1.5 text-base font-medium rounded-full border-none cursor-pointer transition-colors duration-200 ${
                        currentPage === 1
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                    >
                      ← Previous
                    </button>
                    {renderPageNumbers().map((page, index) => (
                      <PageButton
                        key={index}
                        page={page}
                        currentPage={currentPage}
                        onClick={handlePageChange}
                      />
                    ))}
                    <button
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className={`flex items-center px-3 py-1.5 text-base font-medium rounded-full border-none cursor-pointer transition-colors duration-200 ${
                        currentPage === totalPages
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.25s;
        }
        @keyframes fadeIn {
          0% { opacity:0; transform: translateY(-10px);}
          100% { opacity:1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
};

const UserTableRow = ({ user }) => {
  const [isHovered, setIsHovered] = useState(false);
  const getPackageBadgeColor = (packageName) => {
    switch (packageName) {
      case "Bronze":
        return "bg-gradient-to-br from-orange-400 to-orange-700 text-white";
      case "Silver":
        return "bg-gradient-to-br from-green-400 to-green-700 text-white";
      case "Gold":
        return "bg-gradient-to-br from-purple-400 to-purple-700 text-white";
      default:
        return "bg-gradient-to-br from-gray-500 to-gray-800 text-white";
    }
  };

  return (
    <tr
      className={`border-b border-gray-100 transition-colors duration-200 ${
        isHovered ? "bg-gray-100" : "bg-transparent"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <td className="px-6 py-3 text-base text-gray-600 font-mono">
        #{user.userId}
      </td>
      <td className="px-6 py-3 text-base text-gray-700 font-semibold">
        {user.name}
      </td>
      <td className="px-6 py-3 text-base text-gray-500">{user.paymentDate}</td>
      <td className="px-6 py-3 text-base text-gray-500">{user.expireDate}</td>
      <td className="px-6 py-3 text-base">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {user.estToken ?? user.estimatedToken}
        </span>
      </td>
      <td className="px-6 py-3 text-base">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {user.estMockTest ?? user.estimatedMockTest}
        </span>
      </td>
      <td className="px-6 py-3 text-base">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold shadow ${getPackageBadgeColor(
            user.package
          )}`}
        >
          {user.package}
        </span>
      </td>
    </tr>
  );
};

const PageButton = ({ page, currentPage, onClick }) => {
  const getButtonClasses = () => {
    const baseClasses =
      "px-3 py-1.5 text-base font-medium rounded-full border-none cursor-pointer transition-all duration-200";
    if (page === currentPage) {
      return `${baseClasses} bg-red-600 text-white`;
    } else if (page === "...") {
      return `${baseClasses} bg-transparent text-gray-400 cursor-default border-none`;
    } else {
      return `${baseClasses} bg-white text-gray-700 border border-gray-300 hover:bg-gray-50`;
    }
  };

  return (
    <button
      onClick={() => typeof page === "number" && onClick(page)}
      disabled={page === "..."}
      className={getButtonClasses()}
    >
      {page}
    </button>
  );
};

export default Earning;