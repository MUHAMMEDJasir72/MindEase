import React, { useEffect, useState } from 'react';
import Navbar from '../../components/users/Navbar';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../../utils/toast';
import { logoutUser } from '../../api/auth';
import { Pencil, Check } from 'lucide-react';
import { profileInfo, updateProfileField, updateProfileImage } from '../../api/user';

function Profile() {
  const navigate = useNavigate();
  const loginMethod = localStorage.getItem('loginMethod');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({});
  const [editingField, setEditingField] = useState(null);
  const [editedValue, setEditedValue] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const info = await profileInfo();
        if (info.success) {
          setUser(info.profile_info);
        }
      } catch (error) {
        showToast('Failed to load profile', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/login");
    } else {
      fetchProfile();
    }
  }, [navigate]);

  const handleLogout = async () => {
    const response = await logoutUser();
    if (response.success) {
      localStorage.clear();
      showToast(response.message, 'success');
      navigate('/');
    } else {
      showToast(response.message, 'error');
    }
  };

  const startEditing = (field) => {
    if (field === 'gender') return; // Skip editing for gender
    setEditingField(field);
    setEditedValue(user[field] || '');
  };

  const saveField = async (field) => {
    const value = editedValue.trim();
    const onlyLettersRegex = /^[A-Za-z\s]+$/;
    const onlyNumbersRegex = /^[0-9]+$/;

    // Validation
    if (field === 'fullname') {
      if (!onlyLettersRegex.test(value)) return showToast('Fullname must contain only letters', 'error');
    }

    if (field === 'place') {
      if (value.length > 20) return showToast('Place must be at most 20 characters', 'error');
      if (!onlyLettersRegex.test(value)) return showToast('Place must contain only letters', 'error');
    }

    if (field === 'age') {
      const age = Number(value);
      if (!onlyNumbersRegex.test(value) || age < 0 || age > 200) {
        return showToast('Age must be a number between 0 and 200', 'error');
      }
    }

    if (field === 'language') {
      if (value.length > 20) return showToast('Language must be at most 20 characters', 'error');
      if (!onlyLettersRegex.test(value)) return showToast('Language must contain only letters', 'error');
    }

    if (field === 'phone') {
      if (!onlyNumbersRegex.test(value) || value.length > 12) {
        return showToast('Phone must be numeric and up to 12 digits', 'error');
      }
    }

    // Save
    const res = await updateProfileField(field, value);
    if (res.success) {
      setUser((prev) => ({ ...prev, [field]: value }));
      showToast('Profile updated successfully', 'success');
    } else {
      showToast(res.message, 'error');
    }
    setEditingField(null);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const res = await updateProfileImage(file);
    if (res.success) {
      showToast('Profile picture updated!', 'success');
      setUser((prev) => ({ ...prev, profile_image: res.profile_image }));
    } else {
      showToast(res.message, 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        <button 
          className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-teal-600 text-white"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
        >
          ☰
        </button>
        <Navbar onClose={() => setMobileNavOpen(false)} />
        <div className="flex-1 p-4 md:p-8 flex justify-center items-center mt-16 md:mt-0">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-teal-600 text-white"
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
      >
        ☰
      </button>

      <div className={`${mobileNavOpen ? 'block' : 'hidden'} md:block w-full md:w-56 md:min-w-[14rem] bg-white shadow-md fixed md:relative z-40 h-full`}>
        <Navbar onClose={() => setMobileNavOpen(false)} />
      </div>

      <div className="flex-1 p-4 md:p-8 mt-16 md:mt-0">
        <div className="flex flex-col sm:flex-row justify-center items-center w-full max-w-2xl mx-auto pb-6 sm:pb-8 border-b-2 border-gray-300 gap-4 sm:gap-0">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 border-[#336c6d] border-[3px] rounded-3xl overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src={user.profile_image ? `${import.meta.env.VITE_BASE_URL}${user.profile_image}` : '/default_profile-2.png'}
              alt="Profile"
            />
            <label className="absolute bottom-0 right-0 bg-[#336c6d] hover:bg-[#013435] p-1 rounded-tl-xl transition cursor-pointer">
              <Pencil size={16} className="text-[#d8dede]" />
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
          <div className="sm:p-5 text-center sm:text-left leading-relaxed">
            <h1 className="text-lg sm:text-xl font-semibold">{user.username}</h1>
            <p className="text-gray-600 text-sm sm:text-base">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 max-w-2xl mx-auto pt-6 sm:pt-8">
          {Object.entries(user).map(([key, value]) =>
            key === 'username' || key === 'email' || key === 'profile_image' ? null : (
              <div key={key} className="flex flex-col relative">
                <label className="mb-1 font-medium text-gray-700 text-sm sm:text-base capitalize">
                  {key.replace(/_/g, ' ')}
                </label>
                {key === 'gender' ? (
                  <select
                    value={user.gender || ''}
                    onChange={async (e) => {
                      const newValue = e.target.value;
                      if (!['Male', 'Female'].includes(newValue)) {
                        showToast('Gender must be Male or Female', 'error');
                        return;
                      }
                      const res = await updateProfileField('gender', newValue);
                      if (res.success) {
                        setUser((prev) => ({ ...prev, gender: newValue }));
                        showToast('Gender updated successfully', 'success');
                      } else {
                        showToast(res.message, 'error');
                      }
                    }}
                    className="bg-[#013435] bg-opacity-10 border-2 border-gray-300 rounded-md p-2 focus:outline-none focus:border-[#336c6d] text-gray-800 text-sm sm:text-base"
                  >
                    {!user.gender && <option value="">Select Gender</option>} 
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                ) : editingField === key ? (
                  <>
                    <input
                      type="text"
                      value={editedValue}
                      onChange={(e) => setEditedValue(e.target.value)}
                      className="bg-white border-2 border-gray-300 rounded-md p-2 pr-10 focus:outline-none focus:border-[#336c6d] text-gray-800 text-sm sm:text-base"
                    />
                    <button
                      type="button"
                      onClick={() => saveField(key)}
                      className="absolute right-2 top-[34px] sm:top-[38px] text-green-600 hover:text-green-800"
                    >
                      <Check size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      value={value || 'Not provided'}
                      readOnly
                      className="bg-[#013435] bg-opacity-10 border-2 border-gray-300 rounded-md p-2 pr-10 text-gray-800 text-sm sm:text-base"
                    />
                    <button
                      type="button"
                      onClick={() => startEditing(key)}
                      className="absolute right-2 top-[34px] sm:top-[38px] text-gray-600 hover:text-[#336c6d]"
                    >
                      <Pencil size={16} />
                    </button>
                  </>
                )}
              </div>
            )
          )}
        </div>

        <div className="flex flex-col sm:flex-row w-full max-w-2xl mx-auto pt-6 sm:pt-8 gap-3 sm:gap-4">
          <button
            onClick={handleLogout}
            className={`py-2 px-4 sm:px-0 bg-[#336c6d] text-white rounded-xl hover:bg-[#013435] border transition ${
              loginMethod === 'email' ? 'sm:w-1/2' : 'w-full'
            }`}
          >
            Logout
          </button>
          {loginMethod === 'email' && (
            <button
              onClick={() => navigate('/change_password')}
              className="py-2 px-4 sm:px-0 sm:w-1/2 bg-[#336c6d] text-white rounded-xl hover:bg-[#013435] border transition"
            >
              Change Password
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
