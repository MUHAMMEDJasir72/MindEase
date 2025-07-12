import Register from "./pages/users/Register";
import Login from "./pages/users/Login"
import Home from "./pages/users/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";  
import Profile from "./pages/users/Profile";
import Otp from './pages/users/Otp'
import ChangePassword from "./pages/users/ChangePassword";
import ThearapistDashboard from "./pages/Thearapist/TherapistDashboard";
import RequestForm from "./pages/Thearapist/RequestForm";
import Therapists from "./pages/admin/Therapists";
import TherapistDetails from "./pages/admin/TherapistDetails";
import Users from "./pages/admin/Users";
import TherapistLogin from "./pages/users/TherapistLogin";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TherapistHome from "./pages/Thearapist/TherapistHome";
import ForgotPassword from "./pages/users/ForgotPassword";
import AdminRoute from "./utils/protectedRoutes/AdminRoute";
import TherapistRoute from "./utils/protectedRoutes/TherpistRoute";
import UserRoute from "./utils/protectedRoutes/UserRoute";
import TherapistProfile from "./pages/Thearapist/TherapistProfile";
import TherapistAppointments from "./pages/Thearapist/TherapistAppointments";
import Availability from "./pages/Thearapist/Availability";
import SelectTherapist from "./pages/users/SelectTherapist";
import SpecializeManage from "./pages/admin/SpecializeManage";
import BookTherapist from "./pages/users/BookTherapist";
import Appointments from "./pages/users/Appointments";
import UserDetails from "./pages/admin/UserDetails";
import StripeProvider from "./utils/StripeProvider";
import VideoCall from "./utils/VideoCall";
import Chat from "./utils/Chat";
import Earnings from "./pages/Thearapist/Earnings";
import AdminEarnings from "./pages/admin/AdminEarnings";
import ChatToAdmin from "./pages/Thearapist/ChatToAdmin";
import ChatToTherapists from "./pages/admin/ChatToTherapists";
import AppointmentManagement from "./pages/admin/AppointmentManagement";
import TherapistApplicationSubmitted from "./pages/Thearapist/Submited"

function App() {
  return (
    <BrowserRouter>
        <ToastContainer />
      <Routes>

        {/* auth routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} /> 
        <Route path="/otp" element={<Otp />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/therapistLogin" element={<TherapistLogin />} />

        {/* user routes */}
        <Route path="/" element={<UserRoute><Home /></UserRoute>} />
        <Route path="/Profile" element={<UserRoute><Profile /></UserRoute>} />
        <Route path="/change_password" element={<UserRoute><ChangePassword /></UserRoute>} />
        <Route path="/selectTherapist" element={<UserRoute><SelectTherapist/></UserRoute>} />
        <Route path="/bookTherapist/:id" element={<UserRoute><StripeProvider><BookTherapist/></StripeProvider></UserRoute>} />
        <Route path="/appointments" element={<UserRoute><Appointments/></UserRoute>} />
        <Route path="/videoCall/:userId/:roomId/:type" element={<VideoCall/>} />
        <Route path="/chat/:userId/:therapistId" element={<UserRoute><Chat/></UserRoute>} />
       
        {/* therapist routes */}
        <Route path="/therapistDashboard" element={< ThearapistDashboard/>} />
        <Route path="/requestForm" element={< RequestForm/>} /> 
        <Route path="/submited" element={< TherapistApplicationSubmitted/>} />
        <Route path="/therapistHome" element={<TherapistRoute><TherapistHome /></TherapistRoute>} />
        <Route path="/therapistProfile" element={<TherapistRoute><TherapistProfile/></TherapistRoute>} />
        <Route path="/therapistAppointments" element={<TherapistRoute><TherapistAppointments /></TherapistRoute>} />
        <Route path="/availability" element={<TherapistRoute><Availability /></TherapistRoute>} />
        <Route path="/earnings" element={<TherapistRoute><Earnings /></TherapistRoute>} />
        <Route path="/chatToAdmin" element={<TherapistRoute><ChatToAdmin /></TherapistRoute>} />

        {/* admin routes */}
        <Route path="/therapists" element={<AdminRoute>< Therapists/></AdminRoute>} />
        <Route path="/therapistDetails/:id" element={<AdminRoute><TherapistDetails /></AdminRoute>} />
        <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
        <Route path="/adminDashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/specializeManage" element={<AdminRoute><SpecializeManage/></AdminRoute>} />
        <Route path="/userDetails/:id" element={<AdminRoute><UserDetails/></AdminRoute>} />
        <Route path="/adminEarnings" element={<AdminRoute><AdminEarnings/></AdminRoute>} />
        <Route path="/chatToTherapists" element={<AdminRoute><ChatToTherapists/></AdminRoute>} />
        <Route path="/sessionDetails" element={<AdminRoute><AppointmentManagement/></AdminRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
