import { useState, useEffect } from "react";
import fetchWithAuth from "../utils/fetchWithAuth";

export function useGetAllCounts(baseUrl) {
  const [allDataCount, setAllDataCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

    

  const fetchCounts = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!baseUrl) throw new Error("API base URL is required");

      const url = `${baseUrl}/admin/get-all-counts`;

      const response = await fetchWithAuth(url, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch counts data");
      }

      const data = await response.json();

      
      setAllDataCount(data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setAllDataCount(null);
      console.error("Error fetching counts:", err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    allDataCount,
    loading,
    error,
    refetch: fetchCounts,
  };
}
