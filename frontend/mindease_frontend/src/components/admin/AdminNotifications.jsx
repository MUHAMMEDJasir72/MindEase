// TherapistNotification.jsx
import React, { useEffect, useState, useRef } from 'react';
import { BellIcon, CheckIcon, ExclamationIcon } from '@heroicons/react/outline';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { getAdminNotifications } from '../../api/admin';
import { routerBaseUrl } from '../../api/axiosInstance';

const AdminNotification = () => {
   const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

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

  const socket = new ReconnectingWebSocket(`${routerBaseUrl}wss/admin/notifications/`);

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
  const res = await markNotificationAsRead(id);
  if (res.success) {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }
};

const markAllAsRead = async () => {
  const res = await markAllNotifications();
  if (res.success) {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }
};




  const unreadCount = notifications.filter(n => !n.read).length;




  console.log(notifications)
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-10 border border-gray-200">
          <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b border-gray-200">
            <h3 className="font-medium text-gray-800">Notifications</h3>
            <button 
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Mark all as read
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`px-4 py-3 border-b border-gray-100 ${!notification.read ? 'bg-blue-50' : 'bg-white'}`}
                >
                  <div className="flex items-start">
                    {notification.type === 'success' && (
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    )}
                    {notification.type === 'warning' && (
                      <ExclamationIcon className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                    )}
                    {notification.type === 'info' && (
                      <div className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex items-center justify-center">
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.title}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-400">
                          {new Date(notification.time).toLocaleString()}
                        </p>

                        {!notification.read && (
                          <button 
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-xs font-medium text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
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
