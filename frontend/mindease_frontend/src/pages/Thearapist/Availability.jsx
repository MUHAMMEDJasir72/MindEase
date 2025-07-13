import React, { useEffect, useState } from 'react';
import TherapistSidebar from '../../components/Therapist/TherapistSidebar';
import { getAvailableDates, getAvailableSlots, addSlot, removeSlot } from '../../api/therapist';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function Availability() {
    const [availableDates, setAvailableDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showAddSlotModal, setShowAddSlotModal] = useState(false);
    const [selectedDateForSlot, setSelectedDateForSlot] = useState(new Date());
    const [selectedTimes, setSelectedTimes] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableTimesForModal, setAvailableTimesForModal] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingTimes, setIsFetchingTimes] = useState(false);

    // Format date as "23, April, 2025"
    const formatDisplayDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Format time as "01:00 PM"
    const formatDisplayTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    };

    // Generate time slots from 9 AM to 10 PM in 12-hour format
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 9; hour <= 22; hour++) {
            const displayHour = hour % 12 || 12;
            const ampm = hour >= 12 ? 'PM' : 'AM';
            slots.push({
                value: `${hour.toString().padStart(2, '0')}:00`,
                display: `${displayHour.toString().padStart(2, '0')}:00 ${ampm}`
            });
        }
        return slots;
    };

    const allTimeSlots = generateTimeSlots();

    const getAvailableTimesForModal = async () => {
        if (!selectedDateForSlot) return allTimeSlots;

        setIsFetchingTimes(true);
        const dateStr = selectedDateForSlot.toISOString().split('T')[0];
        const isToday = dateStr === new Date().toISOString().split('T')[0];
        const now = new Date();

        try {
            const response = await getAvailableSlots(dateStr);

            if (response.success) {
                const existingTimes = response.data.map(slot =>
                    slot.time.substring(0, 5) // HH:MM
                );

                let filteredSlots = allTimeSlots.filter(slot =>
                    !existingTimes.includes(slot.value.substring(0, 5))
                );

                // Further filter out past times if selected date is today
                if (isToday) {
                    filteredSlots = filteredSlots.filter(slot => {
                        const [slotHour, slotMinute] = slot.value.split(':').map(Number);
                        const slotTime = new Date();
                        slotTime.setHours(slotHour, slotMinute, 0, 0);
                        return slotTime > now;
                    });
                }

                return filteredSlots;
            }

            return allTimeSlots;
        } catch (error) {
            console.error('Error fetching existing slots:', error);
            return allTimeSlots;
        } finally {
            setIsFetchingTimes(false);
        }
    };

    const handleRemoveTimeSlot = async (timeSlotId) => {
        try {
            setIsSubmitting(true);
            const response = await removeSlot(timeSlotId);
            
            if (response.success) {
                // Refresh the data from the server after successful removal
                const info = await getAvailableDates();
                
                if (info.success) {
                    setAvailableDates(info.data);
                    
                    // Update selectedDate if it exists in the new data
                    if (selectedDate) {
                        const updatedSelectedDate = info.data.find(date => date.id === selectedDate.id);
                        setSelectedDate(updatedSelectedDate || (info.data.length > 0 ? info.data[0] : null));
                    }
                }
                
                // Refresh modal times if modal is open
                if (showAddSlotModal) {
                    const times = await getAvailableTimesForModal();
                    setAvailableTimesForModal(times);
                }
            }
        } catch (error) {
            console.error('Error removing time slot:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
    };

    const handleAddSlot = async () => {
        setSelectedDateForSlot(new Date());
        setSelectedTimes([]);
        setShowAddSlotModal(true);
        setIsFetchingTimes(true);
        try {
            const times = await getAvailableTimesForModal();
            setAvailableTimesForModal(times);
        } finally {
            setIsFetchingTimes(false);
        }
    };

    const toggleTimeSelection = (time) => {
        setSelectedTimes(prev =>
            prev.includes(time)
                ? prev.filter(t => t !== time)
                : [...prev, time]
        );
    };

    const handleSubmitNewSlot = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
    
        try {
            const newDateStr = selectedDateForSlot.toISOString().split('T')[0];
    
            const newSlots = selectedTimes.map(time => ({
                time: time
            }));
    
            // Call the API to add slots
            const response = await addSlot({
                date: newDateStr,
                available_times: newSlots
            });
    
            if (!response.success) {
                throw new Error(response.message || 'Failed to add slots');
            }
    
            // Refresh data from server after successful addition
            const info = await getAvailableDates();
            
            if (info.success) {
                const sortedDates = [...info.data]
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(date => ({
                        ...date,
                        available_times: [...date.available_times].sort((a, b) =>
                            a.time.localeCompare(b.time)
                        )
                    }));
                
                setAvailableDates(sortedDates);
                
                // Select the date we just added slots to
                const updatedDate = sortedDates.find(d => d.date === newDateStr);
                if (updatedDate) {
                    setSelectedDate(updatedDate);
                }
            }
            
            setShowAddSlotModal(false);
    
        } catch (error) {
            console.error('Error adding slots:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Fetch available dates on component mount and when needed
    useEffect(() => {
        const fetchDates = async () => {
            try {
                setIsLoading(true);
                const info = await getAvailableDates();
                
                if (info.success) {
                    const sortedDates = [...info.data]
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .map(date => ({
                            ...date,
                            available_times: [...date.available_times].sort((a, b) =>
                                a.time.localeCompare(b.time)
                            )
                        }));
                    
                    setAvailableDates(sortedDates);
                    
                    // Set selected date if none is selected but dates exist
                    if (sortedDates.length > 0 && !selectedDate) {
                        setSelectedDate(sortedDates[0]);
                    } else if (selectedDate) {
                        // Update selected date with fresh data if it exists
                        const updatedSelectedDate = sortedDates.find(date => date.id === selectedDate.id);
                        if (updatedSelectedDate) {
                            setSelectedDate(updatedSelectedDate);
                        } else if (sortedDates.length > 0) {
                            // If current selected date no longer exists, select the first available
                            setSelectedDate(sortedDates[0]);
                        } else {
                            setSelectedDate(null);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching available dates:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchDates();
    }, []); // Only run on component mount

    if (isLoading) {
        return (
            <div className='flex min-h-screen bg-gray-50'>
                <TherapistSidebar />
                <div className='flex-1 ml-[200px] p-6 flex items-center justify-center'>
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className='flex min-h-screen bg-gray-50'>
            <TherapistSidebar />
            <div className='flex-1 ml-[200px] p-6'>
                <div className='flex gap-6'>
                    {/* Left side - Dates list */}
                    <div className='w-1/3 bg-white rounded-lg shadow p-4'>
                        <div className='flex justify-between items-center mb-4'>
                            <h2 className='text-xl font-semibold'>Available Dates</h2>
                            <button 
                                onClick={handleAddSlot}
                                className='bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1'
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                        Adding...
                                    </>
                                ) : (
                                    'Add Slot'
                                )}
                            </button>
                        </div>
                        {availableDates.length > 0 ? (
                            <ul className='space-y-2'>
                                {availableDates.map((dateObj) => (
                                    <li 
                                        key={dateObj.id}
                                        onClick={() => handleDateSelect(dateObj)}
                                        className={`p-3 rounded cursor-pointer ${selectedDate?.id === dateObj.id ? 'bg-blue-100 border-l-4 border-blue-500' : 'hover:bg-gray-100'}`}
                                    >
                                        <div className='font-medium'>{formatDisplayDate(dateObj.date)}</div>
                                        <div className='text-sm text-gray-500'>
                                            {dateObj.available_times.length} slot{dateObj.available_times.length !== 1 ? 's' : ''} available
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No available dates. Click "Add Slot" to create one.</p>
                        )}
                    </div>

                    {/* Right side - Times for selected date */}
                    <div className='flex-1 bg-white rounded-lg shadow p-4'>
                        {selectedDate ? (
                            <>
                                <h2 className='text-xl font-semibold mb-4'>
                                    Available Times for {formatDisplayDate(selectedDate.date)}
                                </h2>
                                {selectedDate.available_times.length > 0 ? (
                                    <div className='grid grid-cols-3 gap-3'>
                                        {selectedDate.available_times.map((timeSlot) => (
                                            <div 
                                                key={timeSlot.id}
                                                className={`p-3 rounded border relative ${
                                                    timeSlot.is_booked 
                                                        ? 'bg-gray-100 text-gray-500 border-gray-300' 
                                                        : 'bg-green-50 border-green-200 hover:bg-green-100'
                                                }`}
                                            >
                                                <div className='font-medium'>
                                                    {formatDisplayTime(timeSlot.time)}
                                                </div>
                                                <div className='text-sm'>
                                                    {timeSlot.is_booked ? 'Booked' : 'Available'}
                                                </div>
                                                {!timeSlot.is_booked && (
                                                    <button
                                                        onClick={() => handleRemoveTimeSlot(timeSlot.id)}
                                                        disabled={isSubmitting}
                                                        className="absolute top-1 right-1 text-red-500 hover:text-red-700 text-lg disabled:opacity-50"
                                                        title="Remove time slot"
                                                    >
                                                        {isSubmitting ? (
                                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-500"></div>
                                                        ) : (
                                                            '×'
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className='text-gray-500'>No time slots available for this date.</p>
                                )}
                            </>
                        ) : (
                            <p className='text-gray-500'>Select a date to view available time slots.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Slot Modal */}
            {showAddSlotModal && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
                    <div className='bg-white rounded-lg p-6 w-full max-w-2xl'>
                        <h3 className='text-lg font-semibold mb-4'>Add New Availability Slots</h3>
                        
                        <form onSubmit={handleSubmitNewSlot}>
                            <div className='grid grid-cols-2 gap-6'>
                                {/* Calendar Section */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Select Date
                                    </label>
                                    <div className='border rounded p-2'>
                                        <DatePicker
                                            selected={selectedDateForSlot}
                                            onChange={(date) => {
                                                setSelectedDateForSlot(date);
                                                setSelectedTimes([]);
                                                setIsFetchingTimes(true);
                                                getAvailableTimesForModal().then(times => {
                                                    setAvailableTimesForModal(times);
                                                    setIsFetchingTimes(false);
                                                });
                                            }}
                                            inline
                                            minDate={new Date()}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                                
                                {/* Time Slots Section */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Available Time Slots (9AM - 10PM)
                                    </label>
                                    <div className='border rounded p-4 h-64 overflow-y-auto'>
                                        {isFetchingTimes ? (
                                            <div className="flex items-center justify-center h-full">
                                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                                            </div>
                                        ) : (
                                            <div className='grid grid-cols-3 gap-2'>
                                                {availableTimesForModal.map((slot) => (
                                                    <button
                                                        key={slot.value}
                                                        type="button"
                                                        onClick={() => toggleTimeSelection(slot.value)}
                                                        className={`p-2 rounded text-sm ${selectedTimes.includes(slot.value) ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                                                    >
                                                        {slot.display}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <p className='text-sm text-gray-500 mt-2'>
                                        Selected: {selectedTimes.length} time slot{selectedTimes.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                            
                            <div className='flex justify-end gap-2 mt-6'>
                                <button
                                    type='button'
                                    onClick={() => setShowAddSlotModal(false)}
                                    className='px-4 py-2 border rounded hover:bg-gray-100'
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    disabled={selectedTimes.length === 0 || isSubmitting}
                                    className={`px-4 py-2 rounded flex items-center gap-2 ${selectedTimes.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                            Adding...
                                        </>
                                    ) : (
                                        'Add Slots'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Availability;