import React, { useEffect, useState } from 'react';
import TherapistSidebar from '../../components/Therapist/TherapistSidebar';
import { FaUser, FaCalendarAlt, FaPhone, FaMapMarkerAlt, FaBriefcase, FaGraduationCap, FaFileAlt, FaIdCard, FaEdit } from 'react-icons/fa';
import { getProfile, getTotalRating, updateProfile } from '../../api/therapist';
import TherapistProfileEditModal from '../../components/Therapist/TherapistProfileEditModal';

function TherapistProfile() {
  const [therapistData, setTherapistData] = useState({
    specializations: [],
    languages: [],
    revenue: { total: 0, today: 0, month: 0, year: 0 }
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [rate, setRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const baseUrl = import.meta.env.VITE_API_URL;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, ratingRes] = await Promise.all([
          getProfile(),
          getTotalRating()
        ]);

        if (profileRes.success) {
          setTherapistData(profileRes.data);
        }
        if (ratingRes.success) {
          setRate(ratingRes.rate);
        }
      } catch (error) {
        console.error("Error fetching therapist data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveProfile = async (updatedData) => {
    try {
      setLoading(true);
      const response = await updateProfile(updatedData);
      if (response.success) {
        const newProfile = await getProfile();
        if (newProfile.success) {
          setTherapistData(newProfile.data);
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
      setIsEditModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <TherapistSidebar />
        <div className="flex-1 p-8 ml-[200px] overflow-y-auto flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <TherapistSidebar />
      
      <div className="flex-1 p-8 ml-[200px] overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>
          
          {/* Profile Header with Image */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Image */}
              <div className="relative">
                <img 
                  src={therapistData.profile_image ? `${import.meta.env.VITE_BASE_URL}${therapistData.profile_image}` : '/default_profile-2.png'}
                  alt="Profile" 
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-md"
                />
              </div>
              
              {/* Basic Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-800">{therapistData.fullname}</h2>
                <p className="text-blue-600 font-medium mb-2">{therapistData.professionalTitle}</p>
                <p className="text-gray-800 mb-2">
                  {therapistData.specializations?.map((item) => item.specializations).join(', ') || 'N/A'}
                </p>

                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="flex items-center text-gray-600">
                    <FaMapMarkerAlt className="mr-2 text-blue-500" />
                    <span>{therapistData.state}, {therapistData.country}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaBriefcase className="mr-2 text-blue-500" />
                    <span>{therapistData.yearsOfExperience} years experience</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaUser className="mr-2 text-blue-500" />
                    <span>{therapistData.gender}</span>
                  </div>
                </div>
              </div>

              {/* Rating Section */}
              <div className="flex items-center justify-center md:justify-start mt-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${star <= Math.round(rate) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-1 text-gray-600">
                    {rate ? rate.toFixed(1) : 'No ratings yet'}
                  </span>
                </div>
              </div>
              
              {/* Edit Button */}
              <div className="w-full md:w-auto">
                <button 
                  onClick={() => setIsEditModalOpen(true)} 
                  className="w-full md:w-auto flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                >
                  <FaEdit className="mr-2" />
                  Edit Profile
                </button>
              </div>

              {isEditModalOpen && (
                <TherapistProfileEditModal
                  isOpen={isEditModalOpen}
                  onClose={() => setIsEditModalOpen(false)}
                  therapistData={therapistData}
                  onSave={handleSaveProfile}
                />
              )}
            </div>
          </div>
          
          {/* Personal Information Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FaUser className="text-blue-600 text-2xl" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                <p className="text-gray-800">{therapistData.fullname || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Date of Birth</label>
                <div className="flex items-center">
                  <FaCalendarAlt className="text-gray-400 mr-2" />
                  <p className="text-gray-800">{formatDate(therapistData.dateOfBirth)}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Gender</label>
                <p className="text-gray-800">{therapistData.gender || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                <div className="flex items-center">
                  <FaPhone className="text-gray-400 mr-2" />
                  <p className="text-gray-800">{therapistData.phone || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">State/Country</label>
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-gray-400 mr-2" />
                  <p className="text-gray-800">
                    {therapistData.state || 'N/A'}, {therapistData.country || 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-gray-400 mr-2" />
                  <p className="text-gray-800">{therapistData.address || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Professional Information Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <FaBriefcase className="text-purple-600 text-2xl" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Professional Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Professional Title</label>
                <p className="text-gray-800">{therapistData.professionalTitle || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Specializations</label>
                <p className="text-gray-800">
                  {therapistData.specializations?.map((item) => item.specializations).join(', ') || 'N/A'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Years of Experience</label>
                <p className="text-gray-800">{therapistData.yearsOfExperience || '0'} years</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Languages Spoken</label>
                <p className="text-gray-800">
                  {therapistData.languages?.map((item) => item.languages).join(', ') || 'N/A'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">License Number</label>
                <p className="text-gray-800">{therapistData.professionalLicenseNumber || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Issuing Authority</label>
                <p className="text-gray-800">{therapistData.licenseIssuingAuthority || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">License Expiry Date</label>
                <div className="flex items-center">
                  <FaCalendarAlt className="text-gray-400 mr-2" />
                  <p className="text-gray-800">{formatDate(therapistData.licenseExpiryDate)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Education Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FaGraduationCap className="text-green-600 text-2xl" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Education & Qualifications</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Degree</label>
                <p className="text-gray-800">{therapistData.degree || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">University</label>
                <p className="text-gray-800">{therapistData.university || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Year of Graduation</label>
                <p className="text-gray-800">{therapistData.yearOfGraduation || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Additional Certifications</label>
                <p className="text-gray-800">{therapistData.additionalCertifications || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          {/* Documents Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <FaFileAlt className="text-yellow-600 text-2xl" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Documents</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {therapistData.governmentIssuedID && (
                <a href={`${baseUrl}/therapists/therapist-secure-documents/${therapistData.governmentIssuedID.replace(/^\/?media\//, '').replace(/\/$/, '')}`} 
                target="_blank"
                rel="noopener noreferrer"
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col items-center text-center">
                    <FaIdCard className="text-gray-600 text-3xl mb-2" />
                    <span className="text-sm font-medium text-gray-700">Government ID</span>
                    <span className="text-xs text-gray-500 mt-1">View Document</span>
                  </div>
                </a>
              )}
              
              {therapistData.professionalLicense && (
                <a href={`${baseUrl}/therapists/therapist-secure-documents/${therapistData.professionalLicense.replace(/^\/?media\//, '').replace(/\/$/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center text-center">
                    <FaFileAlt className="text-gray-600 text-3xl mb-2" />
                    <span className="text-sm font-medium text-gray-700">Professional License</span>
                    <span className="text-xs text-gray-500 mt-1">View Document</span>
                  </div>
                </a>
              )}
              
              {therapistData.educationalCertificate && (
                <a href={`${baseUrl}/therapists/therapist-secure-documents/${therapistData.educationalCertificate.replace(/^\/?media\//, '').replace(/\/$/, '')}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center text-center">
                    <FaGraduationCap className="text-gray-600 text-3xl mb-2" />
                    <span className="text-sm font-medium text-gray-700">Educational Certificate</span>
                    <span className="text-xs text-gray-500 mt-1">View Document</span>
                  </div>
                </a>
              )}
              
              {therapistData.additionalCertificationDocument && (
                <a href={`${baseUrl}/therapists/therapist-secure-documents/${therapistData.additionalCertificationDocument.replace(/^\/?media\//, '').replace(/\/$/, '')}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center text-center">
                    <FaFileAlt className="text-gray-600 text-3xl mb-2" />
                    <span className="text-sm font-medium text-gray-700">Additional Certifications</span>
                    <span className="text-xs text-gray-500 mt-1">View Document</span>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TherapistProfile;