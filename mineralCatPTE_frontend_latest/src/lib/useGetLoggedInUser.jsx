import { useEffect, useState } from "react";
import fetchWithAuth from "./fetchWithAuth";

export default function useLoggedInUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken"); // অথবা কুকি থেকে নাও
        if (!accessToken) {
          setUser(null);
          setLoading(false);
          return;
        }

        const response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_URL || ""}/user/user-info`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
          }
        );

        if (!response || !response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUser(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unknown error");
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
}