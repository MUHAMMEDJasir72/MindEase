// src/components/GoogleAuth.jsx
import { useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { basicUrl } from '../../api/axiosInstance';
import { getMYInfo } from '../../api/user';

 const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GoogleAuth = ({ mode = 'login' }) => {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

 

  useEffect(() => {
    if (window.google && googleButtonRef.current) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleSuccess,
        auto_select: false,
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        type: mode === 'register' ? 'standard' : 'standard', // same type for now
        text: mode === 'register' ? 'signup_with' : 'signin_with',
        shape: 'rectangular',
      });

      // Optional: show prompt for sign-up only
      if (mode === 'register') {
        window.google.accounts.id.prompt(); // shows the One Tap prompt
      }
    }
  }, [mode]);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(`${basicUrl}api/users/auth/google/`, {
        token: credentialResponse.credential,
      });

      localStorage.setItem('loginMethod', 'google');

      // const myInfo = await getMYInfo()

      // if (myInfo.info.role === 'admin') {
      //   localStorage.setItem('current_role', 'admin');
      //   navigate('/adminDashboard');
      // } else {
      //   localStorage.setItem('current_role', 'user');
        navigate('/');
      // }
    } catch (error) {
      console.error('Google login failed:', error.response?.data || error.message);
    }
  };

  return <div ref={googleButtonRef} style={{ marginTop: '1rem' }}></div>;
};

export default GoogleAuth;
