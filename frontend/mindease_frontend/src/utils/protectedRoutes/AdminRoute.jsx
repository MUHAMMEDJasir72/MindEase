// components/AdminRoute.js
import { Navigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("access");


  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decoded = jwtDecode(token);
    if (decoded.role === 'admin') {
      return children; // user is admin
    } else if (decoded.role === 'therapist') {
      return <Navigate to="/therapistHome" />; // not admin, redirect
    }else{
      return <Navigate to="/" />
    }
  } catch (err) {
    return <Navigate to="/login" />;
  }
};

export default AdminRoute;
