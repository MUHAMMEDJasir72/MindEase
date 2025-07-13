import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, Phone, MessageSquare, User, ChevronRight, Star, MessageCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cancelSession, getAppointments, submitFeedback } from '../../api/user';
import Navbar from '../../components/users/Navbar';
import { CancelConfirmationDialog } from '../../components/users/CancelConfirmationDialog';
import { showToast } from '../../utils/toast';

function Appointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [feedbackOpen, setFeedbackOpen] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const response = await getAppointments();
        if (response.success) {
          setAppointments(response.data);
        } else {
          setError("Failed to load appointments");
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setError("An error occurred while loading appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const getModeIcon = (mode) => {
    const iconClass = "p-2 rounded-lg bg-opacity-20";
    switch (mode) {
      case 'video': 
        return <div className={`${iconClass} bg-blue-500 text-blue-600`}><Video size={18} /></div>;
      case 'voice': 
        return <div className={`${iconClass} bg-green-500 text-green-600`}><Phone size={18} /></div>;
      case 'message': 
        return <div className={`${iconClass} bg-purple-500 text-purple-600`}><MessageSquare size={18} /></div>;
      default: 
        return <div className={`${iconClass} bg-gray-500 text-gray-600`}><Video size={18} /></div>;
    }
  };

  const getStatusBadge = (status) => {
    const baseClass = "px-3 py-1 rounded-full text-xs font-medium flex items-center";
    switch (status) {
      case 'upcoming':
        return <span className={`${baseClass} bg-blue-100 text-blue-800`}>
          <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
          Upcoming
        </span>;
      case 'completed':
        return <span className={`${baseClass} bg-green-100 text-green-800`}>
          <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
          Completed
        </span>;
      case 'cancelled':
        return <span className={`${baseClass} bg-red-100 text-red-800`}>
          <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
          Cancelled
        </span>;
      default:
        return <span className={`${baseClass} bg-gray-100 text-gray-800`}>
          <span className="w-2 h-2 rounded-full bg-gray-500 mr-2"></span>
          Scheduled
        </span>;
    }
  };

  const handleCancelClick = (id) => {
    setSelectedId(id);
    setIsDialogOpen(true);
  };

  const handleConfirmCancel = async (reason) => {
    if (!selectedId) return;

    const current_role = localStorage.getItem('current_role')
  
    const response = await cancelSession({ id: selectedId, reason, current_role });
  
    if (response.success) {
      showToast(response.message, 'success');
  
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === selectedId ? { ...apt, status: 'Cancelled' } : apt
        )
      );
    } else {
      showToast(response.message, 'error');
    }
  
    setIsDialogOpen(false);
    setSelectedId(null);
  };

  const isSessionLive = (appointment) => {
    const now = new Date();
    const dateParts = appointment.date_value.replace(/,/g, '');
    const fullDateTimeString = `${dateParts} ${appointment.time_value}`;
  
    const sessionStart = new Date(fullDateTimeString);
    const sessionEnd = new Date(sessionStart.getTime() + 60 * 60 * 1000);
  
    return now >= sessionStart && now <= sessionEnd;
  };

  const handleSubmitFeedback = async (appointmentId) => {
    if (!feedbackText || rating === 0) {
      showToast('Please provide both feedback and rating', 'error');
      return;
    }


    try {
      const response = await submitFeedback({
        appointment_id: appointmentId,
        feedback: feedbackText,
        rating: rating
      });

      if (response.success) {
        showToast('Feedback submitted successfully!', 'success');
        setAppointments(prev => prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, feedback: feedbackText, rating: rating } 
            : apt
        ));
        setFeedbackOpen(null);
        setFeedbackText('');
        setRating(0);
      } else {
        showToast(response.message || 'Failed to submit feedback', 'error');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showToast('An error occurred while submitting feedback', 'error');
    }
  };


  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex-1 pl-0 md:pl-48 transition-all duration-300">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Your Therapy Sessions</h1>
            {
            appointments.length != 0 &&
            <button 
              onClick={() => navigate('/selectTherapist')}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
            >
              <span>Book New</span>
              <ChevronRight size={18} />
            </button>
            }
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-2xl mx-auto">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700">Error Loading Appointments</h3>
              <p className="text-gray-500 mt-2 mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-2xl mx-auto">
              <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={32} className="text-teal-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-700">No appointments scheduled</h3>
              <p className="text-gray-500 mt-2 mb-6">You don't have any therapy sessions booked yet</p>
              <button 
                onClick={() => navigate('/selectTherapist')}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Book Your First Session
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {appointments.map((appointment) => (
                <div 
                  key={appointment.id} 
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img 
                            src={`${import.meta.env.VITE_BASE_URL}${appointment.therapist_details.profile_image}`} 
                            alt={appointment.therapist_details.full_name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-teal-100"
                            onError={(e) => {
                              e.target.onerror = null; 
                              e.target.src = '/default-profile.png'
                            }}
                          />
                          {appointment.status === 'upcoming' && (
                            <div className="absolute -bottom-1 -right-1 bg-teal-500 rounded-full p-1">
                              <div className="bg-white rounded-full p-1">
                                <div className="w-3 h-3 rounded-full bg-teal-500 animate-pulse"></div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">{appointment.therapist_details.fullname}</h3>
                          <p className="text-teal-600 text-sm">{appointment.therapist_details.professionalTitle}</p>
                          <button
                            onClick={() => navigate(`/therapist-profile/${appointment.therapist_details.id}`)}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-1 transition-colors duration-200"
                          >
                            <User size={14} /> View Profile
                          </button>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 mb-1">Date</span>
                            <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-gray-400" />
                              <span className="text-sm font-medium">
                                {new Date(appointment.date_value).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 mb-1">Time</span>
                            <div className="flex items-center gap-2">
                              <Clock size={16} className="text-gray-400" />
                              <span className="text-sm font-medium">{appointment.time_value}</span>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 mb-1">Mode</span>
                            <div className="flex items-center gap-2">
                              {getModeIcon(appointment.session_mode)}
                              <span className="text-sm font-medium capitalize">
                                {appointment.session_mode === 'video' ? 'Video' : 
                                appointment.session_mode === 'voice' ? 'Voice' : 'Message'}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 mb-1">Status</span>
                            {getStatusBadge(appointment.status.toLowerCase())}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Feedback Section */}
                    {appointment.status === 'Completed' && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        {appointment.feedback ? (
                          <div className="bg-teal-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-700 flex items-center gap-2">
                              <MessageCircle size={16} /> Your Feedback
                            </h4>
                            <div className="mt-2 flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i}
                                  size={16}
                                  fill={i < (appointment.rating || 0) ? "#F59E0B" : "none"}
                                  stroke="#F59E0B"
                                />
                              ))}
                            </div>
                            <p className="mt-2 text-gray-600">{appointment.feedback}</p>
                          </div>
                        ) : feedbackOpen === appointment.id ? (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-700 mb-2">Leave Feedback</h4>
                            <div className="flex items-center gap-1 mb-3">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onMouseEnter={() => setHoverRating(star)}
                                  onMouseLeave={() => setHoverRating(0)}
                                  onClick={() => setRating(star)}
                                  className="focus:outline-none"
                                >
                                  <Star 
                                    size={20}
                                    fill={star <= (hoverRating || rating) ? "#F59E0B" : "none"}
                                    stroke="#F59E0B"
                                  />
                                </button>
                              ))}
                            </div>
                            <textarea
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                              rows="3"
                              placeholder="How was your session?"
                              value={feedbackText}
                              onChange={(e) => setFeedbackText(e.target.value)}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                onClick={() => {
                                  setFeedbackOpen(null);
                                  setFeedbackText('');
                                  setRating(0);
                                }}
                                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSubmitFeedback(appointment.id)}
                                className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                              >
                                Submit
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setFeedbackOpen(appointment.id)}
                            className="text-sm bg-teal-50 text-teal-600 px-4 py-2 rounded-lg hover:bg-teal-100 transition-colors duration-200"
                          >
                            Add Feedback
                          </button>
                        )}
                      </div>
                    )}

                    {/* Cancellation Reason */}
                    {/* {appointment.status === 'Cancelled' && appointment.cancel_reason && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="bg-red-50 rounded-lg p-4">
                          <h4 className="font-medium text-red-700">Cancellation Reason</h4>
                          <p className="mt-1 text-red-600">{appointment.cancel_reason}</p>
                          {appointment.canceled_person && (
                            <p className="mt-1 text-sm text-red-500">
                              Cancelled by: {appointment.canceled_person}
                            </p>
                          )}
                        </div>
                      </div>
                    )} */}

                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex flex-wrap gap-4">
                          <div className="bg-gray-50 rounded-lg px-3 py-2">
                            <span className="text-xs text-gray-500">Session Type:</span>
                            <span className="ml-2 text-sm font-medium capitalize">
                              {appointment.is_new ? 'New Session' : 'Follow Up'}
                            </span>
                          </div>
                          <div className="bg-gray-50 rounded-lg px-3 py-2">
                            <span className="text-xs text-gray-500">Duration:</span>
                            <span className="ml-2 text-sm font-medium">60 mins</span>
                          </div>
                        </div>

                        <div className="flex gap-3 flex-wrap">
                          {appointment.status === 'Scheduled' && (
                            <>
                              {!isSessionLive(appointment) && (
                              <>
                               <h1>You can't cancel session before 1 hour</h1>
                              <div>
                              <button 
                                className="text-sm bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors duration-200"
                                onClick={() => handleCancelClick(appointment.id)}
                              >
                                Cancel
                              </button>
                                 <CancelConfirmationDialog
                                  isOpen={isDialogOpen}
                                  onClose={() => setIsDialogOpen(false)}
                                  onConfirm={handleConfirmCancel}
                                />                                                                                
                              </div>
                              </>
                              )}
                              {isSessionLive(appointment) && (
                              <div>
                                <Link
                                  to={
                                    appointment.session_mode === 'message'
                                      ? `/chat/${appointment.client}/${appointment.therapist}`
                                      : `/videoCall/${appointment.client}/${appointment.id}/${appointment.session_mode}`
                                       
                                  }
                                >
                                <button class="
                                  bg-gradient-to-r from-purple-500 to-blue-500
                                  hover:from-blue-500 hover:to-purple-500
                                  text-white font-semibold
                                  py-2 px-5
                                  rounded-full
                                  shadow-lg hover:shadow-xl
                                  transition-all duration-300
                                  transform hover:-translate-y-1
                                  active:translate-y-0
                                  uppercase
                                  tracking-wide
                                  border-none
                                  cursor-pointer
                                ">
                                  Join
                                </button>
                                </Link>
                              </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Appointments;