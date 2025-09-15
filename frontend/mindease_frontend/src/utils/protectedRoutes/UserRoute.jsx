// components/UserRoute.js
import { Navigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { getMYInfo } from "../../api/user";
import Navbar from "../../components/users/Navbar";
import AdminDashboard from "../../pages/admin/AdminDashboard";
import TherapistHome from "../../pages/Thearapist/TherapistHome";
import TherapistDashboard from "../../pages/Thearapist/TherapistDashboard";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../../userSlice";
import Home from "../../pages/users/Home";

const UserRoute = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const [loading, setLoading] = useState(true);   // default true
  const [checked, setChecked] = useState(false);  // marks API finished


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
      setChecked(true);
    }
  }, [dispatch]);

  useEffect(() => {
  if (!user) {
    fetchUser();
  } else {
    setLoading(false);
  }
}, [user, fetchUser]);


  // Show loader while checking
  if (loading && !checked) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-1 ml-[200px] p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  if (children?.type === Home) {
    if (user?.role === 'user' && user?.current_role === "therapist") {
      return <TherapistDashboard />;
    }
    if (user?.current_role === "therapist") {
      return <TherapistHome />;
    }
    if (user?.role === "admin") {
      return <AdminDashboard />;
    }
    return <Home />;
  }



  // Only redirect after we *know* the API result
  if (checked && !user) {
    return <Navigate to="/login" />;
  }

  // Role-based routing
  if (user?.role === "admin") {
    return <AdminDashboard />;
  }

  if (user?.current_role === "therapist" && user?.role === "user") {
    return <TherapistDashboard />;
  }

  if (user?.current_role === "therapist") {
    return <TherapistHome />;
  }

  return children;
};

export default UserRoute;
