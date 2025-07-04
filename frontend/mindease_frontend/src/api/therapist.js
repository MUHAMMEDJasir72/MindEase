import { data } from "react-router-dom";
import API from "./axiosInstance";

export const registerTherapist = async (details) => {
    try {
        const formData = new FormData();

        for (const key in details) {

            
            if (details[key] !== undefined && details[key] !== null) {
                formData.append(key, details[key]);
            }
            
        }

        const response = await API.post("/therapists/request_therapist/", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return { success: true, message: response.data.message };
    } catch (error) {
        
        return { success: false, message:  error?.response?.data?.error || "You have already submitted your therapist details." };
    }
};


export const checkRequested = async () => {
    try {
      const response = await API.get(`/therapists/check_requested/`);
      return { success: response.data.success};
    } catch (error) {
      return { success: false};
    }
  };

  export const checkIsApproved = async () => {
    try {
      const response = await API.get(`/therapists/check_approve/`);
      return { success: true};
    } catch (error) {
      return { success: false};
    }
  };

  export const getProfile = async () => {
    try {
      const response = await API.get(`/therapists/get_profile/`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error fetching profile:', error); 
      return { success: false, message: error.message || 'An error occurred' };
    }
  };

export const addSlot = async (slotData) => {
  try {
    const response = await API.post('/therapists/add_slot/', slotData)
    return { success: true, message: response.data.message}
  }catch (error) {
    return { success: false, message: error.message}
  }
}


export const getAvailableDates = async () => {
  try {
    const response = await API.get(`/therapists/get_availability/`);
    return { success: true, data: response.data.data }; // corrected here
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || error.message || 'An error occurred',
    };
  }
};


export const getTherapistAppointments = async () => {
  try {
    const response = await API.get('/therapists/get_therapist_appointments/');
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Something went wrong',
    };
  }
};



export const getAvailableSlots = async (date) => {
  try {
    const response = await API.get('/therapists/slot/', {
      params: { date },
    });
    return { success: true, data: response.data.available_times };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Something went wrong',
    };
  }
};


// api/therapist.js
export const removeSlot = async (timeSlotId) => {
  try {
    const response = await API.delete(`/therapists/remove_slots/${timeSlotId}/`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to remove time slot',
    };
  }
};






export const updateProfile = async (data) => {
  try {
    const response = await API.put('/therapists/update_therapist_profile/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',  // <-- Important!!
      }
    }); // <-- close with ); not })

    return { success: true, message: response.data.message };
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || "Something went wrong";
    return { success: false, message: errorMsg };
  }
}


export const makeCompleted = async (id) => {
  try {
    const response = await API.patch('/therapists/make_completed/', { id })
    return { success: true, message: response.data.message }
  } catch (error) {
    return { success: false, message: error.message }
  }
}
  
  


export const getTherapistInfo = async (id) => {
  try {
    const response = await API.get(`/therapists/get_therapist_info/${id}/`);
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Error fetching profile:', error); // Optionally log the error
    return { success: false, message: error.message || 'An error occurred' };
  }
};


export const getUserInfo = async (id) => {
  try {
    const response = await API.get(`/therapists/get_user_info/${id}/`);
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Error fetching profile:', error); // Optionally log the error
    return { success: false, message: error.message || 'An error occurred' };
  }
};


export const getWalletAmount = async () => {
  try {
    const response = await API.get(`/therapists/get_wallet_amount/`);
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Error fetching profile:', error); // Optionally log the error
    return { success: false, message: error.message || 'An error occurred' };
  }
};


export const getTransactions = async () => {
  try {
    const response = await API.get(`/therapists/get_transactions/`);
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Error fetching profile:', error); // Optionally log the error
    return { success: false, message: error.message || 'An error occurred' };
  }
};
  

export const requestWithdraw = async (data) => {
  try {
    const response = await API.post(`/therapists/request_withdraw/`, data);
    return { success: true, message: response.data.message };  // <-- FIXED
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || 'An error occurred';
    return { success: false, message: errorMessage };
  }
};


export const getAdmin = async () => {
  try {
    const response = await API.get(`/therapists/get_admin/`);
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Error fetching profile:', error); // Optionally log the error
    return { success: false, message: error.message || 'An error occurred' };
  }
};


export const getAdminTherapistChat = async (sender, receiver) => {
  try {
    const response = await API.get(`/therapists/chat-history/${sender}/${receiver}/`);
    return { success: true, data: response.data };  // response.data is already the chat list
  } catch (error) {
    return { success: false, message: error.message || 'An error occurred' };
  }
};

export const getInfoForTherapistDash = async (id) => {
  try {
    const response = await API.get(`/therapists/reportForTherapistDashboard/${id}/`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};


export const getTherapistNotifications = async () => {
  try {
    const response = await API.get('/therapists/get_notifications/');
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    return { success: false, message: errorMessage };
  }
};



export const getTotalRating = async (id) => {
  try {
    const response = await API.get(`/therapists/get_total_raiting/`);
    return { success: true, rate: response.data.rate };  // Make sure your backend returns `rate`
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    return { success: false, message: errorMessage };
  }
};
