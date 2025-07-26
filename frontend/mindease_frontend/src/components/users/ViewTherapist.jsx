import React, { useEffect, useState } from 'react';
import {
  FaStar,
  FaCalendarAlt,
  FaClock,
  FaGraduationCap,
  FaLanguage
} from 'react-icons/fa';
import { getTherapsitProfile } from '../../api/user';

function ViewTherapist({ onOpen, onClose, id }) {
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (onOpen && id) {
      const fetchTherapistDetails = async () => {
        try {
          const response = await getTherapsitProfile(id);
          if (response.success) {
            setTherapist(response.profile_info);
          }
        } catch (err) {
          console.error('Failed to fetch therapist:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchTherapistDetails();
    }
  }, [onOpen, id]);

  if (!onOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
      <div className="bg-white rounded-xl max-w-4xl w-full shadow-lg overflow-auto max-h-[90vh] relative">
        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl font-bold"
          onClick={onClose}
        >
          ×
        </button>
        {loading || !therapist ? (
          <div className="flex justify-center items-center p-10">
            <p className="text-gray-500 text-lg">Loading therapist details...</p>
          </div>
        ) : (
          <div className="p-6 md:flex">
            {/* Left Section */}
            <div className="md:w-1/3 bg-gradient-to-br from-teal-600 to-teal-400 text-white p-6 flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                <img
                  src={`${import.meta.env.VITE_BASE_URL}${therapist.profile_image}`}
                  alt={therapist?.fullname || 'Therapist'}
                  className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
                />
                <div className="absolute -bottom-3 -right-3 bg-yellow-500 text-white rounded-full px-2 py-1 shadow text-sm font-semibold">
                  <FaStar className="inline mr-1" /> {therapist.average_rating}
                </div>
              </div>
              <h2 className="text-lg font-semibold mb-1">{therapist.fullname}</h2>
              <p className="text-sm italic">{therapist.professionalTitle}</p>
              <div className="inline-flex items-center text-sm bg-white text-teal-700 px-3 py-1 rounded-full font-medium shadow-sm mt-4">
                <FaClock className="mr-2" /> {therapist.yearsOfExperience} yrs
              </div>
            </div>

            {/* Right Section */}
            <div className="md:w-2/3 p-6">
              {/* <h1 className="text-xl font-bold text-gray-800 mb-2">{therapist.fullname}</h1> */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-semibold text-teal-700 mb-2 flex items-center">
                    <FaGraduationCap className="mr-2" /> Specializations
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {therapist.specializations?.length > 0
                      ? therapist.specializations.map((spec, i) => (
                          <li key={i}>{spec.specializations || spec}</li>
                        ))
                      : <li>No specializations listed.</li>}
                  </ul>
                </div>

                <div>
                  <h3 className="text-md font-semibold text-teal-700 mb-2 flex items-center">
                    <FaLanguage className="mr-2" /> Languages Spoken
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {therapist.languages?.length > 0
                      ? therapist.languages.map((lang, i) => (
                          <li key={i}>{lang.languages || lang}</li>
                        ))
                      : <li>No languages listed.</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewTherapist;
