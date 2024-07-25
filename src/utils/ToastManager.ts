// toastManager.js
import { createStandaloneToast } from "@chakra-ui/react";

const { toast } = createStandaloneToast();

class ToastManager {
  static closeAll() {
    toast.closeAll();
  }

  static success(message: string, description: string) {
    ToastManager.closeAll(); // Close all existing toasts
    toast({
      title: message,
      description: description,
      status: "success",
      duration: 4000,
      isClosable: true,
      position: "top-right",
    });
  }

  static error(message: string, description: string) {
    ToastManager.closeAll(); // Close all existing toasts
    toast({
      title: message,
      description: description,
      status: "error",
      duration: 10000,
      isClosable: true,
      position: "top-right",
    });
  }
}

export default ToastManager;
