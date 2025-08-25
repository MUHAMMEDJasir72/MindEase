// src/components/GoogleAuth.jsx
import { useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { basicUrl } from '../../api/axiosInstance';
import { showToast } from '../../utils/toast';
import { googleLogin } from '../../api/user';
import { checkRequested } from '../../api/therapist';

 const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GoogleAuth = ({ mode, current_role }) => {
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
      const response = await googleLogin(credentialResponse.credential, current_role, mode)
      
      if (response.success){
        const role = response.data.role
      

      if (role === 'admin') {
          navigate('/adminDashboard');
      }else if(role === 'user'){
          navigate('/');
      }else {
          const res = await checkRequested();
          if (res.success) {
              navigate('/submited');
          } else {
              navigate('/therapistDashboard');
          }
      }
      showToast(response.data.message, 'success')
    }else {
    showToast(response.message, 'error'); // always correct error
    console.error(response.message);
  }
    
    } catch (error) {
       }
  };

  return <div ref={googleButtonRef} style={{ marginTop: '1rem' }}></div>;
};

export default GoogleAuth;
