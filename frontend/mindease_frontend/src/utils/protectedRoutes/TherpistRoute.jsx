import React, { useCallback, useEffect, useState } from 'react';
import TherapistSidebar from '../../components/Therapist/TherapistSidebar';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMYInfo } from '../../api/user';
import { setUser } from '../../userSlice';

function TherpistRoute({ children }) {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const res = await getMYInfo();
      if (res.success) {
        dispatch(setUser(res.data));
      } else {
        dispatch(setUser(null));
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      dispatch(setUser(null));
    } finally {
      setLoading(false);
      setChecked(true);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!user) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [user, fetchUser]);

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

  console.log('jasir',user,user.current_role,user.role)

  if (checked && !user) return <Navigate to="/login" />;

  if (user?.current_role === 'therapist' && user?.role === 'user') {
    return <Navigate to="/therapistDashboard" />;
  }
  if (user?.role === 'user' || user?.current_role === 'user') {
    return <Navigate to="/" />;
  }
  if (user?.role === 'admin') {
    return <Navigate to="/adminDashboard" />;
  }
  if (user?.role === 'therapist') {
    return children;
  }

  return <Navigate to="/" />;
}

export default TherpistRoute;
