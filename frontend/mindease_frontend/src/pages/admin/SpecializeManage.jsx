import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { createSpecialize, deleteSpecialize, getSpecializations, editSpecialize } from '../../api/admin';
import { showToast } from '../../utils/toast';

function SpecializeManage() {
  const [specializations, setSpecializations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [specializationName, setSpecializationName] = useState('');
  const [currentSpecialization, setCurrentSpecialization] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSpecializations();
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
      } else {
        showToast(response.error || 'Failed to delete specialization', 'error');
      }
    } catch (error) {
      showToast('Error deleting specialization', 'error');
    }
  };

  if (isLoading) {
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
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Name</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {specializations.map((spec) => (
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
                        onClick={() => handleDelete(spec.id)}
                        className='text-red-600 hover:text-red-900'
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add/Edit Modal */}
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
                      onClick={() => {
                        setIsModalOpen(false);
                        setCurrentSpecialization(null);
                        setSpecializationName('');
                      }}
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
      </div>
    </div>
  );
}

export default SpecializeManage;