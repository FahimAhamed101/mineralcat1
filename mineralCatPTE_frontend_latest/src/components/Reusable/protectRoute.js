"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useLoggedInUser from "@/lib/useGetLoggedInUser";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, loading: userLoading } = useLoggedInUser();

  

  useEffect(() => {
    const checkAuth = () => {
      // Check if the user is loading first
      if (userLoading) {
        return;
      }

      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.push("/auth/login"); // Redirect to login if not authenticated
      }

      setLoading(false);  // After authentication check, stop loading
    };

    checkAuth();
  }, [router, user, userLoading]); // Add userLoading to the dependencies to prevent early redirect

  return { isAuthenticated, loading };
};

export default useAuth;
