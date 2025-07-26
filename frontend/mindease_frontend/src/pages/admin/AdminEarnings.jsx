import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { 
  FaRupeeSign, 
  FaHistory, 
  FaWallet
} from 'react-icons/fa';
import { getTransactions, getWalletAmount } from '../../api/therapist';
import { showToast } from '../../utils/toast';
import moment from 'moment';

function AdminEarnings() {
  const [totalEarnings, setTotalEarnings] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch total earnings
        const earningsRes = await getWalletAmount();
        setTotalEarnings(earningsRes.data);
        
        // Fetch transactions
        const transactionsRes = await getTransactions();
        setTransactions(transactionsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast('Failed to load data', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
      <nav className="flex items-center justify-between mt-6">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(indexOfLastItem, transactions.length)}
            </span> of{' '}
            <span className="font-medium">{transactions.length}</span> transactions
          </p>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => paginate(1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
            aria-label="First page"
          >
            «
          </button>
          <button
            onClick={() => paginate(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
            aria-label="Previous page"
          >
            ‹
          </button>

          {startPage > 1 && (
            <span className="px-3 py-1 text-gray-700">...</span>
          )}

          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`px-3 py-1 rounded-md border border-gray-300 ${currentPage === number ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              {number}
            </button>
          ))}

          {endPage < totalPages && (
            <span className="px-3 py-1 text-gray-700">...</span>
          )}

          <button
            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
            aria-label="Next page"
          >
            ›
          </button>
          <button
            onClick={() => paginate(totalPages)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
            aria-label="Last page"
          >
            »
          </button>
        </div>
      </nav>
    );
  };

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
                <p className="text-3xl font-bold text-gray-800 flex items-center">
                  <FaRupeeSign className="mr-2" /> {totalEarnings.balance || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FaWallet className="text-blue-600 text-2xl" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Transaction History Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <FaHistory className="mr-2 text-blue-500" /> Transaction History
            </h2>
          </div>
          
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No transactions found</p>
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

              <PaginationControls />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminEarnings;