import API from "./axiosInstance";


export const getTherapist = async () => {
    try {
      const response = await API.get('/admin/get_therapists/');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  };

export const getAllTherapist = async () => {
    try {
      const response = await API.get('/admin/get-all-therapist/');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  };

  export const getTherapistInformation = async (id) => {
    try {
      const response = await API.get(`/admin/get_therapist_information/${id}/`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  };

  export const getUsers = async () => {
    try {
      const response = await API.get(`/admin/get_users/`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  };

  export const getUserInfo = async (id) => {
    try {
      const response = await API.get(`/admin/get_user_details/${id}/`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  };

  export const approveTherapist = async (id) => {
    try {
      const response = await API.patch(`/admin/approve-therapist/${id}/`);
      return { success: true};
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  };
export const rejectTherapist = async (id) => {
  try {
    const response = await API.patch(`/admin/reject-therapist/${id}/`);
    return { success: true, message: response.data.message };
  } catch (error) {
    return { success: false, message: error.response?.data || error.message };
  }
};




  export const createSpecialize = async (data) => {
    try {
      const response = await API.post(`/admin/specializations/`, data);
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  };

  export const getSpecializations = async () => {
    try {
      const response = await API.get(`/admin/specializations/`);
      return {
        success: true,
        message: response.data.message,
        data: response.data.specializations,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  };

  export const deleteSpecialize = async (id) => {
    try {
      const response = await API.delete(`/admin/specializations/${id}/`);
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  };

  export const editSpecialize = async (id, data) => {
    try {
      const response = await API.patch(`/admin/specializations/${id}/`, data);
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  };
  
  
  export const changeTherapistStatus = async (id) => {
    try {
      const response = await API.patch(`/admin/change_therapist_status/${id}/`);
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  };

  export const changeUserStatus = async (id) => {
    try {
      const response = await API.patch(`/admin/change_user_status/${id}/`);
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  };

  
 
  export const therapistWithdrawalRequests = async () => {
    try {
      const response = await API.get(`/admin/get-therapist-withdraw-requests/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  };

  export const clientWithdrawalRequests = async () => {
    try {
      const response = await API.get(`/admin/get-client-withdraw-requests/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  };


  export const processTherapistWithdraw = async (id) => {
    try {
      const response = await API.patch(`/admin/process-therapist-withdraw/${id}/`);
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  };

  export const processClientWithdraw = async (id) => {
    try {
      const response = await API.patch(`/admin/process-client-withdraw/${id}/`);
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  };

export const getInfoForAdminDash = async () => {
  try {
    const response = await API.get(`/admin/reportForAdminDashboard/`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};



export const fetchAllSessions = async () => {
  try {
    const response = await API.get('admin/sessions/');
    return { success: true, data: response.data };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch sessions');
  }
};


export const getAdminNotifications = async () => {
  try {
    const response = await API.get('/admin/get_notifications/');
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    return { success: false, message: errorMessage };
  }
};

export const markAdminNotification = async (id) => {
  try {
    const response = await API.patch('/admin/mark-admin-notification/', { id }); // send as an object
    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    return { success: false, message: errorMessage };
  }
};


export const markAllAdminNotifications = async () => {
  try {
    const response = await API.patch('/admin/mark-all-admin-notifications/');
    return { success: true };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'An error occurred' };
  }
};


 export const getPrices = async () => {
    try {
      const response = await API.get(`/admin/get-prices/`);
      return {
        success: true,
        data: response.data.prices,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  };