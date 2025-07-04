import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import AdminTherapistChat from '../../components/Therapist/AdminTherapistChat';
import { getAllTherapist, getTherapist } from '../../api/admin';
import { User } from 'lucide-react';

function ChatToTherapists() {
  const [therapists, setTherapists] = useState([]);
  const [admin, setAdmin] = useState(localStorage.getItem('id'))
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  
    const fetchTherapists = async () => {
      try {
        const response = await getAllTherapist();
        if (response.success) {
          setTherapists(response.data);
        }
      } catch (error) {
        console.error('Error fetching therapists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTherapists();
  }, []);

 

  //   console.log('sender',a)
  console.log('thera',therapists)

  return (
    <div className="flex min-h-screen w-full">
      {/* Admin Sidebar - fixed width */}
      <div className="w-56 fixed h-screen z-50">
        <AdminSidebar />
      </div>

      {/* Main content - offset by sidebar width */}
      <div className="flex-grow ml-56 w-[calc(100%-14rem)] flex h-screen">
        {/* Chat window - takes 70% width */}
        <div className="w-3/4 border-r border-gray-200 h-full">
          {selectedTherapist ? (
            <AdminTherapistChat 
              roomName={`${admin}-${selectedTherapist.user.id}`} 
              sender={localStorage.getItem('id')} 
              receiver={selectedTherapist.user.id} 
            />
          ) : (
            <div className="flex justify-center items-center h-full bg-gray-50">
              <p className="text-lg text-gray-500">
                Select a therapist to start chatting
              </p>
            </div>
          )}
        </div>

        {/* Therapists list - takes 30% width */}
        <div className="w-1/4 h-full overflow-y-auto bg-white">
          <h3 className="p-4 text-lg font-bold">Therapists</h3>
          <div className="border-b border-gray-200"></div>
          
          {loading ? (
            <div className="flex justify-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {therapists.map((therapist) => (
                <li 
                  key={therapist.id}
                  onClick={() => setSelectedTherapist(therapist)}
                  className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedTherapist?.id === therapist.id ? 'bg-blue-50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {therapist.fullname}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {therapist.professionalTitle}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatToTherapists;