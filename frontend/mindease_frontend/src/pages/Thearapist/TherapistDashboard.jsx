import React, { useState, useEffect } from 'react'
import { CalendarClock } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import { checkIsApproved} from '../../api/therapist';
import { FaArrowLeft } from 'react-icons/fa';
import { logoutUser } from '../../api/auth';

function ThearapistDashboard() {

  const [isRequested, setIsrequested] = useState(false)
  const navigate = useNavigate()

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
        } catch (error) {
          showToast('An error occurred during logout', 'error');
          console.error('Logout error:', error);
        }
      };

  


  return (
    <div className='bg-[#dcf4f6]'>
      <div className='p-4'>
      <button className='flex items-center gap-2 text-red-500'
      onClick={handleLogout}
      >
       <FaArrowLeft className="text-red-500"/>
        Logout
      </button>
      </div> 
        <div className='bg-[#dcf4f6] text-center text-[37px] pt-10 font-san font-semibold'>
            <h1>Welcome to Mindease</h1>
        </div>
        <div className= 'bg-[#dcf4f6] w-[60%] mx-auto text-[17px] leading-[31px] pt-6'>
            <h1>
                We are delighted to have you here! Our platform connects compassionate and qualified therapists with individuals seeking support for their mental well-being.
                Together, we aim to create a safe, reliable, and empowering space for everyone involved.
            </h1>
        </div>
        <div className='w-[60%] h-[400px] bg-[#dcf4f6] mx-auto'>
          <img className='w-full h-full ' src='/banner-4.png'/>
        </div>
        {/* <div className='w-full h-[400px] bg-green-300 mt-7'>
          <h1 className='text-[21px] text-center'>Why join our platform?</h1>
          
         <CalendarClock className="w-5 h-5 text-gray-500" />
         



        </div> */}
        <div className='text-center p-12'>
        <Link to={'/requestForm'}>
        <button type="button" class="text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-lg px-7 py-2.5 text-center me-2 mb-2">Join</button>
        </Link>
        </div>
       
      
    </div>
  )
}

export default ThearapistDashboard
