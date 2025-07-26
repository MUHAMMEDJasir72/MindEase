import React, { useEffect, useState } from 'react';
import Navbar from '../../components/users/Navbar';
import { getTransactions, getWalletAmount } from '../../api/therapist';
import { showToast } from '../../utils/toast';
import { requestClientWithdraw } from '../../api/user';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

function Wallet() {
  const [walletAmount, setWalletAmount] = useState({ balance: 0 });
  const [transactions, setTransactions] = useState([]);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
      setWalletAmount(walletRes.data);
      
      const transactionsRes = await getTransactions();
      setTransactions(transactionsRes.data);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      showToast('Failed to load wallet data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
  
    if (!withdrawAmount || !upiId) {
      showToast('Please fill all fields', 'error');
      return;
    }
  
    const amount = parseInt(withdrawAmount);
    if (isNaN(amount)) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    if (amount <= 0) {
      showToast('Amount must be greater than 0', 'error');
      return;
    }
  
    if (amount > walletAmount.balance) {
      showToast('Withdrawal amount exceeds your balance', 'error');
      return;
    }
  
    try {
      setLoading(true);
      const res = await requestClientWithdraw({
        amount: amount,
        upi_id: upiId.trim()
      });
  
      if (res.success) {
        showToast('Withdrawal request submitted successfully', 'success');
        setShowWithdrawForm(false);
        setWithdrawAmount('');
        setUpiId('');
        await fetchWalletData();
      } else {
        showToast(res.message || 'Withdrawal failed', 'error');
      }
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      showToast('Failed to submit withdrawal request', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        <div className={`${mobileNavOpen ? 'block' : 'hidden'} md:block w-full md:w-56 md:min-w-[14rem] bg-white shadow-md fixed md:relative z-40 h-full`}>
          <Navbar onClose={() => setMobileNavOpen(false)} />
        </div>
        <main className="flex-1 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Mobile Navigation Toggle */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-teal-600 text-white"
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
      >
        ☰
      </button>

      {/* Sidebar Navigation - Hidden on mobile unless toggled */}
      <div className={`${mobileNavOpen ? 'block' : 'hidden'} md:block w-full md:w-56 md:min-w-[14rem] bg-white shadow-md fixed md:relative z-40 h-full`}>
        <Navbar onClose={() => setMobileNavOpen(false)} />
      </div>
      
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 mt-16 md:mt-0">
        <div className="max-w-4xl mx-auto">
          {/* Wallet Balance Card */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">My Wallet</h2>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
              <div>
                <p className="text-gray-600 text-sm sm:text-base">Available Balance</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">₹{walletAmount.balance}</p>
              </div>
              
              {walletAmount.balance > 0 && (
                <button
                  onClick={() => setShowWithdrawForm(!showWithdrawForm)}
                  disabled={loading}
                  className={`px-3 sm:px-4 py-1 sm:py-2 rounded-md font-medium text-sm sm:text-base ${showWithdrawForm ? 'bg-gray-200 text-gray-800' : 'bg-blue-600 text-white hover:bg-blue-700'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {showWithdrawForm ? 'Cancel' : 'Withdraw Money'}
                </button>
              )}
            </div>
            
            {/* Withdraw Form */}
            {showWithdrawForm && (
              <form onSubmit={handleWithdrawalSubmit} className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Withdraw Funds</h3>
                
                <div className="mb-3 sm:mb-4">
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    min="1"
                    max={walletAmount.balance}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="mb-3 sm:mb-4">
                  <label htmlFor="upi" className="block text-sm font-medium text-gray-700 mb-1">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    id="upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    required
                    disabled={loading}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-sm sm:text-base ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Processing...' : 'Request Withdrawal'}
                </button>
              </form>
            )}
          </div>
          
          {/* Transaction History */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Transaction History</h3>
            
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-6 sm:py-8">No transactions yet</p>
            ) : (
              <>
                <div className="space-y-3 sm:space-y-4">
                  {currentTransactions.map((txn) => (
                    <div 
                      key={txn.id} 
                      className={`p-3 sm:p-4 rounded-lg border-l-4 ${txn.transaction_type === 'CREDIT' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0">
                        <div>
                          <p className="font-medium text-sm sm:text-base">{txn.transaction_type === 'CREDIT' ? 'Credit' : 'Debit'}</p>
                          <p className="text-xs sm:text-sm text-gray-500">{formatDate(txn.created_at)}</p>
                        </div>
                        <p className={`text-base sm:text-lg font-semibold ${txn.transaction_type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                          {txn.transaction_type === 'CREDIT' ? '+' : '-'}₹{txn.amount}
                        </p>
                      </div>
                      {txn.description && (
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">{txn.description}</p>
                      )}
                    </div>
                  ))}
                </div>
                {transactions.length > transactionsPerPage && (
                  <PaginationControls />
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Wallet;