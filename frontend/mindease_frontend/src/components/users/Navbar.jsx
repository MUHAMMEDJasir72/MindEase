import React, { useEffect, useState } from 'react';
import { Home, CalendarCheck, User, Wallet, LogIn } from "lucide-react";
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem('id');
    setIsLogin(!!id);
  }, []);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/appointments', icon: CalendarCheck, label: 'Appointments' },
    { path: '/wallet', icon: Wallet, label: 'Wallet' }
  ];

  return (
    <nav className='bg-teal-900 w-56 min-w-[14rem] h-screen flex flex-col items-center py-8 fixed left-0 top-0 z-50'>
      {/* Logo */}
      <div className='mb-16'>
        <img 
          src='Logo.png' 
          alt='MindCare Logo' 
          className='w-32 h-auto'
        />
      </div>

      {/* Navigation Items */}
      <div className='flex flex-col w-full px-6 flex-grow'>
        {isLogin ? (
          <ul className='flex flex-col items-start gap-1'>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.path} className='w-full'>
                  <Link 
                    to={item.path}
                    className={`
                      flex items-center w-full p-3 rounded-lg transition-colors duration-200
                      ${active 
                        ? 'bg-teal-700 text-white font-medium' 
                        : 'text-teal-100 hover:bg-teal-800'
                      }
                    `}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon 
                      size={20} 
                      className={`mr-3 ${active ? 'text-white' : 'text-teal-200'}`} 
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className='flex flex-col justify-center h-full'>
            <Link 
              to="/login"
              className={`
                flex items-center p-3 rounded-lg transition-colors duration-200
                ${isActive('/login') 
                  ? 'bg-teal-700 text-white font-medium' 
                  : 'text-teal-100 hover:bg-teal-800'
                }
              `}
            >
              <LogIn size={20} className="mr-3 text-teal-200" aria-hidden="true" />
              <span>Sign In</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;