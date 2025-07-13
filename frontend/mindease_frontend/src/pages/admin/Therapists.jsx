import React from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { ChevronRight, Search, Filter, User, UserCheck, UserX, MessageSquare } from "lucide-react";
import { getAllTherapist, getTherapist } from '../../api/admin';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Therapists() {
  const [therapists, setTherapists] = useState([]);
  const [activeTab, setActiveTab] = useState('therapists');
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTherpists = async () => {
      const info = await getAllTherapist();
      if (info.success) {
        console.log('Fetched data:', info.data)
        setTherapists(info.data);
        // Select first therapist by default if available
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

  console.log('ttt',therapists)

  return (
    <div className='flex h-screen bg-gray-100'>
      <AdminSidebar/>
      
      <div className='flex-1 p-8 overflow-y-auto ml-[220px]'>
        {/* Header with search and filters */}
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4'>
          <h1 className='text-2xl font-bold text-gray-800'>Therapist Management</h1>
          
          <div className='flex flex-col md:flex-row w-full md:w-auto gap-4'>
            {/* Search Bar */}
            <div className='relative w-full md:w-64'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Search className='h-4 w-4 text-gray-400' />
              </div>
              <input
                className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                type='text'
                placeholder='Search therapists...'
              />
            </div>
            
            {/* Toggle Switch */}
            <div className='relative w-full md:w-64 h-10 bg-white rounded-lg border border-gray-300 flex'>
              <button
                onClick={() => setActiveTab('therapists')}
                className={`flex-1 flex items-center justify-center text-sm font-medium z-10 transition-colors duration-200 ${
                  activeTab === 'therapists' ? 'text-white' : 'text-gray-600'
                }`}
              >
                <UserCheck className='h-4 w-4 mr-2' />
                Approved
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex-1 flex items-center justify-center text-sm font-medium z-10 transition-colors duration-200 ${
                  activeTab === 'requests' ? 'text-white' : 'text-gray-600'
                }`}
              >
                <UserX className='h-4 w-4 mr-2' />
                Requests
              </button>
              <div
                className={`absolute top-0 h-full w-1/2 bg-indigo-600 rounded-md transition-all duration-300 ${
                  activeTab === 'therapists' ? 'left-0' : 'left-1/2'
                }`}
              ></div>
            </div>
            
            {/* Sort Dropdown */}
            <div className='relative w-full md:w-48'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Filter className='h-4 w-4 text-gray-400' />
              </div>
              <select
                className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                defaultValue=""
              >
                <option value="">Sort by</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className='flex-1 flex flex-col md:flex-row gap-6'>
          {/* Therapist List */}
          <div className='w-full md:w-2/5 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
            <div className='p-4 border-b border-gray-200'>
              <h2 className='text-lg font-semibold text-gray-800'>
                {activeTab === 'therapists' ? 'Approved Therapists' : 'Pending Requests'} ({therapists.filter(t => t.isTherapist === (activeTab === 'therapists')).length})
              </h2>
            </div>
            <div className='divide-y divide-gray-200 overflow-y-auto max-h-[calc(100vh-220px)]'>
              {therapists
                .filter(therapist => therapist.role === (activeTab === 'therapists' ? 'therapist' :'user'))
                .map((therapist) => (
                  <div
                    key={therapist.id}
                    onClick={() => handleTherapistSelect(therapist)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedTherapist?.id === therapist.id ? 'bg-indigo-50' : ''
                    }`}
                  >
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
                          {therapist.fullname}
                        </p>
                        <p className='text-sm text-gray-500 truncate'>
                          {therapist.professionalTitle || 'Psychologist'}
                        </p>
                        {activeTab === 'requests' && (
                          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1'>
                            Pending Approval
                          </span>
                        )}
                      </div>
                      <Link to={`/therapistDetails/${therapist.id}`}><div>
                        <ChevronRight className='h-5 w-5 text-gray-400' />
                      </div></Link>
                    </div>
                  </div>
                ))}
              
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Reusable component for detail items
function DetailItem({ label, value }) {
  return (
    <div>
      <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>{label}</p>
      <p className='mt-1 text-sm text-gray-900'>{value}</p>
    </div>
  )
}

export default Therapists