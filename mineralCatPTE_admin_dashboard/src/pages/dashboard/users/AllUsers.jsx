import { useState, useMemo } from "react";
import { MoreHorizontal, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useGetAllUsers } from "../../../hooks/useGetAllUsers";
import dummyPhoto from "/user.svg";
import Swal from "sweetalert2";
import fetchWithAuth from "../../../utils/fetchWithAuth";
import { useNavigate } from "react-router-dom";

export default function AllUsers() {
  const baseUrl = import.meta.env.VITE_ADMIN_URL || "";
  const navigate = useNavigate();
  const {
    users,
    loading,
    error,
    currentPage,
    setCurrentPage,
    searchTerm,
    setSearchTerm,
    refetch,
    planType,
    setPlanType,
  } = useGetAllUsers(baseUrl);

  const [dropdownOpenIndex, setDropdownOpenIndex] = useState(null);
  const [viewUser, setViewUser] = useState(null); 

  const ITEMS_PER_PAGE = 10;

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (planType !== "All" && user.userSupscription?.planType !== planType) {
        return false;
      }
      const lowerSearch = searchTerm.toLowerCase();
      if (
        user.name.toLowerCase().includes(lowerSearch) ||
        (user.email && user.email.toLowerCase().includes(lowerSearch))
      ) {
        return true;
      }
      return false;
    });
  }, [users, planType, searchTerm]);

  const totalPagesFront = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const toggleDropdown = (index) => {
    setDropdownOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  // handle delete user
  const handleDelete = async (userId) => {
    if (!userId) return;
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetchWithAuth(`${baseUrl}/admin/delete-user/${userId}`, {
            method: "DELETE",
          });

          if (response.ok) {
            Swal.fire({
              title: "Deleted!",
              text: "The user has been deleted successfully.",
              icon: "success",
            });
            refetch(); 
          } else {
            const errorData = await response.json().catch(() => ({}));
            Swal.fire({
              title: "Error!",
              text: errorData.message || "Failed to delete the user.",
              icon: "error",
            });
          }
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: error.message || "Something went wrong.",
            icon: "error",
          });
        }
      }
    });
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;

    if (totalPagesFront <= maxVisiblePages) {
      for (let i = 1; i <= totalPagesFront; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPagesFront);
      } else if (currentPage >= totalPagesFront - 3) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPagesFront - 4; i <= totalPagesFront; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPagesFront);
      }
    }

    return pages;
  };

  if (loading && users.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-[#A85C5C] text-white p-4">
          <h1 className="text-lg font-medium">Users List</h1>
        </div>
        <div className="bg-white">
          <div className="animate-pulse">
            {[...Array(7)].map((_, index) => (
              <div key={index} className="border-b border-gray-200 p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden relative">
      {/* Header */}
      <div className="bg-[#A85C5C] text-white p-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Users List</h1>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="input input-sm bg-white p-2 rounded text-black placeholder:text-gray-500 border-0 w-48 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <select
            value={planType}
            onChange={(e) => {
              setPlanType(e.target.value);
              setCurrentPage(1);
            }}
            className="select select-sm bg-white p-2 rounded text-black border-0 w-32 focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <option value="All">All Plans</option>
            <option value="Premium">Premium</option>
            <option value="Free">Free</option>
          </select>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && users.length > 0 && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
          <span
            className="loading loading-spinner loading-lg"
            style={{ color: "#A85C5C" }}
          ></span>
        </div>
      )}

      {/* Users Table with fixed height container */}
      <div className="overflow-x-auto relative h-[600px]">
        <table className="table w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left font-medium text-gray-700 p-3">
                SI NO.
              </th>
              <th className="text-left font-medium text-gray-700 p-3">Name</th>
              <th className="text-left font-medium text-gray-700 p-3">Email</th>
              <th className="text-left font-medium text-gray-700 p-3">
                Plan Type
              </th>
              <th className="text-left font-medium text-gray-700 p-3">
                Joining Date
              </th>
              <th className="text-left font-medium text-gray-700 p-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-red-500">
                  <div className="alert alert-error">
                    <span>{error}</span>
                  </div>
                </td>
              </tr>
            ) : paginatedUsers.length === 0 && !loading ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-gray-500">
                  <div className="alert alert-info">
                    <span>No users found</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user, index) => (
                <tr
                  key={user._id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    index % 2 === 1 ? "bg-gray-25" : "bg-white"
                  }`}
                >
                  <td className="p-3 text-gray-600">
                    {typeof user._id === "number"
                      ? String(user._id).padStart(6, "0")
                      : String(user._id).substring(0, 6)}
                  </td>
                  <td className="p-3 text-gray-800 font-medium">{user.name}</td>
                  <td className="p-3 text-gray-600">{user?.email}</td>
                  <td className="p-3 text-gray-600">
                    {user.userSupscription?.planType}
                  </td>
                  <td className="p-3 text-gray-600">{user?.joinedDate}</td>
                  <td className="p-3 relative">
                    {/* action button dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-circle flex items-center justify-center hover:bg-gray-200 transition-colors"
                        onClick={() => toggleDropdown(index)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {dropdownOpenIndex === index && (
                        <ul className="absolute right-0 top-full mt-2 z-20 menu p-2 shadow-lg bg-white rounded-lg w-52 border border-gray-200">
                          <li>
                            <a
                              onClick={() => setViewUser(user)}
                              className="hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                              View Details
                            </a>
                          </li>
                          <li>
                            <a
                              onClick={() => navigate(`/users/edit/${user._id}`)}
                              className="hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                              Edit User
                            </a>
                          </li>
                          <li>
                            <button
                              onClick={() => handleDelete(user?._id)}
                              className="text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              Delete User
                            </button>
                          </li>
                        </ul>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center p-6 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ring-1 ring-inset ring-gray-300 focus-visible:outline-offset-0 h-8"
            style={{
              backgroundColor: "#A85C5C",
              color: "white",
              borderColor: "#A85C5C",
              ...(currentPage === 1 && {
                backgroundColor: "#d1d5db",
                color: "#6b7280",
                borderColor: "#d1d5db",
                opacity: "0.5",
              }),
            }}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </button>

          {generatePageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === "number" && setCurrentPage(page)}
              disabled={page === "..."}
              className="relative inline-flex items-center justify-center min-w-[32px] h-8 rounded-md text-sm font-medium focus-visible:outline-offset-0"
              style={{
                backgroundColor:
                  currentPage === page
                    ? "#8B1538"
                    : page === "..."
                    ? "transparent"
                    : "#D4A574",
                color: page === "..." ? "#6b7280" : "white",
                border: page === "..." ? "none" : "1px solid",
                borderColor: currentPage === page ? "#8B1538" : "#D4A574",
                cursor: page === "..." ? "default" : "pointer",
              }}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPagesFront, currentPage + 1))
            }
            disabled={currentPage === totalPagesFront}
            className="relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ring-1 ring-inset ring-gray-300 focus-visible:outline-offset-0 h-8"
            style={{
              backgroundColor: "#8B1538",
              color: "white",
              borderColor: "#8B1538",
              ...(currentPage === totalPagesFront && {
                backgroundColor: "#d1d5db",
                color: "#6b7280",
                borderColor: "#d1d5db",
                opacity: "0.5",
              }),
            }}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
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
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                    <img
                      src={viewUser.photoUrl || dummyPhoto}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
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
                        : viewUser._id
                        ? viewUser._id.substring(0, 6)
                        : "#"}
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