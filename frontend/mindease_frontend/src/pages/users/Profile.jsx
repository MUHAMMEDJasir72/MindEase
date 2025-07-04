import React, { useEffect, useState } from 'react';
import Navbar from '../../components/users/Navbar';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../../utils/toast';
import { logoutUser } from '../../api/auth';
import { Pencil, Check } from 'lucide-react';
import { profileInfo,updateProfileField,updateProfileImage } from '../../api/user';

function Profile() {
  const navigate = useNavigate();


  const loginMethod = localStorage.getItem('loginMethod')

  useEffect(() => {

    const fetchProfile = async () => {
      const info = await profileInfo();
      if (info.success) {
        setUser(info.profile_info);
      }
    };
    
    const token = localStorage.getItem("access");
    console.log(token)
    if (!token) {
      navigate("/login"); 
    }else{
      fetchProfile();
    }
    
  }, []);
  

  const [user, setUser] = useState({});
  const [editingField, setEditingField] = useState(null);
  const [editedValue, setEditedValue] = useState('');
  console.log(user.profile_image)

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
    setEditingField(field);
    setEditedValue(user[field] || '');
  };

  const saveField = async (field) => {
    const res = await updateProfileField(field, editedValue);
    if (res.success) {
      setUser((prev) => ({ ...prev, [field]: editedValue }));
      // showToast(`${field} updated!`, 'success');
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
      setUser((prev) => ({
        ...prev,
        profile_image: res.profile_image, // <-- replace with actual field
      }));
    }
    else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-1 p-8">
        {/* Profile Header */}
        <div className="flex justify-center items-center w-full max-w-2xl h-[200px] mx-auto border-b-2 border-gray-300">
          <div className="w-[130px] h-[130px] border-[#336c6d] border-[3px] rounded-3xl overflow-hidden relative">
            <img
              className="w-full h-full object-cover"
              src={ user.profile_image ? `http://127.0.0.1:8000${user.profile_image}` : '/default_profile-2.png'}

              alt="Profile"
            />

            <label className="absolute bottom-0 right-0 bg-[#336c6d] hover:bg-[#013435] p-1 rounded-tl-xl transition cursor-pointer">
              <Pencil size={20} className="text-[#d8dede]" />
              <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              />
            </label>
          </div>
          <div className="p-5 leading-loose">
            <h1 className="text-xl font-semibold">{user.username}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        {/* Editable Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto pt-8">
          {Object.entries(user).map(([key, value]) =>
            key === 'username' || key === 'email' || key === 'profile_image' ? null : (
              <div key={key} className="flex flex-col relative">
                <label className="mb-1 font-medium text-gray-700 capitalize">{key}</label>
                {editingField === key ? (
                  <>
                    <input
                      type="text"
                      value={editedValue}
                      onChange={(e) => setEditedValue(e.target.value)}
                      className="bg-white border-2 border-gray-300 rounded-md p-2 pr-10 focus:outline-none focus:border-[#336c6d] text-gray-800"
                    />
                    <button
                      type="button"
                      onClick={() => saveField(key)}
                      className="absolute right-2 top-[38px] text-green-600 hover:text-green-800"
                    >
                      <Check size={20} />
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      value={value || 'Not provided'}
                      readOnly
                      className="bg-[#013435] bg-opacity-10 border-2 border-gray-300 rounded-md p-2 pr-10 text-gray-800"
                    />
                    <button
                      type="button"
                      onClick={() => startEditing(key)}
                      className="absolute right-2 top-[38px] text-gray-600 hover:text-[#336c6d]"
                    >
                      <Pencil size={18} />
                    </button>
                  </>
                )}
              </div>
            )
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex w-full max-w-2xl mx-auto pt-8 gap-4 justify-between">
          <button
            onClick={handleLogout}
            className={`py-2 bg-[#336c6d] text-white rounded-xl hover:bg-[#013435] border transition ${
              loginMethod === 'email' ? 'w-1/2' : 'w-full'
            }`}
          >
            Logout
          </button>
          {loginMethod === 'email' && (
            <button
              onClick={() => navigate('/change_password')}
              className="w-1/2 py-2 bg-[#336c6d] text-white rounded-xl hover:bg-[#013435] border transition"
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
