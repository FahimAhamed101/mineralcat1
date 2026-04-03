import fetchWithAuth from "../../utils/fetchWithAuth";
import { useQuery } from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_ADMIN_URL || "";

export function useGetLoggedInUser() {
  return useQuery({
    queryKey: ["loggedInUser"],
    queryFn: async () => {
      const response = await fetchWithAuth(`${BASE_URL}/user/user-info`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          
        },
        credentials: "include", // যদি API সেশন কুকি ব্যবহার করে
      });

      if (!response.ok) {
        // যদি token expired বা unauthorized হয় তাহলে স্পষ্ট error throw করো
        if (response.status === 401) {
          throw new Error("Unauthorized. Please login again.");
        }
        throw new Error("Failed to fetch logged in user info");
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // ৫ মিনিট পর্যন্ত ডাটা fresh থাকবে
    retry: 1, // ১ বার retry করবে ব্যর্থ হলে
    refetchOnWindowFocus: false, // যখন উইন্ডো active হয় তখন refetch না করতে চাইলে false
    refetchOnMount: true, // মাউন্ট হওয়ার সময় ডাটা fetch করবে
    refetchOnReconnect: true, // নেটওয়ার্ক reconnect হলে পুনরায় fetch করবে
  });
}
