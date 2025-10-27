import { message } from "antd";
import API from "./axiosInstance";

export const profileInfo = async () => {
    try {
      const response = await API.get('/users/get-profile/');
      console.log(response.data)
      return { success: true, profile_info: response.data.profile_info, loginMethod: response.data.login_method };
    } catch (error) {
      return { success: false };
    }
  };

  export const updateProfileField = async (field, value) => {
    try {
      const response = await API.patch('/users/get-profile/', {
        [field]: value,
      });
      return response.data;
    } catch (error) {
      return { success: false, message: "Update failed." };
    }
  };



export const updateProfileImage = async (file) => {
  const formData = new FormData();
  formData.append('profile_image', file);

  try {
    const res = await API.patch('/users/profile_image/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (err) {
    return { success: false, message: 'Failed to upload image' };
  }
};

export const verifyPassword = async (password) => {
    try {
      const response = await API.post('/users/verify-password/',{password});
      return { success: true};
    } catch (error) {
      return { success: false };
    }
  };

export const changePassword = async (password1, password2) => {
  try {
    const response = await API.post('/users/change_password/', { password1, password2 });
    return { 
      success: true, 
      message: response.data?.message || "Password updated successfully" 
    };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || "Something went wrong" 
    };
 
  }
};

 

  export const verifyEmail = async (email) => {
    try {
      const response = await API.post('/users/verifyEmail/', { email });
      return { success: true, message: response.data.message }; // optionally pass message
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Something went wrong", // better error feedback
      };
    }
  };
  

  export const createAppointment = async (data) => {
    try {
      const response = await API.post('/users/create-appointment/', data);
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Something went wrong',
      };
    }
  };
  
  export const getAppointments = async () => {
    try {
      const response = await API.get('/users/get-appointments/');
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Something went wrong',
      };
    }
  };

  export const cancelSession = async ({ id, reason, current_role }) => {
    try {
      const response = await API.patch(`/users/cancel-session/${id}/`, { reason, current_role });
  
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Something went wrong',
      };
    }
  };
  
  

  export const changeForgotPassword = async (email, password1, password2) => {
    try {
      const response = await API.post('/users/change_forgot_password/', { email, password1, password2 });
      return { success: true };  // Consider returning response data if needed
    } catch (error) {
      // Check if error response has message and return it
      const errorMessage = error.response?.data?.message || 'An error occurred';
      return { success: false, message: errorMessage };
    }
  };


  // Assuming API.post sends POST request to your backend
export const createPayment = async (amount) => {
  try {
    const response = await API.post('/users/create-payment-intent/', { amount });
    // Returning the clientSecret from the response
    return { success: true, clientSecret: response.data.clientSecret };  
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    return { success: false, message: errorMessage };
  }
};

export const submitFeedback = async (feedbackData) => {
  try {
    const response = await API.patch('/users/create-feedback/', feedbackData);
    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    return { success: false, message: errorMessage };
  }
};


export const getNotifications = async () => {
  try {
    const response = await API.get('/users/get-notifications/');
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    return { success: false, message: errorMessage };
  }
};


export const markNotificationAsRead = async (id) => {
  try {
    const response = await API.post('/users/mark-as-read/', { id }); // send as an object
    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    return { success: false, message: errorMessage };
  }
};

export const markAllNotifications = async () => {
  try {
    const response = await API.post('/users/mark-all-as-read/');
    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    return { success: false, message: errorMessage };
  }
};


 export const markAsAttended = async (id,role) => {
    try {
      const response = await API.post('/users/mark-as-attended/', { id, role });
      return { success: true };  // Consider returning response data if needed
    } catch (error) {
      // Check if error response has message and return it
      const errorMessage = error.response?.data?.message || 'An error occurred';
      return { success: false, message: errorMessage };
    }
  };
  


export const requestClientWithdraw = async (data) => {
  try {
    const response = await API.post(`/users/request-client-withdraw/`, data);
    return { success: true, message: response.data.message };  // <-- FIXED
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || 'An error occurred';
    return { success: false, message: errorMessage };
  }
};


export const getTherapsitProfile= async (id) => {
    try {
      const response = await API.get(`/users/get-therapist-profile/${id}/`);
      return { success: true, profile_info: response.data.profile_info};
    } catch (error) {
      return { success: false };
    }
  };


// export const getSessionPrices= async () => {
//     try {
//       const response = await API.get(`/users/get-session-prices/`);
//       return { success: true, prices: response.data.prices};
//     } catch (error) {
//       return { success: false };
//     }
//   };

export const getMYInfo = async () => {
  try {
    const response = await API.get(`/users/my-info/`);
    return { success: true, status: response.status, data: response.data.data };
  } catch (error) {
    return { success: false, error }; 
  }
};




  export const googleLogin = async (token, current_role, mode) => {
    try {
      const response = await API.post('/users/auth/google/', { token, current_role, mode });
      return { success: true, data: response.data}; // optionally pass message
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || error.message || "Something went wrong",
      };
    }
  };


export const getUserTransactions = async () => {
try {
  const response = await API.get(`/users/get-transactions-history/`);
  return { success: true, data: response.data.data };
} catch (error) {
  console.error('Error fetching profile:', error); // Optionally log the error
  return { success: false, message: error.message || 'An error occurred' };
}
};




export const checkSlot = async (data) => {
  try {
    const response = await API.post(`/users/check-time-slot/`, data); 
    return { available: response.data.available };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'An error occurred' };
  }
};


export const checkAuth = async () => {
try {
  const response = await API.get(`/users/check-auth/`);
  return { success: true, data: response.data };
} catch (error) {
  console.error('Error fetching profile:', error); // Optionally log the error
  return { success: false, message: error.message || 'An error occurred' };
}
};


export const getMessages = async (id1, id2) => {
try {
  const response = await API.get(`/users/chat/conversation/${id1}/${id2}/`);
  return { success: true, data: response.data };
} catch (error) {
  console.error('Error fetching profile:', error); // Optionally log the error
  return { success: false, message: error.message || 'An error occurred' };
}
};
