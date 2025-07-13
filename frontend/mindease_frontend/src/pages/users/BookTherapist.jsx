import React, { useState, useEffect } from 'react';
import { ChevronLeft, Clock, Calendar, User, ArrowLeft, Video, Phone, MessageSquare } from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { getTherapistInformation } from '../../api/admin';
import { createAppointment, createPayment } from '../../api/user';
import { showToast } from '../../utils/toast';
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";


function BookTherapist() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [therapist, setTherapist] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [therapyMode, setTherapyMode] = useState('');
  const [therapyType, setTherapyType] = useState('new');
  const [showSummary, setShowSummary] = useState(false);
  const [selectedDateId, setSelectedDateId] = useState('');
  const [selectedTimeId, setSelectedTimeId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const stripe = useStripe();
  const elements = useElements();

  // Pricing based on therapy mode
  const pricing = {
    video: 1500,  // $75 for video call
    voice: 1000,  // $50 for voice call
    message:500 // $30 for messaging
  };

  // Fetch therapist data
  useEffect(() => {
    const fetchTherapistInfo = async () => {
      setIsLoading(true);
      try {
        const info = await getTherapistInformation(id);
        if (info.success) {
          setTherapist(info.data);
        }
      } catch (error) {
        console.error("Failed to fetch therapist:", error);
        showToast("Failed to load therapist information", "error");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchTherapistInfo();
    }
  }, [id]);

  const handleDateSelect = (date) => {
    const selectedSlot = therapist.availabilities?.find(slot => slot.date === date);
    setSelectedDate(date);
    setSelectedDateId(selectedSlot?.id);
    setSelectedTime('');
    setSelectedTimeId('');
    setTherapyMode('');
    setTherapyType('new');
    setShowSummary(false);
  };

  const handleTimeSelect = (time) => {
    const selectedSlot = therapist.availabilities?.find(slot => slot.date === selectedDate);
    const selectedTime = selectedSlot?.available_times?.find(t => t.time === time);
    setSelectedTime(time);
    setSelectedTimeId(selectedTime?.id);
    setShowSummary(true);
  };

  const handleContinue = async () => {
    if (!stripe || !elements) {
      return;
    }
  
    setIsProcessingPayment(true);
   
    const appointment = {
      therapist: therapist.id,
      date: selectedDateId,
      time: selectedTimeId,
      mode: therapyMode,
      type: therapyType,
      price: pricing[therapyMode],
    };
  
    try {
      // Step 1: Create the payment intent and get clientSecret
      const res = await createPayment(appointment.price);
      if (!res.success) {
        throw new Error(res.message || "Payment creation failed.");
      }
  
      const { clientSecret } = res;
  
      // Step 2: Confirm the card payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });
  
      if (result.error) {
        showToast(result.error.message, "error");
      } else {
        if (result.paymentIntent.status === "succeeded") {
          // Step 3: Create the appointment if payment was successful
          const response = await createAppointment(appointment);
          if (response.success) {
            showToast(response.message, 'success');
            navigate('/appointments');
          } else {
            showToast(response.message, 'error');
          }
        }
      }
    } catch (error) {
      showToast(error.message || "An error occurred during payment.", "error");
    } finally {
      setIsProcessingPayment(false);
    }
  };
  
  // Therapy mode options
  const therapyModes = [
    { value: 'video', label: 'Video Call', icon: Video },
    { value: 'voice', label: 'Voice Call', icon: Phone },
    { value: 'message', label: 'Messaging', icon: MessageSquare }
  ];

  // Therapy type options
  const therapyTypes = [
    { value: 'new', label: 'New Session' },
    { value: 'followup', label: 'Follow Up Session' }
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        {/* Back button for mobile */}
        <button 
          onClick={() => navigate(-1)}
          className="md:hidden fixed top-4 left-4 z-10 bg-white p-2 rounded-full shadow"
        >
          <ArrowLeft size={24} />
        </button>

        {/* Loading spinner */}
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Back button for mobile */}
      <button 
        onClick={() => navigate(-1)}
        className="md:hidden fixed top-4 left-4 z-10 bg-white p-2 rounded-full shadow"
      >
        <ArrowLeft size={24} />
      </button>

      {/* Therapist Info Sidebar */}
      <div className="hidden md:block w-80 min-w-[20rem] bg-white p-6 shadow-md">
        <div className="flex flex-col items-center mb-6">
          <img 
            src={`${import.meta.env.VITE_BASE_URL}${therapist.profile_image}`} 
            alt={therapist.fullname}
            className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-teal-100"
          />
          <h2 className="text-xl font-bold text-gray-800">{therapist.fullname}</h2>
          <p className="text-teal-600 font-medium">{therapist.professionalTitle}</p>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">Specializes In</h3>
          <div className="flex flex-wrap gap-2 items-center">
            {therapist.specializations?.map((spec, index) => (
              <span key={index} className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm">
                {spec.specializations}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => navigate(`/therapist-profile/${therapist.id}`)}
            className="w-full flex items-center justify-center gap-2 bg-white border border-teal-600 text-teal-600 py-2 rounded-lg font-medium hover:bg-teal-50 transition"
          >
            <User size={18} /> View Full Profile
          </button>
          <button 
            onClick={() => navigate('/select-therapist')}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
          >
            <ChevronLeft size={18} /> Change Therapist
          </button>
        </div>
      </div>

      {/* Booking Main Content */}
      <div className="flex-1 p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          {/* Mobile Therapist Info */}
          <div className="md:hidden mb-8">
            <div className="flex items-center gap-4 mb-6">
              <img 
                src={`${import.meta.env.VITE_BASE_URL}${therapist.profile_image}`} 
                alt={therapist.fullname}
                className="w-16 h-16 rounded-full object-cover border-2 border-teal-100"
              />
              <div>
                <h2 className="text-lg font-bold text-gray-800">{therapist.fullname}</h2>
                <p className="text-teal-600 text-sm">{therapist.professionalTitle}</p>
              </div>
            </div>
            <div className="flex gap-2 mb-6">
              <button 
                onClick={() => navigate(`/therapist-profile/${therapist.id}`)}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-teal-600 text-teal-600 py-2 rounded-lg font-medium text-sm hover:bg-teal-50 transition"
              >
                <User size={16} /> Profile
              </button>
              <button 
                onClick={() => navigate('/select-therapist')}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium text-sm hover:bg-gray-200 transition"
              >
                <ChevronLeft size={16} /> Change
              </button>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">Book Your Session</h1>
          <p className="text-gray-600 mb-8">Select an available date and time for your appointment</p>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Booking Form */}
            <div className="flex-1">
              {/* Calendar Section */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                    <Calendar size={20} className="text-teal-600" /> Available Dates
                  </h2>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-6">
                {therapist?.availabilities?.filter(slot =>
                  Array.isArray(slot.available_times) &&
                  slot.available_times.some(time => !time.is_booked)
                ).length > 0 ? (
                  therapist?.availabilities
                    ?.filter(slot =>
                      Array.isArray(slot.available_times) &&
                      slot.available_times.some(time => !time.is_booked)
                    )
                    .map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => handleDateSelect(slot.date)}
                        className={`py-3 px-4 rounded-lg border ${
                          selectedDate === slot.date
                            ? 'border-teal-600 bg-teal-50 text-teal-700'
                            : 'border-gray-200 hover:border-teal-300'
                        }`}
                      >
                        <div className="font-medium">
                          {new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="text-lg font-bold">
                          {new Date(slot.date).toLocaleDateString('en-US', { day: 'numeric' })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(slot.date).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                      </button>
                    ))
                ) : (
                  <div className="col-span-full py-8 text-center text-gray-500">
                    No available dates at this time
                  </div>
                )}
                </div>
              </div>

              {/* Time Slots Section */}
              {selectedDate && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                      <Clock size={20} className="text-teal-600" /> Available Times for {new Date(selectedDate).toLocaleDateString()}
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-6">
                    {therapist.availabilities
                      ?.find(slot => slot.date === selectedDate)
                      ?.available_times
                      ?.filter(time => !time.is_booked)
                      ?.map((time, index) => (
                        <button
                          key={index}
                          onClick={() => handleTimeSelect(time.time)}
                          className={`py-3 rounded-lg ${selectedTime === time.time 
                            ? 'bg-teal-600 text-white' 
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}`}
                        >
                          {time.time}
                        </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Therapy Mode Selection */}
              {selectedTime && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-700">Session Mode</h2>
                    <p className="text-gray-500 text-sm mt-1">Choose how you'd like to conduct your session</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6">
                    {therapyModes.map((mode) => (
                      <button
                        key={mode.value}
                        onClick={() => setTherapyMode(mode.value)}
                        className={`flex flex-col items-center p-4 rounded-lg border ${therapyMode === mode.value 
                          ? 'border-teal-600 bg-teal-50 text-teal-700' 
                          : 'border-gray-200 hover:border-teal-300'}`}
                      >
                        <mode.icon size={24} className="mb-2" />
                        <span>{mode.label}</span>
                        <span className="text-sm text-gray-500 mt-1">₹{pricing[mode.value]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Therapy Type Selection */}
              {selectedTime && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-700">Session Type</h2>
                    <p className="text-gray-500 text-sm mt-1">Select the type of session you need</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
                    {therapyTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setTherapyType(type.value)}
                        className={`py-3 px-4 rounded-lg border ${therapyType === type.value 
                          ? 'border-teal-600 bg-teal-50 text-teal-700' 
                          : 'border-gray-200 hover:border-teal-300'}`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Booking Summary */}
            {showSummary && (
              <div className="lg:w-80 flex-shrink-0">
                <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-6">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-700">Booking Summary</h2>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Therapist</h3>
                        <p className="font-medium">{therapist.fullname}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                        <p className="font-medium">
                        {new Date(selectedDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }).replace(/ /g, ',')} at {selectedTime}
                        </p>
                      </div>

                      {therapyMode && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Session Mode</h3>
                          <p className="font-medium">
                            {therapyModes.find(m => m.value === therapyMode)?.label}
                          </p>
                        </div>
                      )}

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Session Type</h3>
                        <p className="font-medium">
                          {therapyTypes.find(t => t.value === therapyType)?.label}
                        </p>
                      </div>

                      {therapyMode && (
                        <div className="pt-4 border-t border-gray-100">
                          <div className="flex justify-between items-center">
                            <h3 className="text-sm font-medium text-gray-500">Price</h3>
                            <p className="text-xl font-bold text-teal-600">
                            ₹{pricing[therapyMode]}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <CardElement />
                    <button
                      onClick={handleContinue}
                      disabled={!therapyMode || isProcessingPayment}
                      className={`w-full mt-6 px-6 py-3 rounded-lg font-medium ${
                        therapyMode && !isProcessingPayment
                          ? 'bg-teal-600 hover:bg-teal-700 text-white'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isProcessingPayment ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : 'Continue to Payment'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookTherapist;