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
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminNotification from '../../components/admin/AdminNotifications';

const AdminDashboard = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      const res = await getInfoForAdminDash();
      if (res.success) {
        setData(res.data);
      }
      setLoading(false);
    };

    fetchInfo();
  }, []);

  if (loading) return <div className="loading">Loading Dashboard...</div>;

  return (
    <div className="dashboard-container">
      <AdminSidebar />
      
      <div className="dashboard-content">
        {/* Session Statistics */}
        <div className="dashboard-section">
          <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
          <div className="relative">
            <AdminNotification />
          </div>
        </div>
          
          <div className="stats-grid">
            {/* Session Status Pie Chart */}
            <div className="stat-card wide">
              <h3>Session Status</h3>
              <div style={{ height: 300 }}>
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
                      fill="#8884d8"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      dataKey="value"
                    >
                      <Cell fill="#00C49F" />
                      <Cell fill="#FFBB28" />
                      <Cell fill="#FF8042" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="stats-summary">
                <p>Completed: {data.sessionStats.completed}</p>
                <p>Scheduled: {data.sessionStats.scheduled}</p>
                <p>Cancelled: {data.sessionStats.cancelled}</p>
              </div>
            </div>
            
            {/* Today's Sessions */}
            <div className="stat-card">
              <h3>Today's Sessions</h3>
              <div className="today-stats">
                <div>
                  <p className="big-number">{data.sessionStats.today.scheduled}</p>
                  <p>Scheduled</p>
                </div>
                <div>
                  <p className="big-number">{data.sessionStats.today.completionRate}%</p>
                  <p>Completion Rate</p>
                </div>
              </div>
            </div>
            
            {/* Monthly Sessions Chart */}
            <div className="stat-card wide">
              <h3>Monthly Sessions ({new Date().getFullYear()})</h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.monthlySessions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sessions" fill="#4e73df" name="Sessions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue and User Statistics */}
        <div className="dashboard-section">
          <h2><FaMoneyBillWave /> Revenue & User Statistics</h2>
          
          <div className="stats-grid">
            {/* Revenue Overview */}
            <div className="stat-card wide">
              <h3>Revenue Overview</h3>
              <div style={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { period: 'Today', revenue: data.revenue.today },
                    { period: 'This Month', revenue: data.revenue.month },
                    { period: 'This Year', revenue: data.revenue.year },
                    { period: 'Total', revenue: data.revenue.total }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#4e73df" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="revenue-breakdown">
                <div>
                  <p>Today: ₹{data.revenue.today.toLocaleString()}</p>
                  <p>This Month: ₹{data.revenue.month.toLocaleString()}</p>
                </div>
                <div>
                  <p>This Year: ₹{data.revenue.year.toLocaleString()}</p>
                  <p>Total: ₹{data.revenue.total.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            {/* User Counts */}
            <div className="stat-card">
              <h3><FaUsers /> User Statistics</h3>
              <div className="user-stats">
                <p>Total Users: {data.users.total}</p>
                <p>Therapists: {data.users.therapists}</p>
                <p>Blocked Users: {data.users.blocked.users}</p>
                <p>Blocked Therapists: {data.users.blocked.therapists}</p>
              </div>
            </div>
            
            {/* New Users */}
            <div className="stat-card">
              <h3>New Users</h3>
              <div className="new-users">
                <div>
                  <p className="big-number">{data.users.new.today}</p>
                  <p>Today</p>
                </div>
                <div>
                  <p className="big-number">{data.users.new.month}</p>
                  <p>This Month</p>
                </div>
                <div>
                  <p className="big-number">{data.users.new.year}</p>
                  <p>This Year</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="dashboard-section">
          <h2>Top Performers</h2>
          
          <div className="stats-grid">
            {/* Top Therapists by Sessions */}
            <div className="stat-card">
              <h3>Top Therapists (Sessions)</h3>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Therapist</th>
                    <th>Sessions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPerformers.therapists.mostSessions.map((therapist, i) => (
                    <tr key={i}>
                      <td>{therapist.therapist__id}</td>
                      <td>{therapist.therapist__therapist_details__fullname}</td>
                      <td>{therapist.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Least Active Therapists */}
            <div className="stat-card">
              <h3>Least Active Therapists</h3>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Therapist</th>
                    <th>Sessions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPerformers.therapists.leastSessions.map((therapist, i) => (
                    <tr key={i}>
                      <td>{therapist.therapist__id}</td>
                      <td>{therapist.therapist__therapist_details__fullname}</td>
                      <td>{therapist.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Top Revenue Therapists */}
            <div className="stat-card">
              <h3>Top Revenue Therapists</h3>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Therapist</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPerformers.therapists.mostRevenue.map((therapist, i) => (
                    <tr key={i}>
                      <td>{therapist.wallet__user__id}</td>
                      <td>{therapist.wallet__user__username}</td>
                      <td>₹{therapist.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Top Clients */}
            <div className="stat-card">
              <h3>Top Clients (Sessions)</h3>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Client</th>
                    <th>Sessions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPerformers.clients.mostSessions.map((client, i) => (
                    <tr key={i}>
                      <td>{client.client__id}</td>
                      <td>{client.client__username}</td>
                      <td>{client.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Cancellation Analysis */}
        <div className="dashboard-section">
          <h2><FaUserSlash /> Cancellation Analysis</h2>
          
          <div className="stats-grid">
            {/* Top Cancellation Clients */}
            <div className="stat-card">
              <h3>Top Cancellation Clients</h3>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Client</th>
                    <th>Cancellations</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPerformers.clients.mostCancelled.map((client, i) => (
                    <tr key={i}>
                      <td>{client.client__id}</td>
                      <td>{client.client__username}</td>
                      <td>{client.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Top Cancellation Therapists */}
            <div className="stat-card">
              <h3>Top Cancellation Therapists</h3>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Therapist</th>
                    <th>Cancellations</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPerformers.therapists.mostCancelled.map((therapist, i) => (
                    <tr key={i}>
                      <td>{therapist.therapist__id}</td>
                      <td>{therapist.therapist__therapist_details__fullname}</td>
                      <td>{therapist.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Blocked Accounts */}
            <div className="stat-card">
              <h3><FaUserShield /> Blocked Accounts</h3>
              <div className="blocked-stats">
                <div>
                  <p className="big-number">{data.users.blocked.users}</p>
                  <p>Blocked Users</p>
                </div>
                <div>
                  <p className="big-number">{data.users.blocked.therapists}</p>
                  <p>Blocked Therapists</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          display: flex;
          min-height: 100vh;
        }
        
        .dashboard-content {
          flex: 1;
          padding: 20px;
          margin-left: 220px; /* This should match the width of your sidebar */
          font-family: Arial, sans-serif;
          max-width: calc(1400px - 220px); /* Adjust max-width to account for sidebar */
        }
        
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-size: 1.5rem;
          margin-left: 220px;
          width: calc(100% - 220px);
        }
        
        .dashboard-section {
          margin-bottom: 40px;
        }
        
        .dashboard-section h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          color: #2c3e50;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .stat-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .stat-card.wide {
          grid-column: span 2;
        }
        
        .stat-card h3 {
          margin-top: 0;
          margin-bottom: 15px;
          color: #34495e;
        }
        
        .stats-summary p {
          margin: 5px 0;
          font-size: 14px;
        }
        
        .today-stats, .new-users, .blocked-stats {
          display: flex;
          justify-content: space-around;
          text-align: center;
        }
        
        .today-stats > div, .new-users > div, .blocked-stats > div {
          padding: 10px;
        }
        
        .big-number {
          font-size: 2rem;
          font-weight: bold;
          margin: 10px 0;
          color: #2c3e50;
        }
        
        .revenue-breakdown {
          display: flex;
          justify-content: space-between;
        }
        
        .user-stats p {
          margin: 10px 0;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th, td {
          padding: 8px 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        
        th {
          background-color: #f8f9fa;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;