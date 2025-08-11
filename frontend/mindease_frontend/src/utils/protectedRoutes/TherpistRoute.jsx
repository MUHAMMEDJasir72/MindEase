// components/AdminRoute.js
import { Navigate } from "react-router-dom";
import Forbidden from "../../pages/Error Pages/Forbidden";

const TherapistRoute = ({ children }) => {

    const role = localStorage.getItem("current_role")

  try {
    if (role === 'therapist') {
      return children;
    }else{
      return <Forbidden />
    }
  } catch (err) {
    return <Navigate to="/login" />;
  }
};

export default TherapistRoute;
