import React from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { ChevronRight, Search, Filter, UserCheck, UserX, ChevronLeft, Eye, UserMinus } from "lucide-react";
import { getAllTherapist } from '../../api/admin';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminNotification from '../../components/admin/AdminNotifications';

function Therapists() {
  const [therapists, setTherapists] = useState([]);
  const [activeTab, setActiveTab] = useState('therapists');
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTherpists = async () => {
      const info = await getAllTherapist();
      if (info.success) {
        setTherapists(info.data);
        if (info.data.length > 0) {
          setSelectedTherapist(info.data[0]);
        }
      }
      setIsLoading(false);
    };
  
    fetchTherpists();
  }, []);

  const handleTherapistSelect = (therapist) => {
    setSelectedTherapist(therapist);
  };

  // Filter therapists based on active tab and search term
  const filteredTherapists = therapists.filter(therapist => {
    let statusMatch = false;
    if (activeTab === 'therapists') {
      statusMatch = therapist.status === 'approved';
    } else if (activeTab === 'requests') {
      statusMatch = therapist.status === 'pending';
    } else if (activeTab === 'rejected') {
      statusMatch = therapist.status === 'rejected';
    }
    
    const nameMatch = therapist.user.fullname.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && (searchTerm === '' || nameMatch);
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTherapists = filteredTherapists.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTherapists.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (isLoading) {
    return (
      <div className='flex min-h-screen bg-gray-50'>
        <AdminSidebar />
        <div className='flex-1 ml-[200px] p-6 flex items-center justify-center'>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  console.log(therapists)

  return (
    <div className='flex h-screen bg-gray-100'>
      <AdminSidebar/>
      <div className="fixed top-10 right-20 z-50">
        <AdminNotification />
      </div>
      <div className='flex-1 p-8 overflow-y-auto ml-[220px]'>
        {/* Centered Header with search and filters */}
        <div className='flex flex-col items-center mb-6 gap-4'>          
          <div className='flex flex-col md:flex-row items-center gap-4'>
            {/* Centered Search Bar */}
            <div className='relative w-full md:w-64'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Search className='h-4 w-4 text-gray-400' />
              </div>
              <input
                className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                type='text'
                placeholder='Search therapists...'
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            
            {/* Centered Toggle Switch - Now with three options */}
            <div className='relative w-full md:w-96 h-10 bg-white rounded-lg border border-gray-300 flex'>
              <button
                onClick={() => {
                  setActiveTab('therapists');
                  setCurrentPage(1);
                }}
                className={`flex-1 flex items-center justify-center text-sm font-medium z-10 transition-colors duration-200 ${
                  activeTab === 'therapists' ? 'text-white' : 'text-gray-600'
                }`}
              >
                <UserCheck className='h-4 w-4 mr-2' />
                Approved
              </button>
              <button
                onClick={() => {
                  setActiveTab('requests');
                  setCurrentPage(1);
                }}
                className={`flex-1 flex items-center justify-center text-sm font-medium z-10 transition-colors duration-200 ${
                  activeTab === 'requests' ? 'text-white' : 'text-gray-600'
                }`}
              >
                <UserX className='h-4 w-4 mr-2' />
                Pending
              </button>
              <button
                onClick={() => {
                  setActiveTab('rejected');
                  setCurrentPage(1);
                }}
                className={`flex-1 flex items-center justify-center text-sm font-medium z-10 transition-colors duration-200 ${
                  activeTab === 'rejected' ? 'text-white' : 'text-gray-600'
                }`}
              >
                <UserMinus className='h-4 w-4 mr-2' />
                Rejected
              </button>
              <div
                className={`absolute top-0 h-full w-1/3 bg-indigo-600 rounded-md transition-all duration-300 ${
                  activeTab === 'therapists' ? 'left-0' 
                  : activeTab === 'requests' ? 'left-1/3' 
                  : 'left-2/3'
                }`}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Main Content Area - Centered Therapist List */}
        <div className='flex justify-center'>
          {/* Therapist List - Centered with max width */}
          <div className='w-full max-w-4xl bg-white rounded-xl shadow-sm border border-gray-200'>
            <div className='p-4 border-b border-gray-200'>
              <h2 className='text-lg font-semibold text-gray-800'>
                {activeTab === 'therapists' ? 'Approved Therapists' 
                 : activeTab === 'requests' ? 'Pending Requests' 
                 : 'Rejected Therapists'} ({filteredTherapists.length})
              </h2>
            </div>
            {currentTherapists.length > 0 ? (
              <div className='divide-y divide-gray-200'>
                {currentTherapists.map((therapist) => (
                  <div
                    key={therapist.id}
                    onClick={() => handleTherapistSelect(therapist)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedTherapist?.id === therapist.id ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center'>
                        <div className='flex-shrink-0 h-12 w-12 rounded-full overflow-hidden border-2 border-white shadow-sm'>
                          <img
                            className='h-full w-full object-cover'
                            src={`${import.meta.env.VITE_BASE_URL}${therapist.profile_image}`}
                            alt={'profile image'}
                          />
                        </div>
                        <div className='ml-4 flex-1 min-w-0'>
                          <p className='text-sm font-medium text-gray-900 truncate'>
                            {therapist.user.fullname}
                          </p>
                          <p className='text-sm text-gray-500 truncate'>
                            {therapist.professionalTitle || 'Psychologist'}
                          </p>
                          {activeTab === 'requests' && (
                            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1'>
                              Pending Approval
                            </span>
                          )}
                          {activeTab === 'rejected' && (
                            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1'>
                              Rejected
                            </span>
                          )}
                        </div>
                      </div>
                      <Link 
                        to={`/therapistDetails/${therapist.id}`}
                        className="flex items-center justify-center px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        <span>View</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'No therapists match your search' : 'No therapists found'}
              </div>
            )}
            
            {/* Simplified Pagination */}
            {filteredTherapists.length > itemsPerPage && (
              <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(indexOfLastItem, filteredTherapists.length)}</span> of{' '}
                    <span className="font-medium">{filteredTherapists.length}</span> results
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Therapists