// components/UserRoute.js
import { Navigate } from "react-router-dom";
import Forbidden from "../../pages/Error Pages/Forbidden";
import { useEffect, useState } from "react";
import { getMYInfo } from "../../api/user";
import Navbar from "../../components/users/Navbar";
import AdminDashboard from "../../pages/admin/AdminDashboard";
import TherapistHome from "../../pages/Thearapist/TherapistHome";
import TherapistDashboard from "../../pages/Thearapist/TherapistDashboard";

const UserRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getMYInfo();
        if(res.success){
          setUser(res.data)
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);


  if (loading) {
    return (
      <div className='flex min-h-screen bg-gray-50'>
        <Navbar />
        <div className='flex-1 ml-[200px] p-6 flex items-center justify-center'>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

 

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role === "admin") {
    return <AdminDashboard/>;
  }else if(user.current_role === 'therapist' && user.role === 'user'){
    return <TherapistDashboard/>
  }else if(user.current_role === 'therapist'){
    return <TherapistHome/>
  }else{
    return children
  }

};

export default UserRoute;
