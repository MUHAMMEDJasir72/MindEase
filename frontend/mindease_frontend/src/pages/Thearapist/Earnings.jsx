import React, { useState, useEffect } from 'react';
import TherapistSidebar from '../../components/Therapist/TherapistSidebar';
import { FaRupeeSign, FaHistory, FaMoneyBillWave, FaWallet } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getTransactions, getWalletAmount, requestWithdraw } from '../../api/therapist';
import { showToast } from '../../utils/toast';

function Earnings() {
  const [wallet, setWallet] = useState({ balance: 0 });
  const [transactions, setTransactions] = useState([]);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const walletRes = await getWalletAmount();
      setWallet(walletRes.data);
      
      const transactionsRes = await getTransactions()
      setTransactions(transactionsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to load wallet data');
      setLoading(false);
    }
  };

 const handleWithdrawalSubmit = async (e) => {
  e.preventDefault();

  if (!withdrawalAmount || !upiId) {
    toast.error('Please fill all fields');
    return;
  }

  const amount = parseInt(withdrawalAmount);
  if (isNaN(amount) || amount <= 0) {
    toast.error('Please enter a valid amount');
    return;
  }

  if (amount > wallet.balance) {
    toast.error('Withdrawal amount exceeds your balance');
    return;
  }

  try {
    const res = await requestWithdraw({
      amount: amount,
      upi_id: upiId.trim()
    });

    if (res.success) {
      showToast('Withdrawal request submitted successfully', 'success');
      setShowWithdrawalForm(false);
      setWithdrawalAmount('');
      setUpiId('');
      fetchWalletData(); // Refresh balance and transaction history
    } else {
      toast.error(res.message);
    }
  } catch (error) {
    console.error('Error submitting withdrawal:', error);
    toast.error('Failed to submit withdrawal request');
  }
};

  
  return (
    <div className="flex h-screen bg-gray-100">
      <TherapistSidebar />
      
      <div className="flex-1 p-8 overflow-y-auto ml-[220px]">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Earnings</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Wallet Balance Card */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Wallet Balance</h2>
                  <p className="text-3xl font-bold flex items-center">
                    <FaWallet className="mr-2" /> ₹{wallet.balance}
                  </p>
                </div>
                <button
                  onClick={() => setShowWithdrawalForm(true)}
                  className="bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium flex items-center"
                >
                  <FaMoneyBillWave className="mr-2" /> Withdraw
                </button>
              </div>
            </div>
            
            {/* Withdrawal Form Modal */}
            {showWithdrawalForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4">Withdrawal Request</h3>
                  <form onSubmit={handleWithdrawalSubmit}>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Amount (₹)</label>
                      <input
                        type="number"
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                        placeholder="Enter amount"
                        min="1"
                        max={wallet.balance}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">UPI ID</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                        placeholder="Enter your UPI ID"
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowWithdrawalForm(false)}
                        className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Submit Request
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {/* Transaction History */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <FaHistory className="mr-2 text-blue-500" /> Transaction History
                </h2>
              </div>
              
              {transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No transactions yet</p>
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
                            {new Date(transaction.created_at).toLocaleDateString()}
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
          </>
        )}
      </div>
    </div>
  );
}

export default Earnings;