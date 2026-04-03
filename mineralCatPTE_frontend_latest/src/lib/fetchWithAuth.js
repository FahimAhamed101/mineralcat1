/* eslint-disable @typescript-eslint/no-unused-vars */
export default async function fetchWithAuth(url, options = {}) {
  let accessToken = localStorage.getItem("accessToken");
  let refreshToken = localStorage.getItem("refreshToken");

  // Ensure headers exist
  options.headers = {
    ...(options.headers || {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  // First request attempt
  let response = await fetch(url, options);
  // console.log("access response with:", response);

  // If unauthorized, attempt to refresh token
  if (response.status === 401 || response.status === 403) {
    if (!refreshToken) {
      logoutAndRedirect();
      return;
    }

    try {
      const refreshResponse = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/auth/refresh-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-refresh-token": refreshToken,
          },
        }
      );
      // console.log("Refresh token response status:", refreshResponse);
      // If refresh token request fails, logout
      if (!refreshResponse.ok) {
        logoutAndRedirect();
        return;
      }

      const data = await refreshResponse.json();

      // console.log("Refresh token response:", data.accessToken);

      if (!data?.accessToken) {
        logoutAndRedirect();
        return;
      }

      accessToken = data.accessToken;
      localStorage.setItem("accessToken", accessToken);

      // Retry original request with new access token
      options.headers.Authorization = `Bearer ${accessToken}`;
      response = await fetch(url, options);
    
    } catch (error) {
    //   console.error("Error refreshing token:", error);
      
      logoutAndRedirect();
      return;
    }
  }

  return response;
}

// Logout helper
export function logoutAndRedirect() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "/auth/login";
}
