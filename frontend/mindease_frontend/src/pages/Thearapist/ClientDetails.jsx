import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { getUserDetails } from '../../api/therapist';
import { showToast } from '../../utils/toast';
import TherapistSidebar from '../../components/Therapist/TherapistSidebar';
import { User, Clock, Calendar, MapPin, Phone, Mail, ChevronLeft } from 'lucide-react';
import { getUserInfo } from '../../api/admin';

function ClientDetails() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
console.log('data',clientId)
  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        setLoading(true);
        const response = await getUserInfo(clientId);
        if (response.success) {
            
          setClient(response.data);
        } else {
          setError(response.message || 'Failed to load client details');
        }
      } catch (err) {
        console.error('Error fetching client details:', err);
        setError('An error occurred while loading client details');
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetails();
  }, [clientId]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <TherapistSidebar />
        <div className="flex-1 ml-[200px] p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <TherapistSidebar />
        <div className="flex-1 ml-[200px] p-6 flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 max-w-md text-center">
            <div className="flex justify-center mb-2">
              <X className="h-6 w-6" />
            </div>
            {error}
            <button 
              onClick={() => navigate(-1)} 
              className="mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <TherapistSidebar />
        <div className="flex-1 ml-[200px] p-6 flex items-center justify-center">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-600 max-w-md text-center">
            <div className="flex justify-center mb-2">
              <User className="h-6 w-6" />
            </div>
            Client not found
            <button 
              onClick={() => navigate(-1)} 
              className="mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <TherapistSidebar />
      
      <div className="flex-1 ml-[200px] p-6">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <ChevronLeft size={18} />
            Back to Appointments
          </button>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Client Profile Image */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-teal-100 bg-gray-200">
                    {client.profile_image ? (
                      <img 
                        src={`${import.meta.env.VITE_BASE_URL}${client.profile_image}`}
                        alt={client.fullname}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <User size={48} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Client Details */}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">{client.fullname || 'Client'}</h1>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-teal-50 p-2 rounded-lg text-teal-600">
                        <User size={18} />
                      </div>
                      <div>
                        <h3 className="text-xs text-gray-500">Gender</h3>
                        <p className="font-medium">{client.gender || 'Not specified'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                        <Clock size={18} />
                      </div>
                      <div>
                        <h3 className="text-xs text-gray-500">Age</h3>
                        <p className="font-medium">{client.age || 'Not specified'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <h3 className="text-xs text-gray-500">Location</h3>
                        <p className="font-medium">{client.place || 'Not specified'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-green-50 p-2 rounded-lg text-green-600">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <h3 className="text-xs text-gray-500">Language</h3>
                        <p className="font-medium">{client.language || 'Not specified'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
                        <Phone size={18} />
                      </div>
                      <div>
                        <h3 className="text-xs text-gray-500">Phone</h3>
                        <p className="font-medium">{client.phone || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-red-50 p-2 rounded-lg text-red-600">
                        <Mail size={18} />
                      </div>
                      <div>
                        <h3 className="text-xs text-gray-500">Email</h3>
                        <p className="font-medium">{client.email || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional sections can be added here */}
          {/* For example: Previous sessions with this client, notes, etc. */}
        </div>
      </div>
    </div>
  );
}

export default ClientDetails;