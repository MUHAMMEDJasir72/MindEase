import React from 'react'
import { approveTherapist, changeTherapistStatus, getTherapistInformation, rejectTherapist } from '../../api/admin';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { showToast } from '../../utils/toast';
import { basicUrl } from '../../api/axiosInstance';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { differenceInYears } from 'date-fns';
import ConfirmDialog from '../../utils/ConfirmDialog';

function TherapistDetails() {
    const { id } = useParams();
    const [details, setDetails] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()
    const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    });

    
    useEffect(() => {
      const fetchTherpistInfo = async () => {
        const info = await getTherapistInformation(id);
        if (info.success) {
            setDetails(info.data)
            console.log("success");
        } else {
            console.log("error");
        }
        setIsLoading(false);
      };
    
      if (id) {
        fetchTherpistInfo();
      }
    }, [id]);

    const handleApproveTherapist = async () => {
        setIsLoading(true);
      const info = await approveTherapist(id)
      if (info.success){
        console.log('success')
        setIsLoading(false);
        navigate('/therapists')
      }else{
        console.log("error")
      }
    }

   const rejectRequest = async () => {
    const info = await rejectTherapist(id);
    if (info.success) {
        showToast(info.message, 'success');
        navigate('/therapists');
    } else {
        showToast(info.message, 'error');
    }
}


    const handleBlock = async () => {
        try {
            const res = await changeTherapistStatus(id);
            if (res.success) {
            showToast('Status changed successfully', 'success');

            const info = await getTherapistInformation(id);
            if (info.success) {
                setDetails(info.data);
            } else {
                showToast('Failed to fetch updated details.', 'error');
            }
            } else {
            showToast('Something went wrong while updating status.', 'error');
            }
        } catch (error) {
            console.error("Error while changing status:", error);
            showToast('An unexpected error occurred.', 'error');
        } finally {
            setShowConfirm(false);
        }
        };


    function calculateAge(dateOfBirth) {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    return differenceInYears(today, dob);
    }

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
    console.log(id)
    return (
        <div className='flex min-h-screen bg-gray-50'>
            <AdminSidebar />
            
            <div className='flex-1 ml-[200px] p-8 overflow-y-auto'>
                <div className='max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden'>
                    {/* Profile Header */}
                    <div className='bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 flex flex-col items-center relative'>
                        <div className='w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-lg'>
                            <img 
                                className='w-full h-full object-cover' 
                                src={`${import.meta.env.VITE_BASE_URL}${details.profile_image}`} 
                                alt='Therapist profile'
                            />
                        </div>
                        <h1 className='mt-4 text-2xl font-bold text-white'>{details.fullname}</h1>
                        <p className='text-indigo-100 font-medium'>{details.professionalTitle}</p>
                        <div className='absolute top-7 right-14'>
                            <button
                                onClick={() =>
                                setConfirmConfig({
                                    isOpen: true,
                                    title: details?.user?.is_therapist_active ? 'Block Therapist' : 'Unblock Therapist',
                                    message: `Are you sure you want to ${details?.user?.is_therapist_active ? 'block' : 'unblock'} this therapist?`,
                                    onConfirm: handleBlock,
                                })
                                }
                                type="button"
                                className={`
                                    focus:outline-none 
                                    font-medium 
                                    rounded-lg 
                                    text-sm 
                                    px-5 
                                    py-2.5 
                                    me-2 
                                    mb-2 
                                    dark:focus:ring-red-900
                                    ${details?.user?.is_therapist_active
                                        ? 'text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700'
                                        : 'text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700'}
                                `}
                            >
                                {details?.user?.is_therapist_active ? "Block" : "Unblock"}
                            </button>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className='p-6'>
                        <div className='space-y-6'>
                            {/* Personal Information */}
                            <div className='border-b border-gray-200 pb-6'>
                                <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
                                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Personal Information
                                </h2>
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                                    <InfoItem label="Full Name" value={details.fullname} />
                                    <InfoItem label="Email" value={details.user.email} />
                                    <InfoItem label="Age" value={`${calculateAge(details.dateOfBirth)} years`} />
                                    <InfoItem label="Gender" value={details.gender} />
                                    <InfoItem label="Mobile Number" value={details.phone} />
                                    <InfoItem label="Languages" value={details.languages?.map((lang) => lang.languages).join(', ')} />
                                    <InfoItem label="Address" value={details.address} />
                                    <InfoItem label="Country" value={details.country}/>
                                    <InfoItem label="State" value={details.state} />
                                </div>
                            </div>

                            {/* Professional Information */}
                            <div className='border-b border-gray-200 pb-6'>
                                <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
                                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Professional Information
                                </h2>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <InfoItem label="Professional Title" value={details.professionalTitle} />
                                    <InfoItem label="License Number" value={details.professionalLicenseNumber} />
                                    <InfoItem label="Years of Experience" value={details.yearsOfExperience} />
                                    <InfoItem label="License Issuing Authority" value={details.licenseIssuingAuthority} />
                                    <InfoItem label="License Expiry Date" value={details.licenseExpiryDate} />
                                    <InfoItem label="Specializations" value={details.specializations?.map((spec) => spec.specializations).join(', ')} />
                                </div>
                            </div>

                            {/* Educational Background */}
                            <div className='border-b border-gray-200 pb-6'>
                                <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
                                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                                    </svg>
                                    Educational Background
                                </h2>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <InfoItem label="Highest Degree" value={details.degree} />
                                    <InfoItem label="University" value={details.university} />
                                    <InfoItem label="Year of Graduation" value={details.yearOfGraduation} />
                                    <InfoItem label="Additional Certifications" value={details.additionalCertifications} />
                                </div>
                            </div>

                            {/* Supporting Documents */}
                            <div className='pb-6'>
                                <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
                                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Supporting Documents
                                </h2>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <DocumentItem label="Government ID Proof" fileUrl={details.governmentIssuedID} />
                                    <DocumentItem label="Professional License" fileUrl={details.professionalLicense} />
                                    <DocumentItem label="Educational Certificate" fileUrl={details.educationalCertificate} />
                                    {details.additionalCertificationDocument && (
                                        <DocumentItem label="Additional Certifications" fileUrl={details.additionalCertificationDocument} />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        { details.role !== 'therapist' &&
                        <div className='mt-8 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3'>
                            <button className='flex-1 bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center'
                           onClick={() =>
                            setConfirmConfig({
                                isOpen: true,
                                title: 'Approve Therapist',
                                message: 'Are you sure you want to approve this therapist?',
                                onConfirm: handleApproveTherapist,
                                })
                                }
                                >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Approve Therapist
                            </button>
                            <button className='flex-1 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center'
                            onClick={() =>
                            setConfirmConfig({
                                isOpen: true,
                                title: 'Reject Therapist',
                                message: 'Are you sure you want to reject this therapist?',
                                onConfirm: rejectRequest,
                            })
                            }
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Reject Application
                            </button>
                          
                        </div>
                        }
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
            </div>
        </div>
    )
}

// Reusable component for information items
function InfoItem({ label, value }) {
    return (
        <div className='bg-gray-50 p-3 rounded-lg'>
            <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>{label}</p>
            <p className='mt-1 text-sm font-medium text-gray-900'>{value}</p>
        </div>
    )
}

// Reusable component for document items
function DocumentItem({ label, fileUrl }) {
    const fullUrl = `${import.meta.env.VITE_API_URL}/admin/secure-documents/${
     fileUrl.replace(/^\/?media\//, '').replace(/\/$/, '')
   }`;




    return (
        <div className="border rounded-md p-4 bg-gray-50 shadow-sm flex flex-col">
            <span className="font-medium text-gray-700 mb-2">{label}</span>
            {fileUrl ? (
                <a
                    href={fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline text-sm"
                >
                    View Document
                </a>
            ) : (
                <span className="text-gray-400 text-sm">Not uploaded</span>
            )}
        </div>
    );
}





export default TherapistDetails