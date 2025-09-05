import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { triggerWalletDisconnect } from "./wallet-disconnect";

// Refresh token state management
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

const checkTokenAboutToExpired = (token: string | null) => {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    // Check if token expires in the next 1 minutes (60 seconds)
    return decoded?.exp < currentTime + 60;
  } catch {
    return true;
  }
};
const NOT_REFRESH_TOKEN_ERROR = "No refresh token available";
const refreshTokenRequest = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) {
    throw new Error(NOT_REFRESH_TOKEN_ERROR);
  }

  const res = await axios.post(`${baseURL}/data-management/auth/refresh`, {
    refresh_token: refreshToken,
  });

  if (res.status === 201 && res.data.data) {
    const { access_token, refresh_token } = res.data.data;
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    return access_token;
  } else {
    throw new Error("Invalid refresh response");
  }
};

const getValidToken = async (): Promise<string | null> => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return null;
  }

  // If token is still valid, return it
  if (!checkTokenAboutToExpired(token)) {
    return token;
  }

  // If refresh is already in progress, queue this request
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    const newToken = await refreshTokenRequest();
    processQueue(null, newToken);
    return newToken;
  } catch (error) {
    processQueue(error, null);
    throw error;
  } finally {
    isRefreshing = false;
  }
};

const baseURL = import.meta.env.VITE_NODO_APP_URL || "https://api-dev.nodo.xyz";

const http = axios.create({
  baseURL: baseURL,
  timeout: 60000,
});

// Request interceptor: add Authorization header with valid token
http.interceptors.request.use(
  async (config) => {
    try {
      const token = await getValidToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // If token refresh fails, continue without auth header
      console.warn("Failed to get valid token:", error.status);
      if (error?.status === 401) {
        triggerWalletDisconnect();
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 errors
http.interceptors.response.use(
  (response) => {
    // Return JSON data
    if (response.data) {
      return response.data.data != undefined
        ? response.data.data
        : response.data;
    }
    return response;
  },
  async (error) => {
    const err = (error.response && error.response.data) || error;
    const originalRequest = error.config as typeof error.config & {
      _retryCount?: number;
    };

    // Initialize retry count if not set
    if (!originalRequest._retryCount) {
      originalRequest._retryCount = 0;
    }

    if (
      error.response?.status === 401 &&
      originalRequest &&
      originalRequest._retryCount < 3
    ) {
      originalRequest._retryCount++;

      try {
        const token = await getValidToken();
        if (token && originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        console.log("🚀 ~ refreshError:", refreshError);
        if (
          refreshError?.response?.status === 401 ||
          refreshError?.message === NOT_REFRESH_TOKEN_ERROR
        ) {
          // Clear tokens and disconnect wallet on refresh failure
          triggerWalletDisconnect();
          return Promise.reject(
            "Your session has expired. Please login again."
          );
        }
        return Promise.reject(refreshError);
      }
    }

    if (error.response && error.response.status) {
      if (error.response.status === 401) {
        triggerWalletDisconnect();
      }
      err.status = error.response.status;
    }

    return Promise.reject(err);
  }
);

export default http;
