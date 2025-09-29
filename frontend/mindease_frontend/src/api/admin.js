import { message } from "antd";
import API from "./axiosInstance";


export const getTherapist = async () => {
    try {
      const response = await API.get('/admin/get-therapists/');
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
      const response = await API.get(`/admin/get-therapist-information/${id}/`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  };

  export const getUsers = async () => {
    try {
      const response = await API.get(`/admin/get-users/`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  };

  export const getUserInfo = async (id) => {
    try {
      const response = await API.get(`/admin/get-user-details/${id}/`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  };

  export const approveTherapist = async (id, tier) => {
    try {
      const response = await API.patch(`/admin/approve-therapist/${id}/`, {tier});
      return { success: true};
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  };
export const rejectTherapist = async (id, reason) => {
  try {
    const response = await API.patch(`/admin/reject-therapist/`, {id, reason});
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
      const response = await API.patch(`/admin/change-therapist-status/${id}/`);
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
      const response = await API.patch(`/admin/change-user-status/${id}/`);
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
    const response = await API.get('/admin/get-notifications/');
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




export const changePrice = async (data) => {
  try {
    const response = await API.patch('/admin/prices/', data);
    return { success: true, message: response.data.message };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    return { success: false, message: errorMessage };
  }
};


export const getTierPrices = async () => {
    try {
      const response = await API.get(`/admin/tier-prices/`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  };

export const updateTierPrices = async (data) => {
    try {
      const response = await API.patch(`/admin/tier-prices/`,{data});
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  };

export const updateTherapistTier = async ({id, selectedTier}) => {
    try {
      const response = await API.patch(`/admin/update-tier/`,{id, selectedTier});
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  };

export const getMinimumWithdrawalAmount = async () => {
    try {
      const response = await API.get('/admin/get-minimum-withdrawal-amount/');
      return { success: true, amount: response.data.amount };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  };

export const updateMinimumWithdrawalAmount = async (amount) => {
    try {
      const response = await API.patch('/admin/get-minimum-withdrawal-amount/',{amount});
      return { success: true, message: response.data.message};
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  };