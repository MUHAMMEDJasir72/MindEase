import { toast } from "sonner"; // ✅ Use Sonner

// Function to show different types of toast messages
export const showToast = (message, type = "default") => {

  switch (type) {
    case "success":
      toast.success(message);
      break;
    case "error":
      toast.error(message);
      break;
    case "info":
      toast(message); // No toast.info in Sonner
      break;
    case "warning":
      toast.warning(message);
      break;
    default:
      toast(message);
      break;
  }
};
