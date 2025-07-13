import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getUsers } from '../../api/admin';
import { Link } from 'react-router-dom';

function Users() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'fullname', direction: 'ascending' });
  const [filters, setFilters] = useState({
    status: 'all',
    gender: 'all'
  });
  const [isLoading, setIsLoading] = useState(true);

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
      // Handle null/undefined values
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
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const info = await getUsers();
        if (info.success) {
          console.log('Fetched data:', info.data);
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
                placeholder='Search by name, email or phone...'
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
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
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
                      <Link to={`/userDetails/${user.id}`}><td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        <button className='text-blue-600 hover:text-blue-900 mr-3'>View</button>
                      </td></Link>
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
        </div>
        
        {/* Pagination would go here */}
        {filteredUsers.length > 0 && (
          <div className='mt-4 flex justify-between items-center bg-white px-4 py-3 rounded-b-lg shadow'>
            <div className='text-sm text-gray-700'>
              Showing <span className='font-medium'>1</span> to <span className='font-medium'>{filteredUsers.length}</span> of{' '}
              <span className='font-medium'>{users.length}</span> results
            </div>
            <div className='flex space-x-2'>
              <button className='px-3 py-1 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'>
                Previous
              </button>
              <button className='px-3 py-1 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'>
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;