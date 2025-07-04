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
      const response = await API.get('/admin/get_all_therapist/');
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
      const response = await API.patch(`/admin/approve_therapist/${id}/`);
      return { success: true};
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
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

  
 
  export const getWithdrawRequests = async () => {
    try {
      const response = await API.get(`/admin/get_withdraw_requests/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  };


  export const processWithdraw = async (id) => {
    try {
      const response = await API.patch(`/admin/process_withdraw/${id}/`);
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