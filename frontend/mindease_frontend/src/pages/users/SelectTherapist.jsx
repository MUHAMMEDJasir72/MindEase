import React, { useState, useEffect } from 'react';
import Navbar from '../../components/users/Navbar';
import { Search, Filter, ArrowUpDown, Menu } from 'lucide-react';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { getTherapist } from '../../api/admin';
import { Link } from 'react-router-dom';
import ViewTherapist from '../../components/users/ViewTherapist';

function SelectTherapist() {
  const [therapists, setTherapists] = useState([]);
  const [filteredTherapists, setFilteredTherapists] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [sortOption, setSortOption] = useState('rating-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const therapistsPerPage = 8;
  const [viewProfile, setViewProfile] = useState({
    open: false,
    id: null,
    close: false
  });

  // Get all unique specialties from therapists
  const allSpecialties = [...new Set(
    therapists.flatMap(t => 
      t.specializations?.map(spec => spec.specializations) || []
    )
  )];

  useEffect(() => {
    const fetchTherapists = async () => {
      setIsLoading(true);
      try {
        const info = await getTherapist();
        if (info.success) {
          setTherapists(info.data);
        }
      } catch (error) {
        console.error("Failed to fetch therapists:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchTherapists();
  }, []);

  useEffect(() => {
    let results = [...therapists];
    
    // Filter by specialty
    if (selectedSpecialties.length > 0) {
      results = results.filter(therapist => 
        therapist.specializations?.some(spec => 
          selectedSpecialties.includes(spec.specializations)
        )
      );
    }
    
    // Search by name
    if (searchTerm) {
      results = results.filter(therapist =>
        therapist.fullname.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sorting
    results = results.sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.fullname.localeCompare(b.fullname);
        case 'name-desc':
          return b.fullname.localeCompare(a.fullname);
        case 'experience-asc':
          return (a.yearsOfExperience || 0) - (b.yearsOfExperience || 0);
        case 'experience-desc':
          return (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0);
        case 'rating-asc':
          return (a.rating || 0) - (b.rating || 0);
        case 'rating-desc':
        default:
          return (b.rating || 0) - (a.rating || 0);
      }
    });
    
    setFilteredTherapists(results);
    setCurrentPage(1); // Reset to first page when filters change
  }, [therapists, searchTerm, selectedSpecialties, sortOption]);

  // Pagination logic
  const indexOfLastTherapist = currentPage * therapistsPerPage;
  const indexOfFirstTherapist = indexOfLastTherapist - therapistsPerPage;
  const currentTherapists = filteredTherapists.slice(indexOfFirstTherapist, indexOfLastTherapist);
  const totalPages = Math.ceil(filteredTherapists.length / therapistsPerPage);

  const toggleSpecialty = (specialty) => {
    setSelectedSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

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
      <div className="flex flex-col sm:flex-row justify-between items-center mt-8">
        <div className="text-sm text-gray-700 mb-4 sm:mb-0">
          Showing <span className="font-medium">{indexOfFirstTherapist + 1}</span> to{' '}
          <span className="font-medium">{Math.min(indexOfLastTherapist, filteredTherapists.length)}</span> of{' '}
          <span className="font-medium">{filteredTherapists.length}</span> therapists
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
              className={`px-3 py-1 rounded-md border ${currentPage === number ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-700 border-gray-300'}`}
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

  if (isLoading) {
    return (
      <div className='flex flex-col md:flex-row min-h-screen bg-gray-50'>
        {/* Mobile Navigation Toggle */}
        <button 
          className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-teal-600 text-white"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
        >
          <Menu size={24} />
        </button>
        
        <div className={`${mobileNavOpen ? 'block' : 'hidden'} md:block w-full md:w-56 md:min-w-[14rem] bg-white shadow-md fixed md:relative z-40 h-full`}>
          <Navbar onClose={() => setMobileNavOpen(false)} />
        </div>
        
        <div className='flex-1 p-4 md:p-8 mt-16 md:mt-0 flex justify-center items-center'>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col md:flex-row min-h-screen bg-gray-50'>
      {/* Mobile Navigation Toggle */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-teal-600 text-white"
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
      >
        <Menu size={24} />
      </button>
      
      {/* Sidebar Navigation */}
      <div className={`${mobileNavOpen ? 'block' : 'hidden'} md:block w-full md:w-56 md:min-w-[14rem] bg-white shadow-md fixed md:relative z-40 h-full`}>
        <Navbar onClose={() => setMobileNavOpen(false)} />
      </div>
      
      <div className='flex-1 p-4 md:p-8 mt-16 md:mt-0'>
        <div className='max-w-7xl mx-auto'>
          <h1 className='text-2xl md:text-3xl font-bold text-gray-800 mb-6'>Find Your <span className='text-teal-600'>Therapist</span></h1>
          
          {/* Search and Filter Bar */}
          <div className='bg-white rounded-xl shadow-md p-4 md:p-6 mb-6'>
            <div className='flex flex-col md:flex-row gap-3 md:gap-4'>
              {/* Search Input */}
              <div className='relative flex-1'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
                <input
                  type='text'
                  placeholder='Search therapists...'
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm md:text-base'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Sort Dropdown */}
              <div className='relative'>
                <select
                  className='appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm md:text-base w-full'
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value='rating-desc'>Highest Rating</option>
                  <option value='rating-asc'>Lowest Rating</option>
                  <option value='experience-desc'>Most Experienced</option>
                  <option value='experience-asc'>Least Experienced</option>
                  <option value='name-asc'>Name (A-Z)</option>
                  <option value='name-desc'>Name (Z-A)</option>
                </select>
                <ArrowUpDown className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none' size={18} />
              </div>

              {/* Mobile Filter Toggle */}
              <button 
                className="md:hidden flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} />
                <span>Filters</span>
              </button>
            </div>
            
            {/* Specialty Filters */}
            <div className={`mt-4 ${showFilters ? 'block' : 'hidden'} md:block`}>
              <h3 className='text-xs md:text-sm font-semibold text-gray-500 mb-2 flex items-center'>
                <Filter size={16} className='mr-2 hidden md:block' /> FILTER BY SPECIALTY
              </h3>
              <div className='flex flex-wrap gap-2'>
                {allSpecialties.map(specialty => (
                  <button
                    key={specialty}
                    className={`px-3 py-1 rounded-full text-xs md:text-sm ${selectedSpecialties.includes(specialty) 
                      ? 'bg-teal-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => toggleSpecialty(specialty)}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Therapists Grid */}
          {currentTherapists.length > 0 ? (
            <>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'>
                {currentTherapists.map(therapist => (
                  <div key={therapist.id} className="bg-white rounded-xl md:rounded-2xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden border border-gray-100">
                    <div className="h-40 md:h-[240px] w-full overflow-hidden relative">
                      <img
                        src={`${import.meta.env.VITE_BASE_URL}${therapist.profile_image}`}
                        alt={therapist.fullname}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          e.target.src = '/images/default-profile.jpg';
                        }}
                      />
                    </div>

                    <div className="p-3 md:p-5">
                      <h3 className="text-lg md:text-xl font-semibold text-gray-800">{therapist.fullname}</h3>
                      <p className="text-teal-600 font-medium text-sm md:text-base mt-1">{therapist.professionalTitle}</p>

                      <div className="mt-2 text-gray-500 text-xs md:text-sm">
                        {therapist.yearsOfExperience} years experience
                      </div>

                      <div className="flex items-center justify-between mt-3 md:mt-4">
                        <button
                          onClick={() => setViewProfile({
                            open: true,
                            id: therapist.id
                          })}
                          className="text-xs md:text-sm text-blue-600 hover:underline font-medium"
                        >
                          Know More
                        </button> 
                      </div>

                      <Link to={`/bookTherapist/${therapist.id}`}>
                        <button className="mt-3 md:mt-5 w-full bg-teal-600 hover:bg-teal-700 text-white py-1 md:py-2 rounded-lg font-medium md:font-semibold transition duration-300 text-sm md:text-base">
                          Book Session
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              {filteredTherapists.length > therapistsPerPage && (
                <PaginationControls />
              )}
            </>
          ) : (
            <div className='bg-white rounded-xl shadow-md p-6 md:p-8 text-center'>
              <h3 className='text-base md:text-lg font-medium text-gray-700'>No therapists found matching your criteria</h3>
              <p className='text-gray-500 mt-2 text-sm md:text-base'>Try adjusting your filters or search term</p>
            </div>
          )}
        </div>
      </div>
      <ViewTherapist
        onOpen={viewProfile.open}
        onClose={() => setViewProfile({ open: false, id: null })}
        id={viewProfile.id}
      />
    </div>
  );
}

export default SelectTherapist;