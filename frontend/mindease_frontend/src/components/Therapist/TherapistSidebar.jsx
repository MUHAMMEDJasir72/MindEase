import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { logoutUser } from '../../api/auth';
import { showToast } from '../../utils/toast'; // Add this import
import {
  Home,
  Users,
  User,
  CalendarClock,
  CalendarCheck,
  MessageCircle,
  History,
  Wallet,
  LogOut,
} from 'lucide-react';

const menuItems = [
  { key: 'dashboard', label: 'Dashboard', icon: <Home size={19} />, path: '/therapistHome' },
  { key: 'profile', label: 'Profile', icon: <User size={19} />, path: '/therapistProfile' },
  { key: 'appointments', label: 'Appointments', icon: <CalendarClock size={19} />, path: '/TherapistAppointments' },
  { key: 'availability', label: 'Availability', icon: <CalendarCheck size={19} />, path: '/availability' },
  { key: 'Earnings', label: 'Earnings', icon: <Wallet size={19} />, path: '/earnings' },
  { key: 'chatToAdmin', label: 'Chat Admin', icon: <MessageCircle size={19} />, path: '/chatToAdmin' }, // Fixed path
  { key: 'logout', label: 'Logout', icon: <LogOut size={19} />, type: 'logout' },
];

function TherapistSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      const response = await logoutUser();
      if (response.success) {
        navigate('/login');
        localStorage.clear()
        showToast(response.message, 'success');
      } else {
        showToast(response.message, 'error');
      }
    } catch (error) {
      showToast('An error occurred during logout', 'error');
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="bg-[#F2EDED] w-[200px] min-w-[200px] h-screen fixed left-0 top-0 text-black flex flex-col items-center py-6 shadow-lg overflow-y-auto">
      <img 
        src="/Logo.png" 
        alt="Company Logo" 
        className="w-[140px] mb-6" 
        aria-label="Company Logo"
      />
      
      <nav className="flex flex-col gap-2 w-full px-4" aria-label="Main navigation">
        {menuItems.map((item) => (
          item.type === 'logout' ? (
            <button
              key={item.key}
              onClick={handleLogout}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-base w-full text-left
                hover:bg-[#025c5e] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#025c5e]`}
              aria-label="Logout"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ) : (
            <Link 
              to={item.path} 
              key={item.key}
              className={`no-underline flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-base w-full
                ${isActive(item.path) ? 'bg-[#025c5e] text-white' : 'hover:bg-[#025c5e] hover:text-white'}`}
              aria-current={isActive(item.path) ? 'page' : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          )
        ))}
      </nav>
    </div>
  );
}

export default TherapistSidebar;