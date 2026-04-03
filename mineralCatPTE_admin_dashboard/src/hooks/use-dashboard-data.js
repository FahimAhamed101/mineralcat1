import { useState, useEffect } from "react";
import fetchWithAuth from "../utils/fetchWithAuth";

export function useDashboardData(baseUrl) {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination and filtering states (optional, 
  const [currentPage, setCurrentPage] = useState(1);
  // const [searchTerm, setSearchTerm] = useState(""); 
  // const [statusFilter, setStatusFilter] = useState("All");  

  
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        // search: searchTerm,
        // status: statusFilter !== "All" ? statusFilter : undefined,
      });

      const url = `${baseUrl}/admin/recent-users?${params.toString()}`;

      const response = await fetchWithAuth(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();

      
      setStats(data.stats || {});
      setRecentUsers( data.data || []);

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setStats(null);
      setRecentUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage /*, searchTerm, statusFilter */]);

  return {
    stats,
    recentUsers,
    loading,
    error,
    currentPage,
    setCurrentPage,
    // searchTerm,
    // setSearchTerm,
    // statusFilter,
    // setStatusFilter,
    refetch: fetchDashboardData,
  };
}
