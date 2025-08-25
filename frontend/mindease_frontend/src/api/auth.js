import API from "./axiosInstance";

export const registerUser = async (userData) => {
  try {
      const response = await API.post("/users/register/", userData);
      return { success: true, data: response.data };
  } catch (error) {
      return { success: false, message: error.response?.data?.error || "Registration failed!" };
  }
};


export const loginUser = async (userData) => {
  try {
    const response = await API.post("/users/login/", userData);
    return { success: true, data: response.data };
  } catch (error) {
     console.log("LOGIN ERROR RESPONSE:", error.response?.data);
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.response?.data?.non_field_errors?.[0] ||
      error.message ||
      "Login failed!";
      
    return { success: false, message };
  }
};



export const logoutUser = async () => {
    try {
        const response = await API.post("/users/logout/");
        return { success: true, message: response.data.message };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.error || "Logout failed!"
        };
    }
};


export const verifyOtp = async (otp,email) => {
 
  try {
      const response = await API.post("/users/verify_otp/", {otp,email});
      return { success: true, message: response.data.message};
  } catch (error) {
      return { success: false, message: error.response?.data?.message || "Invalid OTP" };
  }
};


export const verifyFotgetPasswordOtp = async (otp,email) => {
 
  try {
      const response = await API.post("/users/verify-forgetpassword-otp/", {otp,email});
      return { success: true, message: response.data.message};
  } catch (error) {
      return { success: false, message: error.response?.data?.message || "Invalid OTP" };
  }
};

export const resendOtp = async (email) => {
    try {
      const response = await API.post("/users/resend_otp/", { email });
      return { success: true, message: "OTP resent successfully!" };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to resend OTP!" };
    }
  };






