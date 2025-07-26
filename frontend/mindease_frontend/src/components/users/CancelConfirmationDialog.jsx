import { useState } from 'react';
import { showToast } from '../../utils/toast';

export function CancelConfirmationDialog({ isOpen, onClose, onConfirm }) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (reason.trim() === '') {
      showToast('Please provide a reason for cancelling.', "error")
      return;
    }
    onConfirm(reason); // pass the reason back
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-30 z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6">
        <h2 className="text-xl font-semibold text-gray-800">Cancel Appointment</h2>
        <p className="text-gray-600 mt-4">Please provide a reason for cancelling this appointment:</p>

        <textarea
          className="w-full mt-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          rows="4"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter your reason here..."
        ></textarea>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
            onClick={onClose}
          >
            No, Keep it
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            onClick={handleConfirm}
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
