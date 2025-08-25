import axios from 'axios';
import { logoutUser } from './auth';
import { showToast } from '../utils/toast';

export const baseURL = import.meta.env.VITE_API_URL;
export const basicUrl = import.meta.env.VITE_BASE_URL;
export const routerBaseUrl = import.meta.env.VITE_ROUTER_URL;

const axiosInstance = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ✅ Helper function to logout user
async function handleLogout() {
  try {
    const response = await logoutUser();
    if (response.success) {
      showToast("You account blocked", "error");

      // Delay redirect so toast shows up
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    } else {
      // showToast(response.message, 'error');
    }
  } catch (error) {
    showToast("Something went wrong!", "error");
  }
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

      if (error.response?.status === 403) {
        console.warn('[Response] 403 Forbidden detected. User may be blocked.');
        console.log(error.response.data.detail)
      if (error.response.data?.detail === "You do not have permission to perform this action.") {
        handleLogout();
      }
      return Promise.reject(error);
    }
     console.error('error',error.response.data)
    // If token expired (401) and not already retried
    if (error.response && error.response.status === 401 && error.response.data.detail !== "Not logged in" &&
      error.response.data.detail == 'Authentication credentials were not provided.' &&
      !originalRequest._retry) {
      originalRequest._retry = true;

     
 
      try {
        // call refresh endpoint
        await axiosInstance.post('/users/refresh/', {}, { withCredentials: true });

        // retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.log('Session expired, please login again', 'error');
        handleLogout() // logout flow
        return Promise.reject(refreshError);
      }
    }
 
    return Promise.reject(error);
  }
);


export default axiosInstance;
