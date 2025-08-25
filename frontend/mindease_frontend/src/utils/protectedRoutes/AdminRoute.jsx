import { Navigate } from "react-router-dom";
import Forbidden from "../../pages/Error Pages/Forbidden";
import { useEffect, useState } from "react";
import { getMYInfo } from "../../api/user";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getMYInfo();
        if (res.success) {
          setUser(res.data);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);


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
  }else if(user.current_role === 'therapist'){
    return <Navigate to= "/therapistHome" />
  }else{
    return <Forbidden />;
  }

};

export default AdminRoute;
