import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getUsers } from '../../api/admin';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

function Users() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'fullname', direction: 'ascending' });
  const [filters, setFilters] = useState({
    status: 'all',
    gender: 'all'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);

  // Filter and sort users
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = 
        (user.fullname && user.fullname.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
   
      const matchesStatus = 
        filters.status === 'all' || user.is_user_active === (filters.status === 'active');
      
      const matchesGender = 
        filters.gender === 'all' || (user.gender && user.gender.toLowerCase() === filters.gender.toLowerCase());
      
      return matchesSearch && matchesStatus && matchesGender;
    })
    .sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
    setCurrentPage(1);
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
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 bg-white px-4 py-3 rounded-b-lg shadow">
        <div className="text-sm text-gray-700 mb-2 sm:mb-0">
          Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{' '}
          <span className="font-medium">
            {Math.min(indexOfLastUser, filteredUsers.length)}
          </span> of{' '}
          <span className="font-medium">{filteredUsers.length}</span> users
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="First page"
          >
            <FiChevronsLeft />
          </button>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <FiChevronLeft />
          </button>

          {startPage > 1 && (
            <span className="px-2 py-1">...</span>
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
            <span className="px-2 py-1">...</span>
          )}

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <FiChevronRight />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Last page"
          >
            <FiChevronsRight />
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const info = await getUsers();
        if (info.success) {
          setUsers(info.data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

  return (
    <div className='flex h-screen bg-gray-100'>
      <AdminSidebar />
      
      <div className='flex-1 p-8 overflow-y-auto ml-[220px]'>
        <h1 className='text-3xl font-bold text-gray-800 mb-6'>User Management</h1>
        
        {/* Search and Filter Bar */}
        <div className='bg-white rounded-lg shadow p-4 mb-6'>
          <div className='flex flex-col md:flex-row gap-4 flex-wrap'>
            <div className='flex-1 min-w-[200px]'>
              <label htmlFor='search' className='block text-sm font-medium text-gray-700 mb-1'>Search Users</label>
              <input
                type='text'
                id='search'
                placeholder='Search by name or email...'
                className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className='min-w-[150px]'>
              <label htmlFor='status' className='block text-sm font-medium text-gray-700 mb-1'>Status</label>
              <select
                id='status'
                name='status'
                className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value='all'>All Statuses</option>
                <option value='active'>Active</option>
                <option value='inactive'>Inactive</option>
              </select>
            </div>
            
            <div className='min-w-[150px]'>
              <label htmlFor='gender' className='block text-sm font-medium text-gray-700 mb-1'>Gender</label>
              <select
                id='gender'
                name='gender'
                className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                value={filters.gender}
                onChange={handleFilterChange}
              >
                <option value='all'>All Genders</option>
                <option value='male'>Male</option>
                <option value='female'>Female</option>
                <option value='other'>Other</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Users Table */}
        <div className='bg-white rounded-lg shadow overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th 
                    scope='col' 
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100'
                    onClick={() => requestSort('fullname')}
                  >
                    <div className='flex items-center'>
                      Name
                      {sortConfig.key === 'fullname' && (
                        <span className='ml-1'>
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope='col' 
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100'
                    onClick={() => requestSort('email')}
                  >
                    <div className='flex items-center'>
                      Email
                      {sortConfig.key === 'email' && (
                        <span className='ml-1'>
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  
                  <th 
                    scope='col' 
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100'
                    onClick={() => requestSort('age')}
                  >
                    <div className='flex items-center'>
                      Age
                      {sortConfig.key === 'age' && (
                        <span className='ml-1'>
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                 
                  <th 
                    scope='col' 
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100'
                    onClick={() => requestSort('is_active')}
                  >
                    <div className='flex items-center'>
                      Status
                      {sortConfig.key === 'is_active' && (
                        <span className='ml-1'>
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <tr key={user.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden'>
                            {user.profile_image ? (
                              <img 
                                src={`${import.meta.env.VITE_BASE_URL}${user.profile_image}`} 
                                alt={user.fullname || 'User'} 
                                className='h-full w-full object-cover'
                              />
                            ) : (
                              <span className='text-blue-600 font-medium'>
                                {(user.username || 'U').charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className='ml-4'>
                            <div className='text-sm font-medium text-gray-900'>{user.username || 'No name'}</div>
                            <div className='text-sm text-gray-500'>ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {user.email || 'N/A'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {user.age || 'N/A'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${user.is_user_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.is_user_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        <Link to={`/userDetails/${user.id}`}>
                          <button className='text-blue-600 hover:text-blue-900 mr-3'>View</button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan='8' className='px-6 py-4 text-center text-sm text-gray-500'>
                      No users found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {filteredUsers.length > 0 && (
            <PaginationControls />
          )}
        </div>
      </div>
    </div>
  );
}

export default Users;