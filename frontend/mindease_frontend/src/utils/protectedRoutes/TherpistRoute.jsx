// components/AdminRoute.js
import { Navigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

const TherapistRoute = ({ children }) => {
  const token = localStorage.getItem("access");

    const role = localStorage.getItem("current_role")


  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decoded = jwtDecode(token);
    if (role === 'therapist') {
      return children; // user is admin
    } else if (role === 'admin') {
      return <Navigate to="/adminDashboard" />; // not admin, redirect
    }else{
      return <Navigate to="/" />
    }
  } catch (err) {
    return <Navigate to="/login" />;
  }
};

export default TherapistRoute;
