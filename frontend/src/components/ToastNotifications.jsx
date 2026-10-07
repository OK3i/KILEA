import { useEffect } from "react";
import { Toaster, toast } from "sonner";
import { API_ERROR_EVENT } from "../api/client.js";

export function ToastNotifications() {
  useEffect(() => {
    function showApiError(event) {
      const { status, message } = event.detail;
      if (status === 400) {
        toast.error("Request could not be processed", { description: message });
      } else if (status === 401) {
        toast.error("Authentication required", {
          description: message || "Sign in again to continue.",
        });
      }
    }

    window.addEventListener(API_ERROR_EVENT, showApiError);
    return () => window.removeEventListener(API_ERROR_EVENT, showApiError);
  }, []);

  return (
    <Toaster
      position="top-right"
      closeButton
      richColors
      toastOptions={{
        style: {
          background: "#20221c",
          border: "1px solid #3a3d32",
          color: "#eeeae0",
        },
      }}
    />
  );
}
