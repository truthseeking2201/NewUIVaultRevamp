import axios from "axios";
import CryptoJS from "crypto-js";

const apiKey = import.meta.env.VITE_NODO_APP_URL_API_KEY;
const apiSecret = import.meta.env.VITE_NODO_APP_URL_API_KEY_API_SECRET;

const baseURL = import.meta.env.VITE_NODO_APP_URL || "https://api-dev.nodo.xyz";

const http = axios.create({
  baseURL: baseURL,
  timeout: 60000,
});
// Add a request interceptor
http.interceptors.request.use(
  (config) => {
    const method = config.method.toUpperCase();
    const url = new URL(config.url, config.baseURL);
    if (config.params && typeof config.params === "object") {
      Object.entries(config.params).forEach(([key, value]) => {
        if (["string", "number", "boolean"].includes(typeof value)) {
          url.searchParams.set(key, String(value));
        }
      });
    }
    const fullPath = url.pathname + (url.search ? url.search : "");

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const bodyString = "";

    const rawString = `${method}${fullPath}${bodyString}${timestamp}`;
    const signature = CryptoJS.HmacSHA256(rawString, apiSecret).toString();

    // add headers
    config.headers["x-api-key"] = apiKey;
    config.headers["x-timestamp"] = timestamp;
    config.headers["x-signature"] = signature;
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
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
  (error) => {
    const err = (error.response && error.response.data) || error;
    if (error.response && error.response.status === 401) {
      return Promise.reject(err);
    }

    if (error.response && error.response.status) {
      err.status = error.response.status;
    }

    return Promise.reject(err);
  }
);

export default http;
