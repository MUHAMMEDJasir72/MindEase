import React, { useState, useEffect } from 'react';
import TherapistSidebar from '../../components/Therapist/TherapistSidebar';
import { FaRupeeSign, FaHistory, FaMoneyBillWave, FaWallet } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { getTransactions, getWalletAmount, requestWithdraw } from '../../api/therapist';
import { showToast } from '../../utils/toast';

function Earnings() {
  const [wallet, setWallet] = useState({ balance: 0 });
  const [transactions, setTransactions] = useState([]);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(5); // Show 5 transactions per page

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const walletRes = await getWalletAmount();
      setWallet(walletRes.data);
      
      const transactionsRes = await getTransactions();
      setTransactions(transactionsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      showToast('Failed to load wallet data', 'error');
      setLoading(false);
    }
  };

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();

    if (!withdrawalAmount || !upiId) {
      showToast('Please fill all fields', 'error');
      return;
    }

    const amount = parseInt(withdrawalAmount);
    if (isNaN(amount)) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    if (amount <= 0) {
      showToast('Amount must be greater than 0', 'error');
      return;
    }

    if (amount > wallet.balance) {
      showToast('Withdrawal amount exceeds your balance', 'error');
      return;
    }

    try {
      const res = await requestWithdraw({
        amount: amount,
        upi_id: upiId.trim()
      });

      if (res.success) {
        showToast(res.message, 'success');
        setShowWithdrawalForm(false);
        setWithdrawalAmount('');
        setUpiId('');
        fetchWalletData(); // Refresh balance and transaction history
      } else {
        showToast(res.message, 'error');
      }
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      showToast('Failed to submit withdrawal request', 'error');
    }
  };

  // Pagination logic
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  const PaginationControls = () => {
    const maxVisiblePages = 5;
    let startPage, endPage;

    if (totalPages <= maxVisiblePages) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const maxPagesBeforeCurrent = Math.floor(maxVisiblePages / 2);
      const maxPagesAfterCurrent = Math.ceil(maxVisiblePages / 2) - 1;
      
      if (currentPage <= maxPagesBeforeCurrent) {
        startPage = 1;
        endPage = maxVisiblePages;
      } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
        startPage = totalPages - maxVisiblePages + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - maxPagesBeforeCurrent;
        endPage = currentPage + maxPagesAfterCurrent;
      }
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 border-t pt-4">
        <div className="text-sm text-gray-700 mb-2 sm:mb-0">
          Showing <span className="font-medium">{indexOfFirstTransaction + 1}</span> to{' '}
          <span className="font-medium">{Math.min(indexOfLastTransaction, transactions.length)}</span> of{' '}
          <span className="font-medium">{transactions.length}</span> transactions
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            aria-label="First page"
          >
            <FiChevronsLeft size={16} />
          </button>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            aria-label="Previous page"
          >
            <FiChevronLeft size={16} />
          </button>

          {startPage > 1 && (
            <span className="px-3 py-1 flex items-center">...</span>
          )}

          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => setCurrentPage(number)}
              className={`px-3 py-1 rounded-md border ${currentPage === number ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300'}`}
            >
              {number}
            </button>
          ))}

          {endPage < totalPages && (
            <span className="px-3 py-1 flex items-center">...</span>
          )}

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            aria-label="Next page"
          >
            <FiChevronRight size={16} />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            aria-label="Last page"
          >
            <FiChevronsRight size={16} />
          </button>
        </div>
      </div>
    );
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
                <>
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
                        {currentTransactions.map((transaction) => (
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
                  {transactions.length > transactionsPerPage && (
                    <PaginationControls />
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Earnings;