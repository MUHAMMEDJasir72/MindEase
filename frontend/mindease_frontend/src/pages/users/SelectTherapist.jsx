import React, { useState, useEffect } from 'react';
import Navbar from '../../components/users/Navbar';
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTherapist } from '../../api/admin';
import { Link } from 'react-router-dom';

function SelectTherapist() {
  const [therapists, setTherapists] = useState([]);
  const [filteredTherapists, setFilteredTherapists] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [sortOption, setSortOption] = useState('rating-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const therapistsPerPage = 8;

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

  if (isLoading) {
    return (
      <div className='flex min-h-screen bg-gray-50'>
        <div className='w-56 min-w-[14rem] bg-white shadow-md'>
          <Navbar />
        </div>
        <div className='flex-1 p-8 flex justify-center items-center'>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <div className='w-56 min-w-[14rem] bg-white shadow-md'>
        <Navbar />
      </div>
      
      <div className='flex-1 p-8'>
        <div className='max-w-7xl mx-auto'>
          <h1 className='text-3xl font-bold text-gray-800 mb-8'>Find Your <span className='text-teal-600'>Therapist</span></h1>
          
          {/* Search and Filter Bar */}
          <div className='bg-white rounded-xl shadow-md p-6 mb-8'>
            <div className='flex flex-col md:flex-row gap-4'>
              {/* Search Input */}
              <div className='relative flex-1'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
                <input
                  type='text'
                  placeholder='Search therapists by name...'
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Sort Dropdown */}
              <div className='relative'>
                <select
                  className='appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none'
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
            </div>
            
            {/* Specialty Filters */}
            <div className='mt-6'>
              <h3 className='text-sm font-semibold text-gray-500 mb-2 flex items-center'>
                <Filter size={16} className='mr-2' /> FILTER BY SPECIALTY
              </h3>
              <div className='flex flex-wrap gap-2'>
                {allSpecialties.map(specialty => (
                  <button
                    key={specialty}
                    className={`px-3 py-1 rounded-full text-sm ${selectedSpecialties.includes(specialty) 
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
          
          {/* Results Count */}
          <div className='mb-4 text-gray-600'>
            Showing {indexOfFirstTherapist + 1}-{Math.min(indexOfLastTherapist, filteredTherapists.length)} of {filteredTherapists.length} therapists
          </div>
          
          {/* Therapists Grid */}
          {currentTherapists.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {currentTherapists.map(therapist => (
                <div key={therapist.id} className='bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300'>
                  <div className='h-[244px] overflow-hidden'>
                    <img 
                      src={`${import.meta.env.VITE_BASE_URL}${therapist.profile_image}`} 
                      alt={therapist.fullname} 
                      className='w-full h-full object-cover'
                      onError={(e) => {
                        e.target.src = 'path/to/default/image.jpg'; // Add a fallback image
                      }}
                    />
                  </div>
                  <div className='p-5'>
                    <h3 className='text-xl font-bold text-gray-800'>{therapist.fullname}</h3>
                    <p className='text-teal-600 font-medium mt-1'>{therapist.professionalTitle}</p>
                    
                    <div className='mt-4 text-gray-500 text-sm'>
                      {therapist.yearsOfExperience} years experience
                    </div>
                    <Link to={`/bookTherapist/${therapist.id}`}>
                      <button className='mt-6 w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg font-medium transition duration-300'>
                        Book Session
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='bg-white rounded-xl shadow-md p-8 text-center'>
              <h3 className='text-lg font-medium text-gray-700'>No therapists found matching your criteria</h3>
              <p className='text-gray-500 mt-2'>Try adjusting your filters or search term</p>
            </div>
          )}
          
          {/* Pagination */}
          {filteredTherapists.length > therapistsPerPage && (
            <div className='flex justify-center mt-8'>
              <nav className='inline-flex rounded-md shadow'>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className='px-3 py-2 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <ChevronLeft size={20} />
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 border-t border-b border-gray-300 ${currentPage === i + 1 ? 'bg-teal-50 text-teal-600 font-medium' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className='px-3 py-2 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <ChevronRight size={20} />
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SelectTherapist;