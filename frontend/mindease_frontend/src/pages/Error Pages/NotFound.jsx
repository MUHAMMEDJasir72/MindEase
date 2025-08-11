import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  const [place, setPlace] = useState('/');
  
    useEffect(() => {
      const role = localStorage.getItem('current_role');
      console.log(role)
      if (role === 'user') {
        setPlace('/');
      } else if (role === 'therapist') {
        setPlace('/therapistHome');
      } else if (role === 'admin') {
        setPlace('/adminDashboard');
      }
    }, []); 
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-6">
      <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-gray-600 mb-6">
        The page you are looking for doesn't exist or has been moved.
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

export default NotFound;
