import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '../../api/auth';
import { showToast } from '../../utils/toast';
import {
  Home,
  Users,
  Calendar,
  MessageCircle,
  DollarSign,
  MessageSquare,
  Settings,
  User,
  LogOut,
  CreditCard,
  PieChart
} from 'lucide-react';

// Organized menu items into categories for better structure
const menuItems = [
  // Main sections
  { key: 'dashboard', label: 'Dashboard', icon: <Home size={19} />, path: '/adminDashboard' },
  { key: 'therapists', label: 'Therapists', icon: <User size={19} />, path: '/therapists' },
  { key: 'users', label: 'Users', icon: <Users size={19} />, path: '/users' },
  { key: 'sessionDetails', label: 'sessionDetails', icon: <Calendar size={19} />, path: '/sessionDetails' },
  
  // Financial sections
  { key: 'adminEarnings', label: 'Admin Earnings', icon: <PieChart size={19} />, path: '/adminEarnings' },
  
  // Communication sections
  { key: 'messages', label: 'Messages', icon: <MessageCircle size={19} />, path: '/chatToTherapists' },
  
  // Management sections
  { key: 'specializeManage', label: 'Specializations', icon: <Settings size={19} />, path: '/specializeManage' },
  
  // Logout
  { key: 'logout', label: 'Logout', icon: <LogOut size={19} />, type: 'logout' }
];

function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      const response = await logoutUser();
      if (response.success) {
        navigate('/login');
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        showToast(response.message, 'success');
      } else {
        showToast(response.message, 'error');
      }
    } catch (error) {
      showToast('An error occurred during logout', 'error');
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => {
    // Check if current path starts with the menu item path
    // This helps with nested routes
    return location.pathname.startsWith(path);
  };

  return (
    <div className="bg-[#F2EDED] w-[220px] min-w-[220px] h-screen fixed left-0 top-0 text-black flex flex-col items-center py-6 shadow-lg overflow-y-auto z-50">
      <Link to="/adminDashboard" className="mb-8">
        <img 
          src="/Logo.png" 
          alt="Company Logo" 
          className="w-[140px] hover:opacity-90 transition-opacity" 
        />
      </Link>
      
      <nav className="flex flex-col gap-1 w-full px-4">
        {menuItems.map((item) => (
          item.type === 'logout' ? (
            <button
              key={item.key}
              onClick={handleLogout}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-base w-full text-left
                hover:bg-[#025c5e] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#025c5e]
                hover:shadow-md mt-4`}
              aria-label="Logout"
            >
              <span className="text-gray-700">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ) : (
            <Link 
              to={item.path} 
              key={item.key}
              className={`no-underline flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-base w-full
                ${isActive(item.path) ? 'bg-[#025c5e] text-white shadow-md' : 'hover:bg-[#025c5e] hover:text-white hover:shadow-md'}`}
              aria-current={isActive(item.path) ? 'page' : undefined}
            >
              <span className={`${isActive(item.path) ? 'text-white' : 'text-gray-700'}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          )
        ))}
      </nav>
    </div>
  );
}

export default AdminSidebar;