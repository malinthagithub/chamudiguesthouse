import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import './Revenue.css';
import { Link } from 'react-router-dom';

// Register required chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Revenue = () => {
  const [analyticsData, setAnalyticsData] = useState({
    monthlyRevenue: [],
    roomWiseRevenue: [],
    monthlyGuestCount: [],
    dailyRevenue: [],
    currentGuestCount: 0,
  });
  const [todayBookings, setTodayBookings] = useState([]);
  const [weekBookings, setWeekBookings] = useState([]);
  const [view, setView] = useState('monthly');

  useEffect(() => {
    fetch('http://localhost:5000/api/revenue/analytics')
      .then((response) => response.json())
      .then((data) => {
        const monthlyRevenue = data.filter(item => item.type === 'monthly') || [];
        const roomWiseRevenue = data.filter(item => item.type === 'room-wise') || [];
        const monthlyGuestCount = data.filter(item => item.type === 'monthly_guest_count') || [];
        const dailyRevenue = data.filter(item => item.type === 'daily') || [];
        const currentGuestCount = data.find(item => item.type === 'current_guest_count')?.guest_count || 0;
  
        const aggregatedRoomWiseRevenue = {};
        roomWiseRevenue.forEach((item) => {
          aggregatedRoomWiseRevenue[item.room_id] = aggregatedRoomWiseRevenue[item.room_id] || { room_name: item.room_name, revenue: 0 };
          aggregatedRoomWiseRevenue[item.room_id].revenue += parseFloat(item.revenue);
        });
  
        setAnalyticsData({
          monthlyRevenue,
          roomWiseRevenue: Object.values(aggregatedRoomWiseRevenue),
          monthlyGuestCount,
          dailyRevenue,
          currentGuestCount,
        });
      })
      .catch((error) => console.error('Error fetching analytics data:', error));
  
    fetch('http://localhost:5000/api/booktody/today-and-week-bookings')
      .then((response) => response.json())
      .then((data) => {
        setTodayBookings(data.todayBookings || []);
        setWeekBookings(data.weekBookings || []);
      })
      .catch((error) => console.error('Error fetching today and week bookings:', error));
  }, []);
  

  const generateChartData = (labels, data, color) => ({
    labels,
    datasets: [{
      label: labels[0],
      data,
      borderColor: color,
      backgroundColor: `${color}33`,
      tension: 0.1,
    }],
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const handleDownload = () => {
    // Create a link element
    const link = document.createElement("a");
    link.href = "http://localhost:5000/api/reports/download"; // Adjust the backend URL if necessary
    link.setAttribute("download", "revenue_report.csv"); // Set the default file name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="revenue-analytics">
      <h2>Revenue and Guest Analytics</h2>
      <div>
        <select value={view} onChange={(e) => setView(e.target.value)}>
          <option value="monthly">Monthly Revenue</option>
          <option value="daily">Daily Revenue</option>
        </select>
      </div>
      <div className="dashboard-container" style={{ display: 'flex', height: '100vh' }}>
        <div className="sidebar" style={{ width: '250px', backgroundcolur: '#333', color: '#fff', padding: '20px' }}>
          <h3>Dashboard</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '10px' }}>
              <Link to="/revenue" style={{ textDecoration: 'none', color: 'white' }}>
                Home
              </Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link to="/dashboard" style={{ textDecoration: 'none', color: 'white' }}>
                Manage Rooms
              </Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link to="/add-room" style={{ textDecoration: 'none', color: 'white' }}>
                Add-Room
              </Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link to="/comment" style={{ textDecoration: 'none', color: 'white' }}>
                Coment
              </Link>
            </li>
            <li style={{ marginBottom: '10px' }}>Settings</li>
            <div>
          <button style={{ marginBottom: '10px',position:"relative", top:"300px" }} onClick={handleDownload}>Download Report</button>
        </div>
          </ul>
        </div>

        <div>
          {view === 'monthly' && <><h3>Monthly Revenue</h3><Bar data={generateChartData(analyticsData.monthlyRevenue.map(item => `${item.month}-${item.year}`), analyticsData.monthlyRevenue.map(item => item.revenue), 'rgba(75, 192, 192, 1)')} options={{ responsive: true }} /></>}
          {view === 'daily' && <><h3>Daily Revenue</h3><Bar data={generateChartData(analyticsData.dailyRevenue.map(item => `${item.day}-${item.month}-${item.year}`), analyticsData.dailyRevenue.map(item => item.revenue), 'rgba(255, 99, 132, 1)')} options={{ responsive: true }} /></>}
        </div>

        <div>
          <h3>Room-wise Revenue</h3>
          <Pie data={{ labels: analyticsData.roomWiseRevenue.map(item => `${item.room_name}: ${item.revenue.toFixed(2)}`), datasets: [{ label: 'Room-wise Revenue', data: analyticsData.roomWiseRevenue.map(item => item.revenue), backgroundColor: analyticsData.roomWiseRevenue.map(() => `rgba(${Math.random() * 256}, ${Math.random() * 256}, ${Math.random() * 256}, 0.6)`) }] }} options={{ responsive: true }} />
        </div>

        <div>
          <h3>Monthly Guest Count</h3>
          <Bar data={generateChartData(analyticsData.monthlyGuestCount.map(item => `${item.month}-${item.year}`), analyticsData.monthlyGuestCount.map(item => item.guest_count), 'rgba(255, 159, 64, 1)')} options={{ responsive: true }} />
        </div>

        <div>
          <h3>Active Guest Count</h3>
          <Pie data={{ labels: ['Active Guests'], datasets: [{ label: 'Current Guest Count', data: [analyticsData.currentGuestCount], backgroundColor: ['rgba(54, 162, 235, 0.6)'] }] }} options={{ responsive: true }} />
        </div>

        {/* Today's Bookings Section */}
        <div>
          <h3>Today's Bookings</h3>
          <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '10px', backgroundColor: '#f4f4f4' }}>Room Name</th>
                <th style={{ padding: '10px', backgroundColor: '#f4f4f4' }}>Username</th>
                <th style={{ padding: '10px', backgroundColor: '#f4f4f4' }}>Check-in Date</th>
                <th style={{ padding: '10px', backgroundColor: '#f4f4f4' }}>Checkout Date</th>
                <th style={{ padding: '10px', backgroundColor: '#f4f4f4' }}>Payment Amount</th>
              </tr>
            </thead>
            <tbody>
              {todayBookings.length > 0 ? todayBookings.map((booking, index) => (
                <tr key={index}>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{booking.room_name}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{booking.username}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{formatDate(booking.checkin_date)}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{formatDate(booking.checkout_date)}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{formatCurrency(booking.payment_amount)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ padding: '10px', textAlign: 'center' }}>No bookings for today</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* This Week's Bookings Section */}
        <div>
          <h3>This Week's Bookings</h3>
          <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '10px', backgroundColor: '#f4f4f4' }}>Room Name</th>
                <th style={{ padding: '10px', backgroundColor: '#f4f4f4' }}>Username</th>
                <th style={{ padding: '10px', backgroundColor: '#f4f4f4' }}>Check-in Date</th>
                <th style={{ padding: '10px', backgroundColor: '#f4f4f4' }}>Checkout Date</th>
                <th style={{ padding: '10px', backgroundColor: '#f4f4f4' }}>Payment Amount</th>
              </tr>
            </thead>
            <tbody>
              {weekBookings.length > 0 ? weekBookings.map((booking, index) => (
                <tr key={index}>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{booking.room_name}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{booking.username}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{formatDate(booking.checkin_date)}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{formatDate(booking.checkout_date)}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{formatCurrency(booking.payment_amount)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ padding: '10px', textAlign: 'center' }}>No bookings this week</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Revenue;
