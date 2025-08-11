// components/AdminRoute.js
import { Navigate } from "react-router-dom";
import Forbidden from "../../pages/Error Pages/Forbidden";

const UserRoute = ({ children }) => {
  
  const role = localStorage.getItem("current_role")
  console.log('role',role)

  try {
    if (role === 'user') {
      return children; // user is admin
    }else{
      return <Forbidden />
    }
  } catch (err) {
    return <Navigate to="/login" />;
  }
};

export default UserRoute;
