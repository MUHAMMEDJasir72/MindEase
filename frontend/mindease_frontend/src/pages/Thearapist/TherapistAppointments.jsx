import React, { useState, useEffect } from 'react';
import TherapistSidebar from '../../components/Therapist/TherapistSidebar';
import { Video, MessageCircle, Mic, Calendar, User, Clock, X, Check, Star, AlertTriangle } from 'lucide-react';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { getTherapistAppointments, makeCompleted } from '../../api/therapist';
import { Link, useNavigate } from 'react-router-dom';
import { CancelConfirmationDialog } from '../../components/users/CancelConfirmationDialog';
import { cancelSession } from '../../api/user';
import { showToast } from '../../utils/toast';

function TherapistAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("today");
  const [searchDate, setSearchDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 1;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const handleCancelClick = (id) => {
    setSelectedId(id);
    setIsDialogOpen(true);
  };

  const handleConfirmCancel = async (reason) => {
    if (!selectedId) return;

    setIsProcessing(true);
    const current_role = localStorage.getItem('current_role');
    
    try {
      const response = await cancelSession({ id: selectedId, reason, current_role });
    
      if (response.success) {
        showToast(response.message, 'success');
        fetchAppointments();
      } else {
        showToast(response.message || 'Failed to cancel session', 'error');
      }
    } catch (err) {
      showToast('An error occurred while cancelling the session', 'error');
    } finally {
      setIsProcessing(false);
      setIsDialogOpen(false);
      setSelectedId(null);
    }
  };

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await getTherapistAppointments();
      setAppointments(response.data || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Failed to load appointments. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCompleteSession = async (id) => {
    setIsProcessing(true);
    try {
      const res = await makeCompleted(id);
      if (res.success) {
        showToast(res.message, 'success');
        const response = await getTherapistAppointments();
        setAppointments(response.data);
      } else {
        showToast(res.message, 'error');
      }
    } catch (error) {
      showToast('An error occurred while completing the session', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const parseAppointmentDate = (dateStr, timeStr) => {
    try {
      const formattedDate = dateStr.replace(/,/g, " ");
      return new Date(`${formattedDate} ${timeStr}`);
    } catch (error) {
      console.error("Error parsing date:", error);
      return new Date();
    }
  };

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const formatDate = (dateString) => {
    try {
      const date = parseAppointmentDate(dateString, "12:00 AM");
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatTime = (timeString) => {
    try {
      const [timePart, period] = timeString.split(" ");
      const [hours, minutes] = timePart.split(":").map(Number);
      const date = new Date();
      date.setHours(period.toLowerCase() === 'pm' ? hours + 12 : hours, minutes);
      return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "Invalid time";
    }
  };

  const filterAppointments = () => {
    if (searchDate) {
      return appointments.filter(app => app.date_value === searchDate);
    }

    return appointments
      .filter(app => {
        const appDate = parseAppointmentDate(app.date_value, app.time_value);
        if (activeTab === "today") return appDate >= todayStart && appDate < todayEnd;
        if (activeTab === "upcoming") return appDate >= todayEnd;
        if (activeTab === "completed") return app.status === 'Completed';
        if (activeTab === "cancelled") return app.status === 'Cancelled';
        if (activeTab === "absences") return ['Absent - Client', 'Absent - Therapist', 'No Show - Both'].includes(app.status);
        return false;
      })
      .sort((a, b) => {
        const dateA = parseAppointmentDate(a.date_value, a.time_value);
        const dateB = parseAppointmentDate(b.date_value, b.time_value);
        return activeTab === "completed" || activeTab === "cancelled" || activeTab === "absences" ? dateB - dateA : dateA - dateB;
      });
  };

  const filteredAppointments = filterAppointments();
  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);
  const currentAppointments = filteredAppointments.slice(
    (currentPage - 1) * appointmentsPerPage,
    currentPage * appointmentsPerPage
  );

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
      <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50 gap-4">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{(currentPage - 1) * appointmentsPerPage + 1}</span> to{' '}
          <span className="font-medium">{Math.min(currentPage * appointmentsPerPage, filteredAppointments.length)}</span> of{' '}
          <span className="font-medium">{filteredAppointments.length}</span> appointments
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

  const renderSessionMode = (mode) => {
    const modes = {
      video: {
        icon: <Video size={16} className="text-blue-500" />,
        label: "Video Call",
        color: "bg-blue-100 text-blue-800",
      },
      message: {
        icon: <MessageCircle size={16} className="text-green-500" />,
        label: "Chat",
        color: "bg-green-100 text-green-800",
      },
      voice: {
        icon: <Mic size={16} className="text-purple-500" />,
        label: "Voice Call",
        color: "bg-purple-100 text-purple-800",
      },
    };
    const current = modes[mode.toLowerCase()] || modes.video;
    return (
      <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${current.color}`}>
        {current.icon}
        {current.label}
      </span>
    );
  };

  const renderStatusBadge = (status) => {
    const statusStyles = {
      Scheduled: "bg-blue-100 text-blue-800",
      Completed: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
      Ongoing: "bg-yellow-100 text-yellow-800",
      'Absent - Client': "bg-orange-100 text-orange-800",
      'Absent - Therapist': "bg-orange-100 text-orange-800",
      'No Show - Both': "bg-purple-100 text-purple-800",
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const renderFeedback = (feedback, rating) => {
    if (!feedback) return null;
    
    return (
      <div className="mt-3 bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center gap-1 mb-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i}
              size={16}
              fill={i < (rating || 0) ? "#F59E0B" : "none"}
              stroke="#F59E0B"
            />
          ))}
        </div>
        <p className="text-sm text-gray-700">{feedback}</p>
      </div>
    );
  };

  const isSessionLive = (appointment) => {
    try {
      const now = new Date();
      const dateParts = appointment.date_value.replace(/,/g, '');
      const fullDateTimeString = `${dateParts} ${appointment.time_value}`;
      const sessionStart = new Date(fullDateTimeString);
      const sessionEnd = new Date(sessionStart.getTime() + 60 * 60 * 1000);
      
      return now >= sessionStart && now <= sessionEnd;
    } catch {
      return false;
    }
  };

  const renderAbsenceDetails = (session) => {
    if (!['Absent - Client', 'Absent - Therapist', 'No Show - Both'].includes(session.status)) {
      return null;
    }

    let message = '';
    if (session.status === 'Absent - Client') {
      message = `${session.client_name} didn't attend this session`;
    } else if (session.status === 'Absent - Therapist') {
      message = 'You didn\'t attend this session';
    } else {
      message = 'Both you and the client didn\'t attend this session';
    }

    return (
      <div className="mt-3 bg-orange-50 p-3 rounded-lg border border-orange-100">
        <div className="flex items-start gap-2">
          <AlertTriangle className="text-orange-500 mt-0.5 flex-shrink-0" size={16} />
          <div>
            <p className="text-sm font-medium text-orange-700">{message}</p>
            {session.cancel_reason && (
              <p className="text-sm text-orange-600 mt-1">{session.cancel_reason}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
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
              onClick={() => window.location.reload()} 
              className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md text-sm font-medium"
            >
              Try Again
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
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
            {/* <div className="relative w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="text-gray-400" size={18} />
              </div>
              <input
                type="date"
                value={searchDate}
                onChange={(e) => {
                  setSearchDate(e.target.value);
                  setActiveTab('search');
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
              />
            </div> */}
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
            {['today', 'upcoming', 'completed', 'cancelled', 'absences'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSearchDate('');
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 font-medium text-sm capitalize transition-colors whitespace-nowrap ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'}`}
              >
                {tab === 'absences' ? 'Absences' : tab}
              </button>
            ))}
          </div>

          {/* Appointments Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {currentAppointments.length > 0 ? (
              <>
                <div className="divide-y divide-gray-200">
                  {currentAppointments.map(session => (
                    <div key={session.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Date & Time */}
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center bg-gray-50 p-2 rounded-lg min-w-[70px]">
                            <span className="font-medium text-gray-900">
                              {formatDate(session.date_value)}
                            </span>
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock size={14} />
                              {formatTime(session.time_value)}
                            </span>
                          </div>
                          
                          {/* Client */}
                          <button 
                            onClick={() => navigate(`/clientDetails/${session.client}`)}
                            className="flex items-center gap-3 text-left group"
                          >
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                              {session.client_profile_image ? (
                                <img 
                                  src={`${import.meta.env.VITE_BASE_URL}${session.client_profile_image}`} 
                                  alt={session.client_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-full h-full p-2 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <span className="font-medium text-gray-700 group-hover:text-blue-600 block">
                                {session.client_name || 'Client'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {session.is_new ? 'First Session' : 'Follow-up Session'}
                              </span>
                            </div>
                          </button>
                        </div>

                        {/* Session Info */}
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                          {renderSessionMode(session.session_mode)}
                          {renderStatusBadge(session.status)}
                          
                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            {isSessionLive(session) && session.status === 'Scheduled' && (
                              <Link 
                                to={
                                  session.session_mode === 'message'
                                    ? `/chat/${session.client}/${session.therapist}/${session.id}`
                                    : `/videoCall/${session.therapist}/${session.id}/${session.session_mode}`
                                }
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md flex items-center gap-1"
                              >
                                <Video size={14} />
                                Join Session
                              </Link>
                            )}
                            
                            {session.status === 'Scheduled' && !isSessionLive(session) && (
                              <button
                                onClick={() => handleCancelClick(session.id)}
                                disabled={isProcessing}
                                className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-md flex items-center gap-1 disabled:opacity-50"
                              >
                                {isProcessing && session.id === selectedId ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-400"></div>
                                ) : (
                                  <>
                                    <X size={14} />
                                    Cancel
                                  </>
                                )}
                              </button>
                            )}
                            
                            {session.status === 'Scheduled' && isSessionLive(session) && (
                              <button
                                onClick={() => handleCompleteSession(session.id)}
                                disabled={isProcessing || session.status === 'Completed'}
                                className={`
                                  px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors
                                  ${
                                    session.status === 'Completed' 
                                      ? 'bg-green-100 text-green-800 cursor-default' 
                                      : 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md'
                                  }
                                  disabled:opacity-70 disabled:cursor-not-allowed
                                `}
                              >
                                {isProcessing && session.id === selectedId ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                ) : (
                                  <>
                                    <Check size={16} />
                                    {session.status === 'Completed' ? 'Session Completed' : 'Mark as Completed'}
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Cancellation Reason */}
                      {session.status === 'Cancelled' && session.cancel_reason && (
                        <div className="mt-3 bg-red-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-red-700">
                            {session.canceled_person === 'Therapist'
                              ? 'You canceled this session'
                              : session.canceled_person === 'Client'
                                ? `${session.client_name} canceled this session`
                                : 'This session was canceled'}
                          </p>
                          <p className="text-sm text-red-600 mt-1">{session.cancel_reason}</p>
                        </div>
                      )}

                      {/* Absence Details */}
                      {renderAbsenceDetails(session)}

                      {/* Feedback Display */}
                      {session.status === 'Completed' && renderFeedback(session.feedback, session.rating)}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {filteredAppointments.length > appointmentsPerPage && (
                  <PaginationControls />
                )}
              </>
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                  <Calendar className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No appointments found
                </h3>
                <p className="text-sm text-gray-500">
                  {activeTab === 'today' ? "You don't have any sessions scheduled for today"
                    : activeTab === 'upcoming' ? "You don't have any upcoming sessions"
                    : activeTab === 'completed' ? "No completed sessions to display"
                    : activeTab === 'cancelled' ? "No cancelled sessions to display"
                    : activeTab === 'absences' ? "No absence records found"
                    : "No sessions found for the selected date"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <CancelConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmCancel}
        isLoading={isProcessing}
      />
    </div>
  );
}

export default TherapistAppointments;