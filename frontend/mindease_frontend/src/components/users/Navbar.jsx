import React from 'react';
import { Home, CalendarCheck, User, Wallet } from "lucide-react";
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  // Check if current route matches nav item
  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/appointments', icon: CalendarCheck, label: 'Appointments' },
    { path: '/billing', icon: Wallet, label: 'Billing' }
  ];

  return (
    <nav className='bg-teal-900 w-48 min-w-[12rem] h-screen flex flex-col items-center py-8 fixed left-0 top-0'>
      {/* Logo */}
      <div className='mb-12'>
        <img 
          src='Logo.png' 
          alt='MindCare Logo' 
          className='w-32 h-auto'
        />
      </div>

      {/* Navigation Items */}
      <ul className='w-full flex flex-col items-center gap-8'>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.path} className='w-full flex justify-center'>
              <Link 
                to={item.path}
                className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 ${isActive(item.path) ? 'bg-teal-700 text-white' : 'text-teal-100 hover:bg-teal-800'}`}
                aria-current={isActive(item.path) ? 'page' : undefined}
              >
                <Icon 
                  size={28} 
                  className={`${isActive(item.path) ? 'text-white' : 'text-teal-200'}`} 
                  aria-hidden="true"
                />
                <span className='mt-1 text-sm font-medium'>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default Navbar;