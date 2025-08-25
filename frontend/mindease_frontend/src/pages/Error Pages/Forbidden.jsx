import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getMYInfo } from '../../api/user';
import { checkRequested } from '../../api/therapist';

function Forbidden() {
  const [place, setPlace] = useState('/');
  

  useEffect(() => {
    const fetchUser = async () => {
        try {
          const res = await getMYInfo();
          if (res.success) {
            if (res.data.current_role === 'user') {
              setPlace('/');
            } else if(res.data.current_role === 'therapist' && res.data.role === 'therapist'){
              setPlace('/therapistHome');
            }else if (res.data.current_role === 'therapist') {
              const res = await checkRequested();
                if (res.success) {
                    setPlace('/submited');
                } else {
                    setPlace('/therapistDashboard');
                }
            } else if (res.data.current_role === 'admin') {
              setPlace('/adminDashboard');
            } else {
              setPlace('/login');
            }
          } else {
          }
        } catch (error) {
        } finally {
        }
      };
  
      fetchUser();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-6">
      <h1 className="text-6xl font-bold text-yellow-500 mb-4">403</h1>
      <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
      <p className="text-gray-600 mb-6">
        You don’t have permission to access this page.
      </p>
      <Link
        to={place}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded shadow-md transition"
      >
        Go to Home
      </Link>
    </div>
  );
}

export default Forbidden;
