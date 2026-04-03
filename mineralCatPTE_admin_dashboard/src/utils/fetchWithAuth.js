export default async function fetchWithAuth(url, options = {}) {
  let accessToken = localStorage.getItem("accessToken");
  let refreshToken = localStorage.getItem("refreshToken");

  // Ensure headers exist
  options.headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${accessToken}`,
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
        `${import.meta.env.VITE_ADMIN_URL}/auth/refresh-token`,
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
      if (!refreshResponse === 200) {
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
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
    //   console.error("Error refreshing token:", error);
      
      logoutAndRedirect();
      return;
    }
  }

  return response;
}

// Logout helper
function logoutAndRedirect() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "/auth/admin/login";
}
