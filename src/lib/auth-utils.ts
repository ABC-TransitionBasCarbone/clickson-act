// Helper function to check if token is expired
export const isTokenExpired = (expiry?: number): boolean => {
  if (!expiry) return true;
  return Date.now() >= expiry;
};

// Helper function to get secure storage
export const getSecureStorage = () => {
  return {
    getToken: () => sessionStorage.getItem("auth_token"),
    setToken: (token: string) => sessionStorage.setItem("auth_token", token),
    removeToken: () => sessionStorage.removeItem("auth_token"),
    getRefreshToken: () => sessionStorage.getItem("refresh_token"),
    setRefreshToken: (token: string) =>
      sessionStorage.setItem("refresh_token", token),
    removeRefreshToken: () => sessionStorage.removeItem("refresh_token"),
    getExpiry: () => sessionStorage.getItem("token_expiry"),
    setExpiry: (expiry: number) =>
      sessionStorage.setItem("token_expiry", expiry.toString()),
    removeExpiry: () => sessionStorage.removeItem("token_expiry"),
  };
};

// Function to refresh Firebase token
export const refreshToken = async (): Promise<string | null> => {
  try {
    const secureStorage = getSecureStorage();
    const refreshTokenValue = secureStorage.getRefreshToken();

    if (!refreshTokenValue) {
      console.error("No refresh token available");
      return null;
    }

    // Use Firebase REST API to refresh the token
    const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (!firebaseApiKey) {
      console.error("Firebase API key not configured");
      return null;
    }

    const response = await fetch(
      `https://securetoken.googleapis.com/v1/token?key=${firebaseApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "refresh_token",
          refresh_token: refreshTokenValue,
        }),
      },
    );

    if (!response.ok) {
      console.error("Token refresh failed:", response.status);
      return null;
    }

    const data = await response.json();
    const newToken = data.id_token;
    const newRefreshToken = data.refresh_token;
    const expiresIn = data.expires_in;

    if (newToken && expiresIn) {
      // Store the new token and expiry
      secureStorage.setToken(newToken);
      if (newRefreshToken) {
        secureStorage.setRefreshToken(newRefreshToken);
      }
      secureStorage.setExpiry(Date.now() + expiresIn * 1000);
      return newToken;
    }

    return null;
  } catch (error) {
    console.error("Token refresh error:", error);
    return null;
  }
};

// Function to get a valid token (refresh if needed)
export const getValidToken = async (): Promise<string | null> => {
  const secureStorage = getSecureStorage();
  const currentToken = secureStorage.getToken();
  const storedExpiry = secureStorage.getExpiry();
  const tokenExpiry = storedExpiry ? parseInt(storedExpiry) : undefined;

  // If no token or token is expired, try to refresh
  if (!currentToken || isTokenExpired(tokenExpiry)) {
    const refreshedToken = await refreshToken();
    if (refreshedToken) {
      return refreshedToken;
    }

    // If refresh failed, clear storage and redirect to login
    secureStorage.removeToken();
    secureStorage.removeRefreshToken();
    secureStorage.removeExpiry();
    localStorage.removeItem("username");
    localStorage.removeItem("uid");
    localStorage.removeItem("role");

    // Redirect to login
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }

    return null;
  }

  return currentToken;
};

// Function to make authenticated API calls with automatic token refresh
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  const token = await getValidToken();

  if (!token) {
    throw new Error("No valid token available");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  // If we get a 401, the token might be expired, try to refresh and retry once
  if (response.status === 401) {
    const refreshedToken = await refreshToken();
    if (refreshedToken) {
      // Retry the request with the new token
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${refreshedToken}`,
        },
      });
    }
  }

  return response;
};
