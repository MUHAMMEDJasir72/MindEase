import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, Phone, MessageSquare, User, ChevronRight, Star, MessageCircle, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cancelSession, getAppointments, submitFeedback } from '../../api/user';
import Navbar from '../../components/users/Navbar';
import { CancelConfirmationDialog } from '../../components/users/CancelConfirmationDialog';
import { showToast } from '../../utils/toast';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import ViewTherapist from '../../components/users/ViewTherapist';

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
  const [viewProfile, setViewProfile] = useState({
    open: false,
    id: null,
    close: false
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentsPerPage] = useState(3);

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

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Pagination logic
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = appointments.slice(indexOfFirstAppointment, indexOfLastAppointment);
  const totalPages = Math.ceil(appointments.length / appointmentsPerPage);

  const PaginationControls = () => {
    const maxVisiblePages = 5;
    let startPage, endPage;

    if (totalPages <= maxVisiblePages) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const maxPagesBeforeCurrent = Math.floor(maxVisiblePages / 2);
      const maxPagesAfterCurrent = Math.ceil(maxVisiblePages / 2) - 1;
      
      if (currentPage <= maxPagesBeforeCurrent) {
        startPage = 1;
        endPage = maxVisiblePages;
      } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
        startPage = totalPages - maxVisiblePages + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - maxPagesBeforeCurrent;
        endPage = currentPage + maxPagesAfterCurrent;
      }
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 border-t pt-6">
        <div className="text-sm text-gray-700 mb-2 sm:mb-0">
          Showing <span className="font-medium">{indexOfFirstAppointment + 1}</span> to{' '}
          <span className="font-medium">{Math.min(indexOfLastAppointment, appointments.length)}</span> of{' '}
          <span className="font-medium">{appointments.length}</span> appointments
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            aria-label="First page"
          >
            <FiChevronsLeft size={16} />
          </button>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            aria-label="Previous page"
          >
            <FiChevronLeft size={16} />
          </button>

          {startPage > 1 && (
            <span className="px-3 py-1 flex items-center">...</span>
          )}

          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => setCurrentPage(number)}
              className={`px-3 py-1 rounded-md border ${currentPage === number ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300'}`}
            >
              {number}
            </button>
          ))}

          {endPage < totalPages && (
            <span className="px-3 py-1 flex items-center">...</span>
          )}

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            aria-label="Next page"
          >
            <FiChevronRight size={16} />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            aria-label="Last page"
          >
            <FiChevronsRight size={16} />
          </button>
        </div>
      </div>
    );
  };

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
    switch (status.toLowerCase()) {
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
      case 'absent - client':
        return <span className={`${baseClass} bg-orange-100 text-orange-800`}>
          <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
          You Absent
        </span>;
      case 'absent - therapist':
        return <span className={`${baseClass} bg-orange-100 text-orange-800`}>
          <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
          Therapist Absent
        </span>;
      case 'no show - both':
        return <span className={`${baseClass} bg-purple-100 text-purple-800`}>
          <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
          No Show (Both)
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
      fetchAppointments()
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
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Mobile Navigation Toggle */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-teal-600 text-white"
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
      >
        <Menu size={24} />
      </button>
      
      {/* Sidebar Navigation - Hidden on mobile unless toggled */}
      <div className={`${mobileNavOpen ? 'block' : 'hidden'} md:block w-full md:w-56 md:min-w-[14rem] bg-white shadow-md fixed md:relative z-40 h-full`}>
        <Navbar onClose={() => setMobileNavOpen(false)} />
      </div>
      
      <div className="flex-1 p-4 md:p-8 mt-16 md:mt-0">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">Your Therapy Sessions</h1>
          {appointments.length !== 0 && (
            <button 
              onClick={() => navigate('/selectTherapist')}
              className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 text-sm md:text-base"
            >
              <span>Book New</span>
              <ChevronRight size={18} />
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 text-center max-w-2xl mx-auto">
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
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 text-center max-w-2xl mx-auto">
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
          <div className="space-y-4">
            {currentAppointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <div className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src={`${import.meta.env.VITE_BASE_URL}${appointment.therapist_details.profile_image}`} 
                          alt={appointment.therapist_details.full_name}
                          className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-teal-100"
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = '/default-profile.png'
                          }}
                        />
                        {appointment.status === 'upcoming' && (
                          <div className="absolute -bottom-1 -right-1 bg-teal-500 rounded-full p-1">
                            <div className="bg-white rounded-full p-1">
                              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-teal-500 animate-pulse"></div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-base md:text-lg">{appointment.therapist_details.fullname}</h3>
                        <p className="text-teal-600 text-xs md:text-sm">{appointment.therapist_details.professionalTitle}</p>
                        <button
                          onClick={() =>
                            setViewProfile({
                              open: true,
                              id: appointment.therapist_details.id
                            })
                          }
                          className="flex items-center gap-1 text-xs md:text-sm text-blue-600 hover:text-blue-800 mt-1 transition-colors duration-200"
                        >
                          <User size={12} /> View Profile
                        </button>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 mb-1">Date</span>
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="text-xs md:text-sm font-medium">
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
                            <Clock size={14} className="text-gray-400" />
                            <span className="text-xs md:text-sm font-medium">{appointment.time_value}</span>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 mb-1">Mode</span>
                          <div className="flex items-center gap-2">
                            {getModeIcon(appointment.session_mode)}
                            <span className="text-xs md:text-sm font-medium capitalize">
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
                        <div className="bg-teal-50 rounded-lg p-3 md:p-4">
                          <h4 className="font-medium text-gray-700 flex items-center gap-2 text-sm md:text-base">
                            <MessageCircle size={14} /> Your Feedback
                          </h4>
                          <div className="mt-1 md:mt-2 flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i}
                                size={14}
                                fill={i < (appointment.rating || 0) ? "#F59E0B" : "none"}
                                stroke="#F59E0B"
                              />
                            ))}
                          </div>
                          <p className="mt-1 md:mt-2 text-gray-600 text-sm">{appointment.feedback}</p>
                        </div>
                      ) : feedbackOpen === appointment.id ? (
                        <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                          <h4 className="font-medium text-gray-700 mb-1 md:mb-2 text-sm md:text-base">Leave Feedback</h4>
                          <div className="flex items-center gap-1 mb-2 md:mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                                className="focus:outline-none"
                              >
                                <Star 
                                  size={16}
                                  fill={star <= (hoverRating || rating) ? "#F59E0B" : "none"}
                                  stroke="#F59E0B"
                                />
                              </button>
                            ))}
                          </div>
                          <textarea
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
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
                              className="px-3 py-1 text-xs md:text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSubmitFeedback(appointment.id)}
                              className="px-3 py-1 text-xs md:text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                            >
                              Submit
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setFeedbackOpen(appointment.id)}
                          className="text-xs md:text-sm bg-teal-50 text-teal-600 px-3 py-1 md:px-4 md:py-2 rounded-lg hover:bg-teal-100 transition-colors duration-200"
                        >
                          Add Feedback
                        </button>
                      )}
                    </div>
                  )}

                  <div className="mt-4 md:mt-6 pt-4 border-t border-gray-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex flex-wrap gap-2">
                        <div className="bg-gray-50 rounded-lg px-2 py-1 md:px-3 md:py-2">
                          <span className="text-xs text-gray-500">Type:</span>
                          <span className="ml-1 text-xs md:text-sm font-medium capitalize">
                            {appointment.is_new ? 'New' : 'Follow Up'}
                          </span>
                        </div>
                        <div className="bg-gray-50 rounded-lg px-2 py-1 md:px-3 md:py-2">
                          <span className="text-xs text-gray-500">Duration:</span>
                          <span className="ml-1 text-xs md:text-sm font-medium">60 mins</span>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap w-full sm:w-auto">
                        {appointment.status === 'Scheduled' && (
                          <>
                            {!isSessionLive(appointment) && (
                            <>
                              <p className="text-xs text-gray-500 mr-2">You can't cancel session before 1 hour</p>
                              <div>
                                <button 
                                  className="text-xs md:text-sm bg-red-50 text-red-600 px-3 py-1 md:px-4 md:py-2 rounded-lg hover:bg-red-100 transition-colors duration-200"
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
                            <div className="w-full sm:w-auto">
                              <Link
                                to={
                                  appointment.session_mode === 'message'
                                    ? `/chat/${appointment.client}/${appointment.therapist}/${appointment.id}`
                                    : `/videoCall/${appointment.client}/${appointment.id}/${appointment.session_mode}`
                                }
                                className="block w-full"
                              >
                                <button className="
                                  bg-gradient-to-r from-purple-500 to-blue-500
                                  hover:from-blue-500 hover:to-purple-500
                                  text-white font-semibold
                                  py-1 px-3 md:py-2 md:px-5
                                  rounded-full
                                  shadow-lg hover:shadow-xl
                                  transition-all duration-300
                                  transform hover:-translate-y-1
                                  active:translate-y-0
                                  uppercase
                                  tracking-wide
                                  border-none
                                  cursor-pointer
                                  text-xs md:text-sm
                                  w-full sm:w-auto
                                ">
                                  Join Session
                                </button>
                              </Link>
                            </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Information Section */}
                  {['Cancelled', 'Absent - Client', 'Absent - Therapist', 'No Show - Both'].includes(appointment.status) && (
                    <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100">
                      <div className="bg-red-50 rounded-lg p-3 md:p-4">
                        {appointment.status === 'Cancelled' ? (
                          appointment.canceled_person === 'Client' ? (
                            <div className="mt-1">
                              <span className="ml-2 text-xs md:text-sm font-medium text-red-700">
                                You cancelled this session
                              </span>
                            </div>
                          ) : (
                            <div className="mt-1">
                              <span className="ml-2 text-xs md:text-sm font-medium text-red-700">
                                {appointment.therapist_details.fullname} cancelled this session
                              </span>
                            </div>
                          )
                        ) : appointment.status === 'Absent - Client' ? (
                          <div className="mt-1">
                            <span className="ml-2 text-xs md:text-sm font-medium text-red-700">
                              You didn't attend this session
                            </span>
                          </div>
                        ) : appointment.status === 'Absent - Therapist' ? (
                          <div className="mt-1">
                            <span className="ml-2 text-xs md:text-sm font-medium text-red-700">
                              Therapist didn't attend this session
                            </span>
                          </div>
                        ) : (
                          <div className="mt-1">
                            <span className="ml-2 text-xs md:text-sm font-medium text-red-700">
                              Both you and therapist didn't attend this session
                            </span>
                          </div>
                        )}
                        
                        {appointment.cancel_reason && (
                          <div className="mt-1">
                            <p className="mt-1 text-xs md:text-sm text-red-600 whitespace-pre-line">
                              {appointment.cancel_reason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {appointments.length > appointmentsPerPage && (
              <PaginationControls />
            )}
          </div>
        )}
        <ViewTherapist
          onOpen={viewProfile.open}
          onClose={() => setViewProfile({ open: false, id: null })}
          id={viewProfile.id}
        />
      </div>
    </div>
  );
}

export default Appointments;