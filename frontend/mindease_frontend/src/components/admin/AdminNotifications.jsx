// TherapistNotification.jsx
import React, { useEffect, useState, useRef } from 'react';
import { BellIcon, CheckIcon, ExclamationIcon } from '@heroicons/react/outline';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { getAdminNotifications, markAdminNotification, markAllAdminNotifications } from '../../api/admin';
import { routerBaseUrl } from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const AdminNotification = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationRef = useRef(null);
  const navigate = useNavigate()

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        // Check if the click is not on the bell icon
        const bellIcon = document.querySelector('.notification-bell');
        if (bellIcon && !bellIcon.contains(event.target)) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Fetch notifications and setup WebSocket
  useEffect(() => {
    const fetchNotifications = async () => {
      const res = await getAdminNotifications();
      if (res.success) {
        setNotifications(res.data);
      } else {
        console.error("Failed to fetch notifications:", res.message);
      }
    };

    fetchNotifications();

    const socket = new ReconnectingWebSocket(`${routerBaseUrl}wss/notifications/`);

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log("Received message:", data);

      if (data?.message) {
        setNotifications(prev => [...prev, data.message]);
      } else {
        console.warn("Invalid WebSocket message format:", data);
      }
    };

    socket.onclose = (e) => {
      console.log("WebSocket disconnected", e);
    };

    socket.onerror = (e) => {
      console.error("WebSocket error", e);
    };

    return () => socket.close();
  }, []);

  const handleMarkAsRead = async (id) => {
    const res = await markAdminNotification(id);
    if (res.success) {
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    }
  };

  const markAllAsRead = async () => {
    const res = await markAllAdminNotifications();
    if (res.success) {
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
    }
  };

   const handleNotificationClick = (notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    setIsOpen(false);

    if (notification.location) {
      navigate(notification.location); // 👈 Redirect using React Router
    } else {
      console.log("No location specified:", notification);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  console.log(notifications)

  return (
    <div className="relative" ref={notificationRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="notification-bell p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative transition-colors duration-200"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-10 border border-gray-200 transform origin-top-right transition-all duration-200 ease-out">
          <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="font-medium text-gray-800">Notifications</h3>
            {notifications.some(n => !n.read) && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsRead();
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              [...notifications].map(notification => (
                <div 
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-all duration-200 ${
                    !notification.read ? 'bg-blue-50 hover:bg-blue-100' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start">
                    {notification.type === 'success' && (
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    )}
                    {notification.type === 'warning' && (
                      <ExclamationIcon className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    )}
                    {notification.type === 'info' && (
                      <div className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex items-center justify-center flex-shrink-0">
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className={`font-medium truncate ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.title}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-400">
                          {new Date(notification.time).toLocaleString()}
                        </p>
                        {!notification.read && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="text-xs font-medium text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-100 transition-colors duration-200"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}


export default AdminNotification;
