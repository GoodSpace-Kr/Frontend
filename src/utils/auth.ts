// utils/auth.ts

export const clearAuthData = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("pendingClientId");
};

export const getStoredAuth = () => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const userData = localStorage.getItem("user");

    return {
      accessToken,
      refreshToken,
      user: userData ? JSON.parse(userData) : null,
    };
  } catch (error) {
    console.error("Auth data parsing error:", error);
    return {
      accessToken: null,
      refreshToken: null,
      user: null,
    };
  }
};

export const storeAuthData = (data: { accessToken: string; refreshToken?: string; user: unknown }) => {
  localStorage.setItem("accessToken", data.accessToken);
  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
  }
  localStorage.setItem("user", JSON.stringify(data.user));
};

export const isAuthenticated = (): boolean => {
  const { accessToken } = getStoredAuth();
  return !!accessToken;
};
