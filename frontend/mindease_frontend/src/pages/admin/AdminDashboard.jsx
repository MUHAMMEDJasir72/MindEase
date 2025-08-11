import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  FaUsers, FaUserMd, FaMoneyBillWave, FaCalendarCheck,
  FaChartPie, FaChartLine, FaUserShield, FaUserSlash
} from 'react-icons/fa';
import { getInfoForAdminDash } from '../../api/admin';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminNotification from '../../components/admin/AdminNotifications';

const AdminDashboard = () => {
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      const res = await getInfoForAdminDash();
      if (res.success) {
        setData(res.data);
      }
      setIsLoading(false);
    };

    fetchInfo();
  }, []);

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

  console.log(data)

  // Color palette
  const colors = {
    primary: 'teal',
    secondary: 'indigo',
    accent: 'amber',
    success: 'emerald',
    warning: 'orange',
    danger: 'rose',
    info: 'sky'
  };

  // Chart colors
  const chartColors = {
    completed: '#10B981', // emerald-500
    scheduled: '#F59E0B', // amber-500
    cancelled: '#EF4444', // red-500
    sessions: '#6366F1', // indigo-500
    revenue: '#3B82F6' // blue-500
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 ml-[200px] p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
          <div className="fixed top-6 right-6 z-50">
            <AdminNotification />
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Today's Sessions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700">Today's Sessions</h3>
              <FaCalendarCheck className={`text-${colors.primary}-500 text-xl`} />
            </div>
            <div className="mt-4 flex justify-between">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-800">{data.sessionStats.today.scheduled}</p>
                <p className="text-sm text-gray-500">Scheduled</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-800">{data.sessionStats.today.completionRate}%</p>
                <p className="text-sm text-gray-500">Completion Rate</p>
              </div>
            </div>
          </div>
          
          {/* Total Users */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700">Total Users</h3>
              <FaUsers className={`text-${colors.secondary}-500 text-xl`} />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-gray-800">{data.users.total}</p>
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                 <span>Clients: {data.users.total_clients}</span>
                <span>Therapists: {data.users.therapists}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700">New Clients</h3>
              <FaUsers className={`text-${colors.primary}-500 text-xl`} />
            </div>
            <div className="mt-4 flex justify-between">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-800">{data.users.new.today}</p>
                <p className="text-sm text-gray-500">Today</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-800">{data.users.new.month}</p>
                <p className="text-sm text-gray-500">This month</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-800">{data.users.new.year}</p>
                <p className="text-sm text-gray-500">This year</p>
              </div>
            </div>
          </div>
          
          
          {/* Revenue Today */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700">Today's Revenue</h3>
              <FaMoneyBillWave className={`text-${colors.success}-500 text-xl`} />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-gray-800">₹{data.revenue.today.toLocaleString()}</p>
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>This Month: ₹{data.revenue.month.toLocaleString()}</span>
                <span>Total: ₹{data.revenue.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          {/* Blocked Accounts */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700">Blocked Accounts</h3>
              <FaUserSlash className={`text-${colors.danger}-500 text-xl`} />
            </div>
            <div className="mt-4 flex justify-between">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-800">{data.users.blocked.users}</p>
                <p className="text-sm text-gray-500">Users</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-800">{data.users.blocked.therapists}</p>
                <p className="text-sm text-gray-500">Therapists</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Session Status Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Session Status</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Completed', value: data.sessionStats.completed },
                      { name: 'Scheduled', value: data.sessionStats.scheduled },
                      { name: 'Cancelled', value: data.sessionStats.cancelled }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    dataKey="value"
                  >
                    <Cell fill={chartColors.completed} />
                    <Cell fill={chartColors.scheduled} />
                    <Cell fill={chartColors.cancelled} />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
              <div className="text-center">
                <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 mr-1"></span>
                Completed: {data.sessionStats.completed}
              </div>
              <div className="text-center">
                <span className="inline-block w-3 h-3 rounded-full bg-amber-500 mr-1"></span>
                Scheduled: {data.sessionStats.scheduled}
              </div>
              <div className="text-center">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
                Cancelled: {data.sessionStats.cancelled}
              </div>
            </div>
          </div>
          
          {/* Monthly Sessions Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Monthly Sessions ({new Date().getFullYear()})</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlySessions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sessions" fill={chartColors.sessions} name="Sessions" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Revenue Overview */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Revenue Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { period: 'Today', revenue: data.revenue.today },
                { period: 'This Month', revenue: data.revenue.month },
                { period: 'This Year', revenue: data.revenue.year },
                { period: 'Total', revenue: data.revenue.total }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="period" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={chartColors.revenue} 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Top Performers Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FaUserMd className={`text-${colors.primary}-500`} />
            Top Performers
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Therapists by Sessions */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 pb-4">
                <h3 className="text-lg font-medium text-gray-700">Top Therapists (Sessions)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Therapist</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.topPerformers.therapists.mostSessions.map((therapist, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{therapist.therapist__therapist_details__fullname}</div>
                          <div className="text-sm text-gray-500">ID: {therapist.therapist__id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {therapist.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Top Revenue Therapists */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 pb-4">
                <h3 className="text-lg font-medium text-gray-700">Top Revenue Therapists</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Therapist</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.topPerformers.therapists.mostRevenue.map((therapist, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{therapist.wallet__user__username}</div>
                          <div className="text-sm text-gray-500">ID: {therapist.wallet__user__id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{therapist.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Top Clients */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 pb-4">
                <h3 className="text-lg font-medium text-gray-700">Top Clients (Sessions)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.topPerformers.clients.mostSessions.map((client, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{client.client__username}</div>
                          <div className="text-sm text-gray-500">ID: {client.client__id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {client.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        {/* Cancellation Analysis */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FaUserSlash className={`text-${colors.danger}-500`} />
            Cancellation Analysis
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Cancellation Clients */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 pb-4">
                <h3 className="text-lg font-medium text-gray-700">Top Cancellation Clients</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cancellations</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.topPerformers.clients.mostCancelled.map((client, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{client.client__username}</div>
                          <div className="text-sm text-gray-500">ID: {client.client__id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {client.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Top Cancellation Therapists */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 pb-4">
                <h3 className="text-lg font-medium text-gray-700">Top Cancellation Therapists</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Therapist</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cancellations</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.topPerformers.therapists.mostCancelled.map((therapist, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{therapist.therapist__therapist_details__fullname}</div>
                          <div className="text-sm text-gray-500">ID: {therapist.therapist__id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {therapist.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;