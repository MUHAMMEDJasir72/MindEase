import { Navigate } from "react-router-dom";
import Forbidden from "../../pages/Error Pages/Forbidden";
import { useCallback, useEffect, useState } from "react";
import { getMYInfo } from "../../api/user";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../userSlice";

const AdminRoute = ({ children }) => {
  const user = useSelector((state)=> state.user.user)
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch()

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
      }
    }, [dispatch]);
  
useEffect(() => {
  if (!user) {
    fetchUser();
  } else {
    setLoading(false);
  }
}, [user, fetchUser]);


  // While fetching user data → show loading
  if (loading) {
    return (
      <div className='flex min-h-screen bg-gray-50'>
        <AdminSidebar />
        <div className='flex-1 ml-[200px] p-6 flex items-center justify-center'>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }
 
  // If user is null after loading → redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If user is admin → allow access
  if (user.role === "admin") {
    return children;
  }else if(user.current_role === 'user'){
    return <Navigate to="/" />
  }else if(user.current_role == 'therapist' && user.role == 'user'){
    return <Navigate to="/therapistDashboard" />;
  }else if(user.current_role === 'therapist'){
    return <Navigate to= "/therapistHome" />
  }else{
    return <Forbidden />;
  }

};

export default AdminRoute;
