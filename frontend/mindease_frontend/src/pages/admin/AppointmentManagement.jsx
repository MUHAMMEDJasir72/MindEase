import React, { use, useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { fetchAllSessions } from '../../api/admin';

function AppointmentManagement() {
  // Dummy data for appointments
  const [appointments, setAppointments] = useState([]);

  const [activeTab, setActiveTab] = useState('Scheduled');


    useEffect(() => {
      const fetchSessions = async () => {
        const info = await fetchAllSessions();
        if (info.success) {
          console.log('Fetched data:', info.data)
          setAppointments(info.data);
        }
      };
    
      fetchSessions();
    }, []);



  // Filter appointments based on active tab
  const filteredAppointments = appointments.filter(app => 
    activeTab === 'All' ? true : app.status === activeTab
  );

  // Function to delete feedback
  const deleteFeedback = (appointmentId) => {
    setAppointments(appointments.map(app => 
      app.id === appointmentId ? {...app, feedback: null, rating: null} : app
    ));
  };

  // Function to get session type color
  const getSessionTypeColor = (type) => {
    switch(type) {
      case 'video': return 'bg-purple-100 text-purple-800';
      case 'voice': return 'bg-indigo-100 text-indigo-800';
      case 'message': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 p-8 overflow-auto ml-[220px]">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Appointment Management</h1>
        
        {/* Tabs for categorization */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['Scheduled', 'Completed', 'Cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab} ({appointments.filter(a => a.status === tab).length})
              </button>
            ))}
          </nav>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Therapist</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  {activeTab === 'Completed' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Feedback & Rating</th>
                  )}
                  {activeTab === 'Cancelled' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Cancel Reason</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{appointment.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.clientName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.therapistName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.dateTime}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSessionTypeColor(appointment.sessionType)}`}>
                        {appointment.sessionType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.price}</td>
                    {activeTab === 'Completed' && (
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {appointment.feedback ? (
                          <div className="space-y-2">
                            <p className="text-gray-800">{appointment.feedback}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-4 h-4 ${i < appointment.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <button 
                                onClick={() => deleteFeedback(appointment.id)}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">No feedback</span>
                        )}
                      </td>
                    )}
                    {activeTab === 'Cancelled' && (
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {appointment.cancelReason ? (
                          <p className="text-gray-800">{appointment.cancelReason}</p>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentManagement;