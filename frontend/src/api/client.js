import axios from "axios";
import { toast } from "sonner";

export const TOKEN_KEY = "modforge.accessToken";
export const AUTH_CHANGED_EVENT = "modforge:auth-changed";
export const API_ERROR_EVENT = "modforge:api-error";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) return Promise.reject(error);

    const status = error.response?.status;
    const responseMessage = error.response?.data?.message;
    const message = Array.isArray(responseMessage)
      ? responseMessage.join(" ")
      : typeof responseMessage === "string"
        ? responseMessage
        : "";

    if (status === 400 || status === 401) {
      window.dispatchEvent(
        new CustomEvent(API_ERROR_EVENT, {
          detail: { status, message },
        }),
      );
    }
    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
    }
    return Promise.reject(error);
  },
);

export function getApiError(
  error,
  fallback = "Something went wrong. Try again.",
) {
  const message = error.response?.data?.message;
  if (Array.isArray(message)) return message.join(" ");
  return typeof message === "string" ? message : fallback;
}

export function toastApiError(error, fallback) {
  if ([400, 401].includes(error.response?.status)) return;
  toast.error(getApiError(error, fallback));
}
