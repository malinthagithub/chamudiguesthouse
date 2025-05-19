import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import './Revenue.css';
import { Link } from 'react-router-dom';
import RevenueReportDownload from '../ownercomponets/RevenueReportDownload';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  
    const styles = {
      overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      },
      modal: {
        color: '#000',
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '10px',
        width: '400px',
        position: 'relative',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
      },
      closeButton: {
        position: 'absolute',
        top: '10px',
        right: '-180px',
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#000',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        zIndex: 1001,
      }
    }

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
  const handleDownloadOccupancyReport = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reports/download/occupancy');

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Check if the response is a PDF
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        throw new Error('Response is not a PDF');
      }

      // Convert response to blob
      const blob = await response.blob();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;

      // Set the suggested file name
      link.download = 'occupancy_report_may_2025.pdf';

      // Append to DOM and trigger click
      document.body.appendChild(link);
      link.click();

      // Cleanup: remove the link and revoke the object URL
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error downloading the PDF:', error);
    }
  };


 
  const handleDownloadwalk = () => {
    // Create a link element
    const link = document.createElement("a");
    link.href = "http://localhost:5000/api/reports/download/walkin"; // Adjust the backend URL if necessary
    link.setAttribute("download", "revenue_report.csv"); // Set the default file name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "http://localhost:5000/api/reports/download/online";  // Use correct route here
    link.setAttribute("download", "online_revenue_report.csv");
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
              <Link to="/all-bookings" style={{ textDecoration: 'none', color: 'white' }}>
                All Bookings
              </Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link to="/cancellations" style={{ textDecoration: 'none', color: 'white' }}>
                Cancelled Bookings
              </Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link to="/clerk-faq-dashboard" style={{ textDecoration: 'none', color: 'white' }}>
                FQA
              </Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link to="/today-bookings" style={{ textDecoration: 'none', color: 'white' }}>
                Atendence
              </Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link to="/booking-customizations" style={{ textDecoration: 'none', color: 'white' }}>
                Customizations Booking
              </Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link to="/clerk-available" style={{ textDecoration: 'none', color: 'white' }}>
                On-site Booking Guest
              </Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link to="/walk_view" style={{ textDecoration: 'none', color: 'white' }}>
                walk_view
              </Link>
            </li>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{ marginBottom: '10px', position: 'relative', top: '80px' }}
            >
              Revenue Report
            </button>
            

            <div>
              <button style={{ marginBottom: '10px', position: "relative", top: "80px" }} onClick={handleDownload}>Online Booking Report</button>
            </div>
            <div>
              <button style={{ marginBottom: '10px', position: "relative", top: "80px" }} onClick={handleDownloadwalk}>walk Report</button>
            </div>

          </ul>
        </div>

        <div className='monthly'>
          {view === 'monthly' && <><h3>Monthly Revenue</h3><Bar data={generateChartData(analyticsData.monthlyRevenue.map(item => `${item.month}-${item.year}`), analyticsData.monthlyRevenue.map(item => item.revenue), 'rgba(75, 192, 192, 1)')} options={{ responsive: true }} /></>}
          {view === 'daily' && <><h3>Daily Revenue</h3><Bar data={generateChartData(analyticsData.dailyRevenue.map(item => `${item.day}-${item.month}-${item.year}`), analyticsData.dailyRevenue.map(item => item.revenue), 'rgba(255, 99, 132, 1)')} options={{ responsive: true }} /></>}
        </div>

       <div>
  <h3>Room-wise Revenue</h3>
  <Pie
    className="pie-chart"
    data={{
      labels: analyticsData.roomWiseRevenue.map(item => item.room_name),
      datasets: [{
        label: 'Room-wise Revenue',
        data: analyticsData.roomWiseRevenue.map(item => item.revenue),
        backgroundColor: analyticsData.roomWiseRevenue.map(() => `rgba(${Math.random() * 256}, ${Math.random() * 256}, ${Math.random() * 256}, 0.6)`)
      }]
    }}
    options={{
      responsive: true,
      plugins: { legend: { display: false } }  // disable default legend
    }}
  />
  <ul className="custom-legend">
    {analyticsData.roomWiseRevenue.map((item, index) => (
      <li key={index} style={{ color: `rgba(${Math.random() * 256}, ${Math.random() * 256}, ${Math.random() * 256}, 0.6)` }}>
        {item.room_name}: <strong>{item.revenue.toFixed(2)}</strong>
      </li>
    ))}
  </ul>
</div>


        <div className='Monthly-Guest'>
          <h3>Monthly Guest Count</h3>
          <Bar data={generateChartData(analyticsData.monthlyGuestCount.map(item => `${item.month}-${item.year}`), analyticsData.monthlyGuestCount.map(item => item.guest_count), 'rgba(255, 159, 64, 1)')} options={{ responsive: true }} />
        </div>

        <div className='current-guest'>
          <h3>Active Guest Count</h3>
          <Bar
            data={{
              labels: ['Active Guests'], // x-axis label
              datasets: [
                {
                  label: 'Current Guest Count',
                  data: [analyticsData.currentGuestCount], // y-axis data
                  backgroundColor: ['rgba(54, 162, 235, 0.6)'], // Bar color
                  borderColor: ['rgba(54, 162, 235, 1)'], // Border color
                  borderWidth: 1, // Border width
                },
              ],
            }}
            options={{
              responsive: true,
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Guest Status', // x-axis title
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: 'Count', // y-axis title
                  },
                  beginAtZero: true, // Start y-axis from 0
                },
              },
              plugins: {
                tooltip: {
                  enabled: true,
                },
                legend: {
                  position: 'top',
                },
              },
            }}
          />
        </div>
      {isModalOpen && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={styles.closeButton}
              >
                X
              </button>
              <RevenueReportDownload />
            </div>
          </div>
        )}
        {/* Today's Bookings Section */}
        <div>
          <div style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse', position: 'relative', top: '-100px', left: '-300px' }}></div>
          <h3 style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse', position: 'relative', top: '-10px',left: '120px' }}> Today's Bookings</h3>
          <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse',position: 'relative', top: '-10px', left: '-100px' }}>
            <thead>
              <tr>
                <th style={{ padding: '10px', backgroundColor: '#f4f4f4' }}>Room Name</th>
                <th style={{ padding: '10px', backgroundColor: '#f4f4f4' }}>Username</th>
                <th style={{ padding: '10px', backgroundColor: '#f4f4f4' }}>Check-in Date</th>
                <th style={{ padding: '10px', backgroundColor: '#f4f4f4' }}>Checkout Date</th>
                <th style={{ padding: '10px', backgroundColor: '#f4f4f4' }}>Payment Amount</th>
                <th style={{ padding: '10px', backgroundColor: '#f4f4f4' }}>status</th>
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
                  <td style={{ padding: '10px', textAlign: 'center' }}>{booking.status}</td>
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
          
          <h3 style={{position:'relative',top:'20px',left:'120px'}}>This Week's Bookings</h3>
          <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse',position: 'relative', top: '20px', left: '-100px' }}>
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
