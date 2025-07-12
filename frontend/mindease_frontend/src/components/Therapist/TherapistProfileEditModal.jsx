import React, { useEffect, useState } from 'react';
import { FaTimes, FaUser, FaBriefcase, FaGraduationCap, FaFileAlt, FaEye, FaDownload, FaTrash,FaUpload } from 'react-icons/fa';
import { getSpecializations } from '../../api/admin';

const TherapistProfileEditModal = ({ isOpen, onClose, therapistData, onSave }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [specializationsOptions, setSpecializationsOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  
  // Document states with previews
  const [documents, setDocuments] = useState({
    profile_image: null,
    professionalLicense: null,
    educationalCertificate: null,
    additionalCertificationDocument: null,
    governmentIssuedID: null
  });

  // Preview URLs for documents
  const [previews, setPreviews] = useState({
    profile_image: null,
    professionalLicense: null,
    educationalCertificate: null,
    additionalCertificationDocument: null,
    governmentIssuedID: null
  });

  const languageOptions = [
    'English', 'Spanish', 'French', 'German', 'Mandarin',
    'Hindi', 'Arabic', 'Portuguese', 'Russian', 'Japanese',
    'Italian', 'Korean', 'Dutch', 'Swedish', 'Other'
  ];

  // Document labels for better display
  const documentLabels = {
    profile_image: 'Profile Image',
    professionalLicense: 'Professional License',
    educationalCertificate: 'Educational Certificate',
    additionalCertificationDocument: 'Additional Certification',
    governmentIssuedID: 'Government ID'
  };

  // Fetch initial data
  useEffect(() => {
    if (therapistData) {
      setFormData(therapistData);
      
      // Initialize document previews from therapistData
      const initialPreviews = {};
      const initialDocuments = {};
      
      // Set up initial documents and their previews
      Object.keys(documentLabels).forEach(docKey => {
        if (therapistData[docKey]) {
          initialPreviews[docKey] = `${import.meta.env.VITE_BASE_URL}${therapistData[docKey]}`;
          initialDocuments[docKey] = therapistData[docKey];
        }
      });
      
      setPreviews(initialPreviews);
      setDocuments(initialDocuments);
    }
  }, [therapistData]);

  // Fetch specializations
  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        setLoading(true);
        const response = await getSpecializations();
        if (response.success) {
          setSpecializationsOptions(response.data);
        } else {
          console.error('Error fetching specializations:', response.error);
        }
      } catch (error) {
        console.error('Failed to fetch specializations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecializations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is filled
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleFileChange = (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    
    // Update documents state
    setDocuments(prev => ({
      ...prev,
      [docType]: file
    }));
    
    // Update previews state
    setPreviews(prev => ({
      ...prev,
      [docType]: previewUrl
    }));
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [docType]: file
    }));
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.fullname?.trim()) newErrors.fullname = 'Full name is required';
    if (!formData.professionalTitle?.trim()) newErrors.professionalTitle = 'Professional title is required';
    if (!formData.phone?.trim()) newErrors.phone = 'Phone number is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Focus on first field with error
      const firstErrorField = document.querySelector(`[name="${Object.keys(newErrors)[0]}"]`);
      if (firstErrorField) firstErrorField.focus();
      return;
    }

    // Create final data with all documents
    const finalFormData = { ...formData };
    Object.keys(documents).forEach(docKey => {
      if (documents[docKey]) {
        finalFormData[docKey] = documents[docKey];
      }
    });

    // Submit the form
    onSave(finalFormData);
    onClose();
  };

  const handleCheckboxChange = (field, value, checked) => {
    setFormData(prevData => {
      // Ensure the array exists
      const currentArray = prevData[field] || [];
      
      const updatedArray = checked
        ? [...currentArray, { [field]: value }]
        : currentArray.filter(item => item[field] !== value);

      return {
        ...prevData,
        [field]: updatedArray,
      };
    });
  };

  // Check file type for proper preview display
  const isImageFile = (fileName) => {
    if (!fileName) return false;
    const ext = fileName.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(ext);
  };

  // Determine if a document is an image or other type for preview purposes
  const getDocumentFileType = (docKey, url) => {
    if (!url) return 'unknown';
    
    // For blob URLs or new files
    if (documents[docKey] instanceof File) {
      return isImageFile(documents[docKey].name) ? 'image' : 'document';
    }
    
    // For existing URLs
    if (typeof url === 'string') {
      const ext = url.split('.').pop().toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(ext)) {
        return 'image';
      }
      return 'document';
    }
    
    return 'unknown';
  };

  if (!isOpen) return null;

  // Tab navigation setup
  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: <FaUser /> },
    { id: 'professional', label: 'Professional', icon: <FaBriefcase /> },
    { id: 'education', label: 'Education', icon: <FaGraduationCap /> },
    { id: 'documents', label: 'Documents & Images', icon: <FaFileAlt /> }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-6 border-b bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Edit Therapist Profile</h2>
            <button 
              onClick={onClose} 
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex bg-gray-100 border-b overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`flex items-center px-4 py-3 font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-white' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="mr-2">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content area with scrolling */}
        <div className="overflow-y-auto flex-grow">
          <form onSubmit={handleSubmit} className="p-4 md:p-6">
            {/* Personal Information Section */}
            <div className={activeTab === 'personal' ? 'block' : 'hidden'}>
              <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-gray-800">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname || ''}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.fullname ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.fullname && <p className="text-red-500 text-xs mt-1">{errors.fullname}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information Section */}
            <div className={activeTab === 'professional' ? 'block' : 'hidden'}>
              <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-gray-800">Professional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Professional Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="professionalTitle"
                    value={formData.professionalTitle || ''}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.professionalTitle ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g. Clinical Psychologist, Therapist"
                  />
                  {errors.professionalTitle && <p className="text-red-500 text-xs mt-1">{errors.professionalTitle}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience || ''}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                  <input
                    type="text"
                    name="professionalLicenseNumber"
                    value={formData.professionalLicenseNumber || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Authority</label>
                  <input
                    type="text"
                    name="licenseIssuingAuthority"
                    value={formData.licenseIssuingAuthority || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry Date</label>
                  <input
                    type="date"
                    name="licenseExpiryDate"
                    value={formData.licenseExpiryDate ? formData.licenseExpiryDate.split('T')[0] : ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specializations</label>
                  {loading ? (
                    <p className="text-sm text-gray-500">Loading specializations...</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {specializationsOptions.map((item) => (
                        <div key={item.id} className="flex items-start">
                          <input
                            type="checkbox"
                            id={`spec-${item.id}`}
                            className="mt-1 mr-2"
                            value={item.specialization}
                            checked={formData?.specializations?.some(
                              (spec) => spec.specializations === item.specialization
                            )}
                            onChange={(e) => {
                              handleCheckboxChange('specializations', item.specialization, e.target.checked);
                            }}
                          />
                          <label htmlFor={`spec-${item.id}`} className="text-sm">{item.specialization}</label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
                  <div className="grid grid-cols-3 gap-2">
                    {languageOptions.map((lang) => (
                      <div key={lang} className="flex items-start">
                        <input
                          type="checkbox"
                          id={`lang-${lang}`}
                          className="mt-1 mr-2"
                          value={lang}
                          checked={formData?.languages?.some(
                            (item) => item.languages === lang
                          )}
                          onChange={(e) => {
                            handleCheckboxChange('languages', lang, e.target.checked);
                          }}
                        />
                        <label htmlFor={`lang-${lang}`} className="text-sm">{lang}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Education Section */}
            <div className={activeTab === 'education' ? 'block' : 'hidden'}>
              <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-gray-800">Education & Qualifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                  <input
                    type="text"
                    name="degree"
                    value={formData.degree || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Bachelor of Psychology"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                  <input
                    type="text"
                    name="university"
                    value={formData.university || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year of Graduation</label>
                  <input
                    type="number"
                    name="yearOfGraduation"
                    value={formData.yearOfGraduation || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1950"
                    max={new Date().getFullYear()}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Certifications</label>
                  <textarea
                    name="additionalCertifications"
                    value={formData.additionalCertifications || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="List any additional certifications or specialized training"
                  />
                </div>
              </div>
            </div>

            {/* Documents Section - All documents with previews */}
            <div className={activeTab === 'documents' ? 'block' : 'hidden'}>
  <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-gray-800">Documents & Images</h3>
  
  <div className="space-y-6">
    {Object.keys(documentLabels).map(docKey => (
      <div key={docKey} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h4 className="font-medium text-gray-800 mb-2">{documentLabels[docKey]}</h4>
        
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Document preview area */}
          <div className="w-full md:w-1/3 flex-shrink-0">
            {previews[docKey] ? (
              <div className="relative border border-gray-300 rounded-md overflow-hidden bg-white flex items-center justify-center">
                {getDocumentFileType(docKey, previews[docKey]) === 'image' ? (
                  <img 
                    src={previews[docKey]} 
                    alt={documentLabels[docKey]} 
                    className="w-full h-40 object-contain"
                  />
                ) : (
                  <div className="w-full h-40 flex flex-col items-center justify-center p-4 text-center">
                    <FaFileAlt className="text-4xl text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      {documents[docKey] instanceof File ? documents[docKey].name : 'Document file'}
                    </p>
                  </div>
                )}
                
                {/* Document actions */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white flex justify-center p-2 gap-3">
                  {previews[docKey] && (
                    <>
                      <a 
                        href={previews[docKey]} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-white hover:text-blue-300 transition-colors"
                        title="View"
                      >
                        <FaEye />
                      </a>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="border border-gray-300 border-dashed rounded-md h-40 flex items-center justify-center bg-gray-100">
                <p className="text-sm text-gray-500">No {documentLabels[docKey]} uploaded</p>
              </div>
            )}
          </div>
          
          {/* Upload controls */}
          <div className="flex-grow">
            <div className="flex items-center gap-3">
              {/* Upload Icon */}
              <label 
                htmlFor={`upload-${docKey}`} 
                className="inline-flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full text-white cursor-pointer hover:bg-blue-600 transition"
                title="Upload New File"
              >
                <FaUpload className="text-xl" />
              </label>

              {/* Hidden input */}
              <input
                id={`upload-${docKey}`}
                type="file"
                accept={docKey === 'profile_image' ? "image/*" : ".pdf,.doc,.docx,.jpg,.jpeg,.png"}
                onChange={(e) => handleFileChange(e, docKey)}
                className="hidden"
              />

              {/* Show selected file name */}
              {documents[docKey] instanceof File && (
                <p className="text-sm text-green-600">
                  New file selected: {documents[docKey].name}
                </p>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-2">
              {docKey === 'profile_image'
                ? 'Recommended: Square image, at least 300x300px'
                : 'Accepted formats: PDF, DOC, DOCX, JPG, PNG'}
            </p>
          </div>
        </div>
      </div>
    ))}
  </div>
  
  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-6 rounded">
    <h4 className="text-blue-800 font-medium">Documents Security Note</h4>
    <p className="text-sm text-blue-700 mt-1">
      All uploaded documents are securely stored and encrypted. Only authorized personnel will have access to your documents for verification purposes.
    </p>
  </div>
</div>
          </form>
        </div>

        {/* Footer with buttons */}
        <div className="border-t p-4 bg-gray-50 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default TherapistProfileEditModal;