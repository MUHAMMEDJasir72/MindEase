// components/AdminRoute.js
import { Navigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

const UserRoute = ({ children }) => {
  const token = localStorage.getItem("access");


  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decoded = jwtDecode(token);
    if (decoded.role === 'user') {
      return children; // user is admin
    } else if (decoded.role === 'admin') {
      return <Navigate to="/adminDashboard" />; // not admin, redirect
    }else{
      return <Navigate to="/therapistHome" />
    }
  } catch (err) {
    return <Navigate to="/login" />;
  }
};

export default UserRoute;
