import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { FiEdit, FiTrash2, FiPlus, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { createSpecialize, deleteSpecialize, getSpecializations, editSpecialize, getPrices } from '../../api/admin';
import { showToast } from '../../utils/toast';
import ConfirmDialog from '../../utils/ConfirmDialog';

function SpecializeManage() {
  const [specializations, setSpecializations] = useState([]);
  const [prices, setPrices] = useState({
    video_call: 0,
    voice_call: 0,
    message: 0
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [specializationName, setSpecializationName] = useState('');
  const [currentSpecialization, setCurrentSpecialization] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    fetchSpecializations();
    fetchPrices();
  }, []);

  const fetchSpecializations = async () => {
    setIsLoading(true);
    try {
      const info = await getSpecializations();
      if (info.success) {
        setSpecializations(info.data);
      } else {
        console.error('Failed to fetch:', info.error);
        showToast('Failed to load specializations', 'error');
      }
    } catch (error) {
      console.error('Error fetching specializations:', error);
      showToast('Error loading specializations', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPrices = async () => {
    setIsPriceLoading(true);
    try {
      const response = await getPrices();
      if (response.success) {
        setPrices(response.data);
      } else {
        console.error('Failed to fetch prices:', response.error);
        showToast('Failed to load prices', 'error');
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
      showToast('Error loading prices', 'error');
    } finally {
      setIsPriceLoading(false);
    }
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setPrices(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  const savePrices = async () => {
    try {
      const response = await updatePrices(prices);
      if (response.success) {
        showToast('Prices updated successfully', 'success');
        setIsPriceModalOpen(false);
      } else {
        showToast(response.error || 'Failed to update prices', 'error');
      }
    } catch (error) {
      console.error('Error saving prices:', error);
      showToast('Error saving prices', 'error');
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = specializations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(specializations.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
          <span className="font-medium">{Math.min(indexOfLastItem, specializations.length)}</span> of{' '}
          <span className="font-medium">{specializations.length}</span> specializations
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => paginate(1)}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="First page"
          >
            <FiChevronsLeft />
          </button>
          <button
            onClick={() => paginate(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <FiChevronLeft />
          </button>

          {startPage > 1 && (
            <span className="px-3 py-1">...</span>
          )}

          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`px-3 py-1 rounded-md border ${currentPage === number ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300'}`}
            >
              {number}
            </button>
          ))}

          {endPage < totalPages && (
            <span className="px-3 py-1">...</span>
          )}

          <button
            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <FiChevronRight />
          </button>
          <button
            onClick={() => paginate(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Last page"
          >
            <FiChevronsRight />
          </button>
        </div>
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!specializationName.trim()) return;

    try {
      let response;
      if (currentSpecialization) {
        // Editing existing specialization
        response = await editSpecialize(currentSpecialization.id, {
          specialization: specializationName,
        });
      } else {
        // Creating new specialization
        response = await createSpecialize({
          specialization: specializationName,
        });
      }

      if (response.success) {
        showToast(response.message, 'success');
        fetchSpecializations();
      } else {
        showToast(response.error || 'Something went wrong', 'error');
      }

      setSpecializationName('');
      setIsModalOpen(false);
      setCurrentSpecialization(null);
    } catch (err) {
      showToast('An unexpected error occurred.', 'error');
    }
  };

  const handleEdit = (spec) => {
    setCurrentSpecialization(spec);
    setSpecializationName(spec.specialization);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteSpecialize(id);
      if (response.success) {
        showToast(response.message, 'success');
        fetchSpecializations();
        // Reset to first page if the last item on current page was deleted
        if (currentItems.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        showToast(response.error || 'Failed to delete specialization', 'error');
      }
    } catch (error) {
      showToast('Error deleting specialization', 'error');
    }
  };

  if (isLoading || isPriceLoading) {
    return (
      <div className='flex min-h-screen bg-gray-100'>
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
        {/* Price Management Section */}
        <div className='mb-8 bg-white rounded-lg shadow overflow-hidden'>
          <div className='p-6 border-b border-gray-200'>
            <div className='flex justify-between items-center'>
              <h2 className='text-xl font-bold text-gray-800'>Service Prices</h2>
              <button
                onClick={() => setIsPriceModalOpen(true)}
                className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2'
              >
                <FiEdit /> Edit Prices
              </button>
            </div>
            <div className='mt-4 grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='bg-gray-50 p-4 rounded-lg'>
                <h3 className='font-medium text-gray-700'>Video Call</h3>
                <p className='text-2xl font-bold text-gray-900'>${prices.video_call}</p>
              </div>
              <div className='bg-gray-50 p-4 rounded-lg'>
                <h3 className='font-medium text-gray-700'>Voice Call</h3>
                <p className='text-2xl font-bold text-gray-900'>${prices.voice_call}</p>
              </div>
              <div className='bg-gray-50 p-4 rounded-lg'>
                <h3 className='font-medium text-gray-700'>Message</h3>
                <p className='text-2xl font-bold text-gray-900'>${prices.message_call}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Specializations Section */}
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-2xl font-bold text-gray-800'>Manage Specializations</h1>
          <button
            onClick={() => {
              setCurrentSpecialization(null);
              setSpecializationName('');
              setIsModalOpen(true);
            }}
            className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2'
          >
            <FiPlus /> Add Specialization
          </button>
        </div>

        {/* Specializations List */}
        <div className='bg-white rounded-lg shadow overflow-hidden'>
          {specializations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No specializations found. Add your first specialization.
            </div>
          ) : (
            <>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Name</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {currentItems.map((spec) => (
                    <tr key={spec.id}>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        {spec.specialization}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        <button
                          onClick={() => handleEdit(spec)}
                          className='text-indigo-600 hover:text-indigo-900 mr-4'
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() =>
                            setConfirmConfig({
                              isOpen: true,
                              title: 'Delete Specialization',
                              message: 'Are you sure you want to delete this specialization?',
                              onConfirm: () => handleDelete(spec.id),
                            })
                          }
                          className='text-red-600 hover:text-red-900'
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-4">
                <PaginationControls />
              </div>
            </>
          )}
        </div>

        {/* Add/Edit Specialization Modal */}
        {isModalOpen && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
            <div className='bg-white rounded-lg shadow-xl w-full max-w-md'>
              <div className='p-6'>
                <h2 className='text-xl font-semibold mb-4'>
                  {currentSpecialization ? 'Edit Specialization' : 'Add New Specialization'}
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className='mb-6'>
                    <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='name'>
                      Specialization Name
                    </label>
                    <input
                      type='text'
                      id='name'
                      value={specializationName}
                      onChange={(e) => setSpecializationName(e.target.value)}
                      className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                      required
                      autoFocus
                    />
                  </div>
                  <div className='flex justify-end gap-3'>
                    <button
                      type='button'
                      onClick={() => setIsModalOpen(false)}
                      className='bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded'
                    >
                      Cancel
                    </button>
                    <button
                      type='submit'
                      className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded'
                    >
                      {currentSpecialization ? 'Update' : 'Save'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Prices Modal */}
        {isPriceModalOpen && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
            <div className='bg-white rounded-lg shadow-xl w-full max-w-md'>
              <div className='p-6'>
                <h2 className='text-xl font-semibold mb-4'>Edit Service Prices</h2>
                <div className='space-y-4'>
                  <div>
                    <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='video_call'>
                      Video Call Price ($)
                    </label>
                    <input
                      type='number'
                      id='video_call'
                      name='video_call'
                      value={prices.video_call}
                      onChange={handlePriceChange}
                      className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                      min="0"
                    />
                  </div>
                  <div>
                    <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='voice_call'>
                      Voice Call Price ($)
                    </label>
                    <input
                      type='number'
                      id='voice_call'
                      name='voice_call'
                      value={prices.voice_call}
                      onChange={handlePriceChange}
                      className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                      min="0"
                    />
                  </div>
                  <div>
                    <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='message_call'>
                      Message Price ($)
                    </label>
                    <input
                      type='number'
                      id='message_call'
                      name='message_call'
                      value={prices.message_call}
                      onChange={handlePriceChange}
                      className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                      min="0"
                    />
                  </div>
                </div>
                <div className='flex justify-end gap-3 mt-6'>
                  <button
                    type='button'
                    onClick={() => setIsPriceModalOpen(false)}
                    className='bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded'
                  >
                    Cancel
                  </button>
                  <button
                    type='button'
                    onClick={savePrices}
                    className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded'
                  >
                    Save Prices
                  </button>
                </div>
              </div>
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
    </div>
  );
}

export default SpecializeManage;