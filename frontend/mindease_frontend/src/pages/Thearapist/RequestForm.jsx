import React, { useState, useEffect } from 'react';
import { registerTherapist } from '../../api/therapist';
import { showToast } from '../../utils/toast';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from "lucide-react";
import { getSpecializations } from '../../api/admin';
import { logoutUser } from '../../api/auth';
import { LogOut, Menu, X } from "lucide-react";
import { getMYInfo } from '../../api/user';

const RequestForm = () => {
  const [formData, setFormData] = useState({
    professionalTitle: '',
    specializations: [],
    yearsOfExperience: '',
    languages: [],
    professionalLicenseNumber: '',
    licenseIssuingAuthority: '',
    licenseExpiryDate: '',
    degree: '',
    university: '',
    yearOfGraduation: '',
    additionalCertifications: '',
    governmentIssuedID: null,
    professionalLicense: null,
    educationalCertificate: null,
    additionalCertificationDocument: null,
    profile_image: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const [specializationOptions, setSpecializationOptions] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const res = await getMYInfo();

      if (res.success) {
        const { role, current_role } = res.data;

        if (role === "therapist") {
          navigate("/therapistHome");  
        } else if(current_role === 'user'){
          navigate('/')
        } else if(role === 'admin'){
          navigate('/adminDashboard')
        } else {
          navigate("/requestForm");
        }
      } else {
        if (res.error?.response?.data?.detail === "Not logged in") {
          navigate("/login");
        } else {
          navigate("/forbidden");
        }
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    fetchSpecializations();
  }, []);

  const fetchSpecializations = async () => {
    try {
      const info = await getSpecializations();
      if (info.success) {
        setSpecializationOptions(info.data.map(item => item.specialization));
      } else {
        console.error('Failed to fetch:', info.error);
      }
    } catch (error) {
      console.error('Error fetching specializations:', error);
    }
  };

  const languageOptions = [
    'English', 'Spanish', 'French', 'German', 'Mandarin',
    'Hindi', 'Arabic', 'Portuguese', 'Russian', 'Japanese',
    'Italian', 'Korean', 'Dutch', 'Swedish', 'Other'
  ];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleMultiSelectChange = (field, value, checked) => {
    setFormData(prev => {
      if (checked) {
        return { ...prev, [field]: [...prev[field], value] };
      } else {
        return { ...prev, [field]: prev[field].filter(item => item !== value) };
      }
    });
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      // Professional Information validation
      if (!formData.professionalTitle || formData.professionalTitle.trim() === '') {
        newErrors.professionalTitle = 'Professional title is required';
      } else if (!/^[A-Za-z\s]+$/.test(formData.professionalTitle)) {
        newErrors.professionalTitle = 'Professional title must contain only letters and spaces';
      } else if (formData.professionalTitle.trim().length < 3) {
        newErrors.professionalTitle = 'Professional title must be at least 3 characters long';
      } else if (formData.professionalTitle.trim().length > 50) {
        newErrors.professionalTitle = 'Professional title must be less than or equal to 50 characters';
      }

      if (formData.specializations.length === 0) newErrors.specializations = 'At least one specialization is required';

      if (!formData.yearsOfExperience || formData.yearsOfExperience.trim() === '') {
        newErrors.yearsOfExperience = 'Year of experience is required';
      } else if (!/^\d+$/.test(formData.yearsOfExperience)) {
        newErrors.yearsOfExperience = 'Please enter a valid year';
      } else if (parseInt(formData.yearsOfExperience) >= 100) {
        newErrors.yearsOfExperience = 'Please enter a valid year';
      }

      if (formData.languages.length === 0) newErrors.languages = 'At least one language is required';

      if (!formData.professionalLicenseNumber || formData.professionalLicenseNumber.trim() === '') {
        newErrors.professionalLicenseNumber = 'Professional license number is required';
      } else if (!/^[a-zA-Z0-9]+$/.test(formData.professionalLicenseNumber)) {
        newErrors.professionalLicenseNumber = 'License number must contain only letters and numbers';
      } else if (formData.professionalLicenseNumber.length > 100) {
        newErrors.professionalLicenseNumber = 'Enter a valid License number';
      }

      if (!formData.licenseIssuingAuthority || formData.licenseIssuingAuthority.trim() === '') {
        newErrors.licenseIssuingAuthority = 'License issuing authority is required';
      } else if (!/^[A-Za-z\s]+$/.test(formData.licenseIssuingAuthority)) {
        newErrors.licenseIssuingAuthority = 'Only letters are allowed.';
      } else if (formData.licenseIssuingAuthority.length < 3) {
        newErrors.licenseIssuingAuthority = 'must be at least 3 characters';
      } else if (formData.licenseIssuingAuthority.length > 50) {
        newErrors.licenseIssuingAuthority = 'must be at most 50 characters';
      }

      if (!formData.licenseExpiryDate || formData.licenseExpiryDate.trim() === '') {
        newErrors.licenseExpiryDate = 'License expiry date is required';
      } else {
        const selectedDate = new Date(formData.licenseExpiryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isNaN(selectedDate.getTime())) {
          newErrors.licenseExpiryDate = 'Invalid date format';
        } else if (selectedDate <= today) {
          newErrors.licenseExpiryDate = 'License expiry date must be a future date';
        }
      }
    } 
    
    if (step === 2) {
      // Educational Background validation
      if (!formData.degree || formData.degree.trim() === '') {
        newErrors.degree = 'Degree is required';
      } else if (!/^[A-Za-z\s]+$/.test(formData.degree.trim())) {
        newErrors.degree = 'Degree must contain only letters';
      } else if (formData.degree.trim().length < 3) {
        newErrors.degree = 'Degree must be at least 3 characters';
      } else if (formData.degree.trim().length > 50) {
        newErrors.degree = 'Degree must be at most 50 characters';
      }

      if (!formData.university || formData.university.trim() === '') {
        newErrors.university = 'University is required';
      } else if (!/^[A-Za-z\s]+$/.test(formData.university.trim())) {
        newErrors.university = 'University must contain only letters';
      } else if (formData.university.trim().length < 3) {
        newErrors.university = 'University must be at least 3 characters';
      } else if (formData.university.trim().length > 50) {
        newErrors.university = 'University must be at most 50 characters';
      }

      const currentYear = new Date().getFullYear();
      if (!formData.yearOfGraduation || formData.yearOfGraduation.trim() === '') {
        newErrors.yearOfGraduation = 'Year of graduation is required';
      } else if (!/^\d{4}$/.test(formData.yearOfGraduation.trim())) {
        newErrors.yearOfGraduation = 'Year of graduation must be a 4-digit number';
      } else {
        const year = parseInt(formData.yearOfGraduation.trim());
        if (year < 1000) {
          newErrors.yearOfGraduation = 'Year must be 1000 or later';
        } else if (year > currentYear) {
          newErrors.yearOfGraduation = `Year cannot be in the future`;
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = (e) => {
    e.preventDefault();
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await registerTherapist(formData);
      if (response.success) {
        showToast(response.message, 'success');
        navigate('/submited');
      } else {
        showToast(response.message, 'error')
      }
    } catch (error) {
      console.error('Submission error:', error);
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await logoutUser();
      if (response.success) {
        localStorage.clear()
        navigate('/login');
        showToast(response.message, 'success');
      } else {
        showToast(response.message, 'error');
      }
      console.log('Logout clicked');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const renderMultiSelect = (field, options, label, description) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}*</label>
      <p className="text-xs text-gray-500 mb-2">{description}</p>
      {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
        {options.map(option => (
          <div key={option} className="flex items-center">
            <input
              type="checkbox"
              id={`${field}-${option}`}
              value={option}
              checked={formData[field].includes(option)}
              onChange={(e) => handleMultiSelectChange(field, option, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={`${field}-${option}`} className="ml-2 block text-sm text-gray-700">
              {option}
            </label>
          </div>
        ))} 
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Professional Information" },
    { number: 2, title: "Educational Background" },
    { number: 3, title: "Supporting Documents" }
  ];

  return (
    <>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link to={'/therapistDashboard'}><h1 className="text-2xl font-bold text-gray-900">Mindease</h1></Link>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>

            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-base font-medium w-full text-left"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-5xl mx-auto my-8 md:my-16 bg-white shadow-md rounded-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-2/3 w-full bg-gray-50 p-6 md:p-8">
            {currentStep > 1 && (
              <button 
                onClick={handleBack} 
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 transition-colors"
              >
                <ArrowLeft size={18} />
                Back
              </button>
            )}
            
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 text-center">
                {steps[currentStep - 1].title}
              </h2>
              <div className="flex justify-center mt-2 mb-6">
                <div className="w-16 h-1 bg-blue-500 rounded-full"></div>
              </div>
            </div>

            {currentStep === 1 && (
              <form onSubmit={handleNext} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="professionalTitle" className="block text-sm font-medium text-gray-700 mb-1">Professional Title*</label>
                    <input 
                      id="professionalTitle"
                      name="professionalTitle" 
                      className={`p-3 w-full rounded-lg border ${errors.professionalTitle ? 'border-red-500' : 'border-gray-300'}`}
                      value={formData.professionalTitle} 
                      onChange={handleChange} 
                    />
                    {errors.professionalTitle && <p className="text-red-500 text-sm mt-1">{errors.professionalTitle}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 mb-1">Years of Experience*</label>
                    <input 
                      id="yearsOfExperience"
                      type="number"
                      min="0"
                      name="yearsOfExperience" 
                      className={`p-3 w-full rounded-lg border ${errors.yearsOfExperience ? 'border-red-500' : 'border-gray-300'}`}
                      value={formData.yearsOfExperience} 
                      onChange={handleChange} 
                    />
                    {errors.yearsOfExperience && <p className="text-red-500 text-sm mt-1">{errors.yearsOfExperience}</p>}
                  </div>
                </div>
                
                {renderMultiSelect(
                  'specializations',
                  specializationOptions,
                  'Specializations',
                  'Select all areas you specialize in'
                )}
                
                {renderMultiSelect(
                  'languages',
                  languageOptions,
                  'Languages Spoken',
                  'Select all languages you\'re proficient in'
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="professionalLicenseNumber" className="block text-sm font-medium text-gray-700 mb-1">Professional License Number*</label>
                    <input 
                      id="professionalLicenseNumber"
                      name="professionalLicenseNumber" 
                      className={`p-3 w-full rounded-lg border ${errors.professionalLicenseNumber ? 'border-red-500' : 'border-gray-300'}`}
                      value={formData.professionalLicenseNumber} 
                      onChange={handleChange} 
                    />
                    {errors.professionalLicenseNumber && <p className="text-red-500 text-sm mt-1">{errors.professionalLicenseNumber}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="licenseIssuingAuthority" className="block text-sm font-medium text-gray-700 mb-1">License Issuing Authority*</label>
                    <input 
                      id="licenseIssuingAuthority"
                      name="licenseIssuingAuthority" 
                      className={`p-3 w-full rounded-lg border ${errors.licenseIssuingAuthority ? 'border-red-500' : 'border-gray-300'}`}
                      value={formData.licenseIssuingAuthority} 
                      onChange={handleChange} 
                    />
                    {errors.licenseIssuingAuthority && <p className="text-red-500 text-sm mt-1">{errors.licenseIssuingAuthority}</p>}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="licenseExpiryDate" className="block text-sm font-medium text-gray-700 mb-1">License Expiry Date*</label>
                  <input 
                    id="licenseExpiryDate"
                    type="date" 
                    name="licenseExpiryDate" 
                    className={`p-3 w-full rounded-lg border ${errors.licenseExpiryDate ? 'border-red-500' : 'border-gray-300'}`}
                    value={formData.licenseExpiryDate} 
                    onChange={handleChange} 
                  />
                  {errors.licenseExpiryDate && <p className="text-red-500 text-sm mt-1">{errors.licenseExpiryDate}</p>}
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition duration-200 font-medium mt-4"
                >
                  Continue to Educational Background
                </button>
              </form>
            )}

            {currentStep === 2 && (
              <form onSubmit={handleNext} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="degree" className="block text-sm font-medium text-gray-700 mb-1">Degree/Certification*</label>
                    <input 
                      id="degree"
                      name="degree" 
                      placeholder="e.g., PhD in Psychology"
                      className={`p-3 w-full rounded-lg border ${errors.degree ? 'border-red-500' : 'border-gray-300'}`}
                      value={formData.degree} 
                      onChange={handleChange} 
                    />
                    {errors.degree && <p className="text-red-500 text-sm mt-1">{errors.degree}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-1">University/Institution*</label>
                    <input 
                      id="university"
                      name="university" 
                      placeholder="e.g., Harvard University"
                      className={`p-3 w-full rounded-lg border ${errors.university ? 'border-red-500' : 'border-gray-300'}`}
                      value={formData.university} 
                      onChange={handleChange} 
                    />
                    {errors.university && <p className="text-red-500 text-sm mt-1">{errors.university}</p>}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="yearOfGraduation" className="block text-sm font-medium text-gray-700 mb-1">Year of Graduation*</label>
                  <input 
                    id="yearOfGraduation"
                    type="number"
                    name="yearOfGraduation" 
                    className={`p-3 w-full rounded-lg border ${errors.yearOfGraduation ? 'border-red-500' : 'border-gray-300'}`}
                    value={formData.yearOfGraduation} 
                    onChange={handleChange} 
                  />
                  {errors.yearOfGraduation && <p className="text-red-500 text-sm mt-1">{errors.yearOfGraduation}</p>}
                </div>
                
                <div>
                  <label htmlFor="additionalCertifications" className="block text-sm font-medium text-gray-700 mb-1">Additional Certifications</label>
                  <textarea
                    id="additionalCertifications"
                    name="additionalCertifications" 
                    placeholder="List any additional certifications or training"
                    rows={2}
                    className="p-3 w-full rounded-lg border border-gray-300 resize-none"
                    value={formData.additionalCertifications} 
                    onChange={handleChange} 
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition duration-200 font-medium mt-4"
                >
                  Continue to Supporting Documents
                </button>
              </form>
            )}

            {currentStep === 3 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="profile_image" className="block text-sm font-medium text-gray-700 mb-1">Profile Photo*</label>
                  <p className="text-xs text-gray-500 mb-2">Upload a professional headshot (JPEG/PNG, max 5MB)</p>
                  <input 
                    id="profile_image"
                    type="file" 
                    name="profile_image" 
                    accept="image/jpeg, image/png"
                    className="p-3 w-full rounded-lg border border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={handleChange} 
                    required 
                  />
                </div>
                
                <div>
                  <label htmlFor="governmentIssuedID" className="block text-sm font-medium text-gray-700 mb-1">Government Issued ID*</label>
                  <p className="text-xs text-gray-500 mb-2">Upload a clear copy of your passport, driver's license, or national ID (PDF/JPEG/PNG, max 5MB)</p>
                  <input 
                    id="governmentIssuedID"
                    type="file" 
                    name="governmentIssuedID" 
                    accept=".pdf, image/jpeg, image/png"
                    className="p-3 w-full rounded-lg border border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={handleChange} 
                    required 
                  />
                </div>
                
                <div>
                  <label htmlFor="professionalLicense" className="block text-sm font-medium text-gray-700 mb-1">Professional License*</label>
                  <p className="text-xs text-gray-500 mb-2">Upload your current professional license (PDF/JPEG/PNG, max 5MB)</p>
                  <input 
                    id="professionalLicense"
                    type="file" 
                    name="professionalLicense" 
                    accept=".pdf, image/jpeg, image/png"
                    className="p-3 w-full rounded-lg border border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={handleChange} 
                    required 
                  />
                </div>
                
                <div>
                  <label htmlFor="educationalCertificate" className="block text-sm font-medium text-gray-700 mb-1">Educational Certificate*</label>
                  <p className="text-xs text-gray-500 mb-2">Upload your highest degree certificate (PDF/JPEG/PNG, max 5MB)</p>
                  <input 
                    id="educationalCertificate"
                    type="file" 
                    name="educationalCertificate" 
                    accept=".pdf, image/jpeg, image/png"
                    className="p-3 w-full rounded-lg border border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={handleChange} 
                    required 
                  />
                </div>
    
                <div>
                  <label htmlFor="additionalCertificationDocument" className="block text-sm font-medium text-gray-700 mb-1">Additional Certification Documents</label>
                  <p className="text-xs text-gray-500 mb-2">Upload any additional certifications (PDF/JPEG/PNG, max 5MB each)</p>
                  <input 
                    id="additionalCertificationDocument"
                    type="file" 
                    name="additionalCertificationDocument" 
                    accept=".pdf, image/jpeg, image/png"
                    className="p-3 w-full rounded-lg border border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={handleChange} 
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition duration-200 font-medium mt-6 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            )}
          </div>

          <div className="md:w-1/3 w-full bg-gradient-to-b from-blue-50 to-blue-100 p-6 md:p-8">
            <div className="sticky top-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Application Progress</h3>
              <div className="space-y-6">
                {steps.map((step) => (
                  <div 
                    key={step.number} 
                    className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${currentStep === step.number ? 'bg-white shadow-md' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep === step.number ? 'bg-blue-600 text-white' : currentStep > step.number ? 'bg-green-500 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}>
                      {step.number}
                    </div>
                    <h4 className={`font-medium ${currentStep === step.number ? 'text-blue-600' : 'text-gray-600'}`}>
                      {step.title}
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RequestForm;