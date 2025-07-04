import API from "./axiosInstance";

export const profileInfo = async () => {
    try {
      const response = await API.get('/users/get_profile/');
      return { success: true, profile_info: response.data.profile_info };
    } catch (error) {
      return { success: false };
    }
  };

  export const updateProfileField = async (field, value) => {
    try {
      const response = await API.patch('/users/get_profile/', {
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
      const response = await API.post('/users/verify_password/',{password});
      return { success: true};
    } catch (error) {
      return { success: false };
    }
  };

  export const changePassword = async (password) => {
    try {
      const response = await API.post('/users/change_password/',{password});
      return { success: true};
    } catch (error) {
      return { success: false };
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
      const response = await API.post('/users/create_appointment/', data);
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
      const response = await API.get('/users/get_appointments/');
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
      const response = await API.patch(`/users/cancel_session/${id}/`, { reason, current_role });
  
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Something went wrong',
      };
    }
  };
  
  

  export const changeForgotPassword = async (email, password) => {
    try {
      const response = await API.post('/users/change_forgot_password/', { email, password });
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
    const response = await API.patch('/users/create_feedback/', feedbackData);
    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    return { success: false, message: errorMessage };
  }
};


export const getNotifications = async () => {
  try {
    const response = await API.get('/users/get_notifications/');
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    return { success: false, message: errorMessage };
  }
};


export const markNotificationAsRead = async (id) => {
  try {
    const response = await API.post('/users/mark_as_read/', { id }); // send as an object
    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    return { success: false, message: errorMessage };
  }
};

export const markAllNotifications = async () => {
  try {
    const response = await API.post('/users/mark_all_as_read/');
    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    return { success: false, message: errorMessage };
  }
};



  