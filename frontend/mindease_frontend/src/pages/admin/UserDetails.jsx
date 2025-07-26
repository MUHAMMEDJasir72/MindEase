import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { format } from 'date-fns';
import {changeUserStatus, getUserInfo} from '../../api/admin'
import { showToast } from '../../utils/toast';
import ConfirmDialog from '../../utils/ConfirmDialog';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackDeleting, setFeedbackDeleting] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);


  // Fetch user details and bookings
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user details
        const userResponse = await getUserInfo(id);
        if (!userResponse.success) throw new Error('Failed to fetch user details');
        
        // Fetch user bookings
        // const bookingsResponse = await getUserBookings(userId);
        // if (!bookingsResponse.success) throw new Error('Failed to fetch bookings');
        console.log('j',userResponse.data)
        
        setUser(userResponse.data);
        // setBookings(bookingsResponse.data);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

   const handleBlock = async () =>{
        const res = await changeUserStatus(id);
        if (res.success){
          showToast('Changed successfully', 'success');
          const info = await getUserInfo(id);
          if (info.success) {
              setUser(info.data)
            console.log("success");
          } else {
            console.log("error");
          }
        }else{
          showToast('Something went wrong', 'error');
        }
        setShowConfirm(false)
      }

  // Handle feedback deletion
  const handleDeleteFeedback = async (bookingId) => {
    // try {
    //   setFeedbackDeleting(bookingId);
    //   const response = await deleteFeedback(bookingId);
      
    //   if (response.success) {
    //     // Update the bookings list to remove the feedback
    //     setBookings(prev => prev.map(booking => 
    //       booking.id === bookingId 
    //         ? { ...booking, feedback: null, rating: null } 
    //         : booking
    //     ));
    //   } else {
    //     throw new Error(response.message || 'Failed to delete feedback');
    //   }
    // } catch (err) {
    //   console.error('Error deleting feedback:', err);
    //   alert(err.message);
    // } finally {
    //   setFeedbackDeleting(null);
    // }
  };

  console.log('user',user)

  if (isLoading) {
    return (
      <div className="flex w-full min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 p-8 ml-[100px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex w-full min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 p-8 overflow-y-auto ml-[220px]">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
            <p className="font-bold">Error</p>
            <p>{error}</p>
            <button 
              onClick={() => navigate(-1)}
              className="mt-2 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Back to Users
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex w-full min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 p-8 overflow-y-auto ml-[220px]">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg">
            <p className="font-bold">Not Found</p>
            <p>User not found</p>
            <button 
              onClick={() => navigate(-1)}
              className="mt-2 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Back to Users
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <main className="flex-1 p-8 overflow-y-auto ml-[220px]">
        {/* Back button */}
        <div className=' flex items-center justify-between'>
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Users
        </button>
        <button
            onClick={() => setShowConfirm(true)}
            type="button"
            className={`
              focus:outline-none 
              font-medium 
              rounded-lg 
              text-sm 
              px-5 
              py-2.5 
              me-2 
              mb-2 
              dark:focus:ring-red-900
              ${user?.is_user_active
                ? 'text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700'
                : 'text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700'}
            `}
          >
            {user?.is_user_active ? "Block" : "Unblock"}
          </button>    
        </div>
        
        {/* User Profile Header */}
        <header className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden">
                {user.profile_image ? (
                  <img 
                    src={`${import.meta.env.VITE_BASE_URL}${user.profile_image}`} 
                    alt={user.fullname || 'User'} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.parentElement.innerHTML = 
                        `<span class="text-blue-600 font-medium text-2xl">
                          ${(user.fullname || 'U').charAt(0).toUpperCase()}
                        </span>`;
                    }}
                  />
                ) : (
                  <span className="text-blue-600 font-medium text-2xl">
                    {(user.fullname || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {user.username || 'No name provided'}
                  </h1>
                  <p className="text-gray-600">{user.email || 'No email provided'}</p>
                </div>
                <div className="flex gap-3">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full 
                    ${user.is_user_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.is_user_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {user.role || 'User'}
                  </span>
                </div>
              </div>
              
              {/* Additional Info */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="font-medium">{user.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{user.Fullname || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">{user.gender || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium">{user.age || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{user.location || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{user.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Joined Date</p>
                  <p className="font-medium">
                    {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Booking History Section */}
        <section className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">Booking History</h2>
            <p className="text-sm text-gray-500 mt-1">
              {bookings.length} {bookings.length === 1 ? 'appointment' : 'appointments'} found
            </p>
          </div>
          
          {bookings.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Booking Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-gray-800">
                          {booking.service_name || 'Therapy Session'}
                        </h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full 
                          ${booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'}`}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Date & Time</p>
                          <p className="font-medium">
                            {format(new Date(booking.start_time), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Session Type</p>
                          <p className="font-medium capitalize">
                            {booking.session_type || 'video'} call
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Therapist</p>
                          <p className="font-medium">
                            {booking.therapist_name || 'Not assigned'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="font-medium">
                            {booking.duration || 60} minutes
                          </p>
                        </div>
                      </div>
                      
                      {/* Feedback Section */}
                      {booking.feedback && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-800">User Feedback</h4>
                              {booking.rating && (
                                <div className="flex items-center mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <svg
                                      key={i}
                                      className={`w-4 h-4 ${i < booking.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                  <span className="ml-1 text-sm text-gray-600">
                                    {booking.rating}/5
                                  </span>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteFeedback(booking.id)}
                              disabled={feedbackDeleting === booking.id}
                              className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                            >
                              {feedbackDeleting === booking.id ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Removing...
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Remove Feedback
                                </>
                              )}
                            </button>
                          </div>
                          <p className="mt-2 text-gray-700">
                            {booking.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Booking Actions */}
                    <div className="flex flex-col gap-2">
                      <button className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-100">
                        View Details
                      </button>
                      {booking.status === 'upcoming' && (
                        <button className="px-3 py-1 bg-gray-50 text-gray-600 rounded-md text-sm font-medium hover:bg-gray-100">
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
              <p className="mt-1 text-sm text-gray-500">This user hasn't made any appointments yet.</p>
            </div>
          )}
        </section>
        <ConfirmDialog
        isOpen={showConfirm}
        title={user?.is_user_active ? "Block User?" : "Unblock User?"}
        message={user?.is_user_active 
          ? "Are you sure you want to block this user? They will not be able to access their account."
          : "Are you sure you want to unblock this user?"}
        onConfirm={handleBlock}
        onCancel={() => setShowConfirm(false)}
      />

      </main>
    </div>
  );
};

export default UserDetails;