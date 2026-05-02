const REFRESH_BUFFER_SECONDS = 30;

export default async function fetchWithAuth(url, options = {}) {
  let accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  if (refreshToken && shouldRefreshAccessToken(accessToken)) {
    accessToken = await refreshAccessToken();
  }

  let response = await fetch(url, buildRequestOptions(options, accessToken));

  if (response.status === 401 || response.status === 403) {
    if (!refreshToken) {
      logoutAndRedirect();
      return response;
    }

    const refreshedAccessToken = await refreshAccessToken();
    if (!refreshedAccessToken) {
      logoutAndRedirect();
      return response;
    }

    response = await fetch(url, buildRequestOptions(options, refreshedAccessToken));
  }

  return response;
}

function buildRequestOptions(options, accessToken) {
  const headers = new Headers(options.headers || {});

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  } else {
    headers.delete("Authorization");
  }

  return {
    ...options,
    headers,
  };
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

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

    if (!refreshResponse.ok) return null;

    const data = await refreshResponse.json();
    if (!data?.accessToken) return null;

    localStorage.setItem("accessToken", data.accessToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

function shouldRefreshAccessToken(token) {
  if (!token) return true;

  const expiry = getTokenExpiry(token);
  if (!expiry) return false;

  return expiry <= Math.floor(Date.now() / 1000) + REFRESH_BUFFER_SECONDS;
}

function getTokenExpiry(token) {
  if (!token || typeof atob !== "function") return null;

  const payload = token.split(".")[1];
  if (!payload) return null;

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      "="
    );
    const decodedPayload = JSON.parse(atob(paddedPayload));
    return typeof decodedPayload.exp === "number" ? decodedPayload.exp : null;
  } catch {
    return null;
  }
}

function logoutAndRedirect() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "/auth/admin/login";
}
