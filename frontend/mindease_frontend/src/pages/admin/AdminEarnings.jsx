import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { 
  FaRupeeSign, 
  FaHistory, 
  FaWallet, 
  FaUser, 
  FaCheckCircle, 
  FaClock,
  FaExchangeAlt,
  FaTimes
} from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment';
import { getTransactions, getWalletAmount } from '../../api/therapist';
import { getWithdrawRequests, processWithdraw } from '../../api/admin';
import { showToast } from '../../utils/toast';

function AdminEarnings() {
  const [totalEarnings, setTotalEarnings] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [loading, setLoading] = useState({
    earnings: true,
    transactions: true,
    requests: true
  });
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch total earnings
      const earningsRes = await getWalletAmount();
      setTotalEarnings(earningsRes.data);
      setLoading(prev => ({...prev, earnings: false}));
      
      // Fetch transactions
      const transactionsRes = await getTransactions();
      setTransactions(transactionsRes.data);
      setLoading(prev => ({...prev, transactions: false}));
      
      // Fetch withdrawal requests
      const requestsRes = await getWithdrawRequests();
      setWithdrawalRequests(requestsRes.data);
      setLoading(prev => ({...prev, requests: false}));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
      setLoading({earnings: false, transactions: false, requests: false});
    }
  };

  const openConfirmationModal = (request) => {
    setSelectedRequest(request);
    setShowConfirmationModal(true);
  };

  const closeConfirmationModal = () => {
    setShowConfirmationModal(false);
    setSelectedRequest(null);
  };

  const handleProcessRequest = async () => {
  if (!selectedRequest) return;

  try {
    const res = await processWithdraw(selectedRequest.id);
    if (res.success) {
      showToast(res.message, 'success');
      closeConfirmationModal();
      fetchData(); // Refresh data
    }
  } catch (error) {
    console.error('Error processing request:', error);
    toast.error('Failed to process request');
    closeConfirmationModal();
  }
};
console.log(withdrawalRequests)

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 p-8 overflow-y-auto ml-[220px]">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Earnings Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Total Earnings Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-600 mb-1">Total Earnings</h2>
                {loading.earnings ? (
                  <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-gray-800 flex items-center">
                    <FaRupeeSign className="mr-2" /> {totalEarnings.balance}
                  </p>
                )}
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FaWallet className="text-blue-600 text-2xl" />
              </div>
            </div>
          </div>
          
          {/* Pending Requests Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-600 mb-1">Pending Withdrawals</h2>
                {loading.requests ? (
                  <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-gray-800">
                    {withdrawalRequests.filter(r => !r.is_processed).length}
                  </p>
                )}
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <FaClock className="text-yellow-600 text-2xl" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Withdrawal Requests Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <FaExchangeAlt className="mr-2 text-blue-500" /> Withdrawal Requests
            </h2>
          </div>
          
          {loading.requests ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : withdrawalRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No withdrawal requests found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Therapist</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UPI ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {withdrawalRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <FaUser className="text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{request.therapist}</div>
                            {request.therapist.email && (
                              <div className="text-sm text-gray-500">{request.therapist.email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{request.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.upi_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {moment(request.created_at).format('DD MMM YYYY, h:mm A')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.is_processed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.is_processed ? 'Processed' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {!request.is_processed && (
                          <button
                            onClick={() => openConfirmationModal(request)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-md text-sm"
                          >
                            Mark as Processed
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Transaction History Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <FaHistory className="mr-2 text-blue-500" /> Transaction History
            </h2>
          </div>
          
          {loading.transactions ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No transactions found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {moment(transaction.created_at).format('DD MMM YYYY, h:mm A')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.transaction_type === 'CREDIT' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.transaction_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.description || 'N/A'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        transaction.transaction_type === 'CREDIT' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {transaction.transaction_type === 'CREDIT' ? '+' : '-'}₹{transaction.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {showConfirmationModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Confirm Processing</h3>
                <button 
                  onClick={closeConfirmationModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="mb-2">You are about to mark this withdrawal request as processed:</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FaUser className="text-gray-500 mr-2" />
                    <span className="font-medium">{selectedRequest.therapist}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <FaRupeeSign className="text-gray-500 mr-2" />
                    <span>Amount: ₹{selectedRequest.amount}</span>
                  </div>
                  <div className="flex items-center">
                    <FaWallet className="text-gray-500 mr-2" />
                    <span>UPI ID: {selectedRequest.upi_id}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeConfirmationModal}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessRequest}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Confirm Processing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminEarnings;