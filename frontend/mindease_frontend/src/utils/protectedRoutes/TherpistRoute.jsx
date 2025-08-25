import React, { useEffect, useState } from 'react'
import { getMYInfo } from '../../api/user';
import TherapistSidebar from '../../components/Therapist/TherapistSidebar';
import Forbidden from '../../pages/Error Pages/Forbidden';
import { Navigate } from 'react-router-dom';

function TherpistRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getMYInfo();
        if (res.success) {
          setUser(res.data);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);


  // While fetching user data → show loading
  if (loading) {
    return (
      <div className='flex min-h-screen bg-gray-50'>
        <TherapistSidebar />
        <div className='flex-1 ml-[200px] p-6 flex items-center justify-center'>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }



  if (!user) {
    return <Navigate to="/login" />;
  }

  if(user.current_role === 'therapist' && user.role === 'user'){
    return <Navigate to="/therapistDashboard" />;
  }
  if(user.role === 'user'){
    return <Navigate to="/" />;
  }

  if(user.current_role === 'user'){
    return <Navigate to="/" />;
  }

  if(user.role === 'admin'){
    return <Navigate to="/adminDashboard" />;
  }

  if (user.role === "therapist") {
    return children;
  }

  return <Navigate to="/" />;
};

export default TherpistRoute
