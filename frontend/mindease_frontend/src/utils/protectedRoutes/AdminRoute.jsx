// components/AdminRoute.js
import { Navigate } from "react-router-dom";
import Forbidden from "../../pages/Error Pages/Forbidden";

const AdminRoute = ({ children }) => {
  const role = localStorage.getItem("current_role")


  try {
    if (role === 'admin') {
      return children; 
    }else{
      return <Forbidden />
    }
  } catch (err) {
    return <Navigate to="/login" />;
  }
};

export default AdminRoute;
