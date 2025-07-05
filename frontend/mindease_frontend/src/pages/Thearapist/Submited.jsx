import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../api/auth';

const Submitted = () => {
  const handleEditForm = () => {
    // Add your navigation logic here
    console.log("Navigate to edit form");
  };

  const handleViewForm = () => {
    // Add your navigation logic here
    console.log("Navigate to view form");
  };
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        {/* Checkmark icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <svg 
            className="h-12 w-12 text-green-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>
        
        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Application Submitted Successfully
        </h1>
        
        {/* Description */}
        <p className="text-gray-600 mb-8">
          Thank you for applying to become a therapist on our platform. Your application is now under review by our admin team.
        </p>
        
        {/* Info box */}
        <div className="bg-gray-50 p-6 rounded-lg text-left mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            What happens next?
          </h2>
          
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>
              Your application is under review by the admin. You will be notified once it's approved or if further information is required.
            </li>
            <li>
              If your application is approved, you will be notified via email, and your profile will be visible to users.
            </li>
            <li>
              If additional information is needed, you will receive a notification with instructions on what to provide.
            </li>
            <li>
              You can update your form by clicking the 'Edit' button if needed.
            </li>
          </ul>
        </div>
        
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={handleEditForm}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Edit Form
          </button>
          <button
            onClick={handleViewForm}
            className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            See My Form
          </button>
          <button
          className="px-6 py-2 border border-red-400 text-red-600 rounded-md hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Submitted;