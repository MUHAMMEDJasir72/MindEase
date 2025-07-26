import React, { useEffect, useState } from 'react';
import TherapistSidebar from '../../components/Therapist/TherapistSidebar';
import { getAvailableDates, getAvailableSlots, addSlot, removeSlot } from '../../api/therapist';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { showToast } from '../../utils/toast';
import ConfirmDialog from '../../utils/ConfirmDialog';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

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
    const [tempDateForSlot, setTempDateForSlot] = useState(new Date());
    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        onCancel: null
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [datesPerPage] = useState(5); // Show 5 dates per page

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

    const getAvailableTimesForModal = async (date = selectedDateForSlot) => {
    if (!date) return allTimeSlots;

    setIsFetchingTimes(true);
    const dateStr = date.toISOString().split('T')[0];
    const isToday = dateStr === new Date().toISOString().split('T')[0];
    const now = new Date();

    try {
        const response = await getAvailableSlots(dateStr);

        if (response.success) {
            const existingTimes = response.data.map(slot =>
                slot.time.substring(0, 5)
            );

            let filteredSlots = allTimeSlots.filter(slot =>
                !existingTimes.includes(slot.value.substring(0, 5))
            );

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
                showToast(response.message, 'success')
                // Refresh the data from the server after successful removal
                const info = await getAvailableDates();
                
                if (info.success) {
                    setAvailableDates(info.data);
                    
                    // Update selectedDate if it exists in the new data
                    if (selectedDate) {
                        const updatedSelectedDate = info.data.find(date => date.id === selectedDate.id);
                        setSelectedDate(updatedSelectedDate || (info.data.length > 0 ? info.data[0] : null));
                    }
                }else{
                    showToast(info.message, 'error')
                }
                
                // Refresh modal times if modal is open
                if (showAddSlotModal) {
                    const times = await getAvailableTimesForModal();
                    setAvailableTimesForModal(times);
                }
            }else{
                showToast(response.message, 'error');
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
    const today = new Date();
    setSelectedDateForSlot(today);  // Keep it for submission
    setTempDateForSlot(today);      // Local edit
    setSelectedTimes([]);
    setShowAddSlotModal(true);
    setIsFetchingTimes(true);
    try {
        const times = await getAvailableTimesForModal(today);
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
        const newDateStr = tempDateForSlot.toISOString().split('T')[0];
        setSelectedDateForSlot(tempDateForSlot);  // Commit here

        const newSlots = selectedTimes.map(time => ({
            time: time
        }));

        const response = await addSlot({
            date: newDateStr,
            available_times: newSlots
        });

        if (response.success) {
            showToast(response.message, 'success');
        }

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


    // Pagination controls
    const indexOfLastDate = currentPage * datesPerPage;
    const indexOfFirstDate = indexOfLastDate - datesPerPage;
    const currentDates = availableDates.slice(indexOfFirstDate, indexOfLastDate);
    const totalPages = Math.ceil(availableDates.length / datesPerPage);

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
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 border-t pt-4">
                <div className="text-sm text-gray-700 mb-2 sm:mb-0">
                    Showing <span className="font-medium">{indexOfFirstDate + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(indexOfLastDate, availableDates.length)}</span> of{' '}
                    <span className="font-medium">{availableDates.length}</span> dates
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
                            <>
                                <ul className='space-y-2'>
                                    {currentDates.map((dateObj) => (
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
                                {availableDates.length > datesPerPage && (
                                    <PaginationControls />
                                )}
                            </>
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
                                                        onClick={() =>
                                                        setConfirmConfig({
                                                            isOpen: true,
                                                            title: 'Remove Slot',
                                                            message: `Are you sure you want to Remove Slot ${timeSlot.time}?`,
                                                            onConfirm: () => handleRemoveTimeSlot(timeSlot.id),
                                                        })
                                                        }
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
                                            selected={tempDateForSlot}
                                            onChange={(date) => {
                                                setTempDateForSlot(date);
                                                setSelectedTimes([]);
                                                setIsFetchingTimes(true);
                                                getAvailableTimesForModal(date).then(times => {
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
            <ConfirmDialog
                isOpen={confirmConfig.isOpen}
                title={confirmConfig.title}
                message={confirmConfig.message}
                onConfirm={() => {
                    confirmConfig.onConfirm();
                    setConfirmConfig({ ...confirmConfig, isOpen: false });
                }}
                onCancel={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
            />
        </div>
    );
}

export default Availability;