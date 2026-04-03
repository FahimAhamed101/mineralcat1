import { cookies } from "next/headers";

/**
 * Fetch with HTTP Only Cookie based authentication (SSR safe).
 * 1. Reads accessToken and refreshToken from cookies.
 * 2. If 401/403, tries to refresh using refresh-token endpoint (cookie-based).
 * 3. If successful, retries original request with new access token.
 */
export default async function fetchWithAuthSSR(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // 1. Read tokens from HTTP Only Cookies
  const cookieStore = await cookies();
  let accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  // 2. Set Authorization header if accessToken exists
  options.headers = {
    ...(options.headers || {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  // 3. First attempt
  let response = await fetch(url, options);

  // 4. If unauthorized, try to refresh token (cookie-based)
  if (response.status === 401 || response.status === 403) {
    if (!refreshToken) {
      throw new Error("Not authenticated");
    }

    // Try to refresh the access token using cookie
    const refreshEndpoint = process.env.NEXT_PUBLIC_URL || "";
    const refreshRes = await fetch(`${refreshEndpoint}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // No need to send refreshToken manually; browser/server will send cookies automatically
      // credentials: "include" // not needed in Next.js server
    });

    if (refreshRes.status !== 200) {
      throw new Error("Session expired. Please login again.");
    }

    const data = await refreshRes.json();
    accessToken = data?.accessToken;
    if (!accessToken) {
      throw new Error("No access token received.");
    }

    // Retry original request with new access token
    options.headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${accessToken}`,
    };
    response = await fetch(url, options);
  }

  return response;
}