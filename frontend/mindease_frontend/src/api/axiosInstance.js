import axios from 'axios';

export const baseURL = import.meta.env.VITE_API_URL;
export const basicUrl = import.meta.env.VITE_BASE_URL;
export const routerBaseUrl = import.meta.env.VITE_ROUTER_URL;


const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ✅ Helper function to logout user
function logoutUser() {
  console.warn('[Logout] Clearing tokens and redirecting to login');
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  window.location.href = '/login/';  // Redirect to login page
}

// ✅ Request Interceptor: Attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access');
    if (accessToken) {
      config.headers['Authorization'] = 'Bearer ' + accessToken;
      console.log('[Request] Attached access token');
    }
    return config;
  },
  (error) => {
    console.error('[Request Error]', error);
    return Promise.reject(error);
  }
);

// ✅ Response Interceptor: Handle token refresh and account block
axiosInstance.interceptors.response.use(
  (response) => {
    // Success case — just return the response
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // ✅ 1. If therapist is blocked (403 Forbidden)
    if (error.response?.status === 403) {
      console.warn('[Response] 403 Forbidden detected. User may be blocked.');
      logoutUser();
      return Promise.reject(error);
    }

    // ✅ 2. If access token expired (401 Unauthorized) and not yet retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn('[Response] 401 Unauthorized detected. Trying token refresh...');
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh');
      if (!refreshToken) {
        console.warn('[Refresh] No refresh token found. Logging out.');
        logoutUser();
        return Promise.reject(error);
      }

      try {
        // Try refreshing the token
        const refreshResponse = await axios.post(`${baseURL}/users/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = refreshResponse.data.access;
        localStorage.setItem('access', newAccessToken);

        console.log('[Refresh] Token refreshed successfully.');

        // Update the original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('[Refresh] Failed to refresh token:', refreshError.response?.data || refreshError.message);
        logoutUser();
        return Promise.reject(refreshError);
      }
    }

    console.error('[Response Error]', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
