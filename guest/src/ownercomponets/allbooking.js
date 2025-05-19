import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './allbooking.css';
import { format, parseISO } from 'date-fns';

// Simple icons as components for clarity
const SearchIcon = () => <span>🔍</span>;
const FilterIcon = () => <span>⚙️</span>;
const CalendarIcon = () => <span>📅</span>;
const SpinnerIcon = () => <span className="spinner">🔄</span>;

const AllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState(''); // Not currently used in UI, you can add if needed
  const [sortConfig, setSortConfig] = useState({ key: 'checkin_date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const bookingsPerPage = 10;

  // Fetch bookings when filter, sort, or date changes
  useEffect(() => {
    fetchBookings();
  }, [filter, searchTerm, sortConfig, selectedDate]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
        console.log('Fetching with params:', { filter, searchTerm, sortConfig, selectedDate });

      const response = await axios.get('http://localhost:5000/api/bookings/all-bookings', {
        params: {
          filter,
          search: searchTerm,
          sort: sortConfig.key,
          order: sortConfig.direction,
         startDate: selectedDate, 
        },
      });
      setBookings(response.data);
      setCurrentPage(1); // Reset pagination on new data
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString || 'Invalid Date';
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);

  const getStatusBadge = (status) => {
    const safeStatus = (status || '').toLowerCase();
    const statusClasses = {
      confirmed: 'badge-success',
      pending: 'badge-warning',
      cancelled: 'badge-danger',
      completed: 'badge-info',
      paid: 'badge-success',
      unpaid: 'badge-warning',
      refunded: 'badge-secondary',
    };
    return (
      <span className={`badge ${statusClasses[safeStatus] || 'badge-secondary'}`}>
        {status || 'Unknown'}
      </span>
    );
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Pagination logic
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(bookings.length / bookingsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  return (
    <div className="all-bookings-container">
      <div className="header-section">
        <h2>
          <CalendarIcon /> Bookings Management
        </h2>
        <div className="controls-section">
          <div className="search-form">
            <div className="search-box">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <button type="button" onClick={fetchBookings}>
                <SearchIcon />
              </button>
            </div>
          </div>

          <div className="filter-section">
            <span className="filter-label">
              <FilterIcon /> Filter:
            </span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Bookings</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <SpinnerIcon /> Loading bookings...
        </div>
      ) : (
        <>
          <div className="bookings-table-container">
            {currentBookings.length === 0 ? (
              <div className="no-bookings">No bookings found matching your criteria</div>
            ) : (
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('booking_id')}>Booking ID</th>
                    <th onClick={() => handleSort('room_name')}>Room</th>
                    <th onClick={() => handleSort('username')}>Guest</th>
                    <th onClick={() => handleSort('checkin_date')}>Check-In</th>
                    <th onClick={() => handleSort('checkout_date')}>Check-Out</th>
                    <th onClick={() => handleSort('status')}>Status</th>
                    <th onClick={() => handleSort('payment_status')}>Payment</th>
                    <th onClick={() => handleSort('booking_source')}>Booking Source</th>
                    <th onClick={() => handleSort('payment_amount')}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBookings.map((booking) => (
                    <tr key={booking.booking_id}>
                      <td>{booking.booking_id}</td>
                      <td>{booking.room_name}</td>
                      <td>
                        <div className="guest-info">
                          <strong>{booking.guest_name}</strong>
                          <small>{booking.guest_email}</small>
                        </div>
                      </td>
                      <td>{formatDate(booking.checkin_date)}</td>
                      <td>{formatDate(booking.checkout_date)}</td>
                      <td>{getStatusBadge(booking.status)}</td>
                      <td>{getStatusBadge(booking.payment_status)}</td>
                      <td>{booking.booking_source || '-'}</td>
                      <td>{formatCurrency(booking.payment_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {bookings.length > bookingsPerPage && (
            <div className="pagination">
  <button 
    onClick={() => paginate(currentPage - 1)} 
    disabled={currentPage === 1}
    className="pagination-button"
  >
    Previous
  </button>
  
  {/* Show first page and ellipsis if needed */}
  {currentPage > 3 && (
    <>
      <button 
        onClick={() => paginate(1)}
        className="pagination-button"
      >
        1
      </button>
      {currentPage > 4 && <span className="ellipsis">...</span>}
    </>
  )}
  
  {/* Show current page and adjacent pages */}
  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    let pageNum;
    if (currentPage <= 3) {
      pageNum = i + 1;
    } else if (currentPage >= totalPages - 2) {
      pageNum = totalPages - 4 + i;
    } else {
      pageNum = currentPage - 2 + i;
    }
    
    if (pageNum > 0 && pageNum <= totalPages) {
      return (
        <button
          key={pageNum}
          onClick={() => paginate(pageNum)}
          className={`pagination-button ${currentPage === pageNum ? 'active' : ''}`}
        >
          {pageNum}
        </button>
      );
    }
    return null;
  })}
  
  {/* Show last page and ellipsis if needed */}
  {currentPage < totalPages - 2 && (
    <>
      {currentPage < totalPages - 3 && <span className="ellipsis">...</span>}
      <button 
        onClick={() => paginate(totalPages)}
        className="pagination-button"
      >
        {totalPages}
      </button>
    </>
  )}
  
  <button 
    onClick={() => paginate(currentPage + 1)} 
    disabled={currentPage === totalPages}
    className="pagination-button"
  >
    Next
  </button>
</div>
          )}

          <div className="summary-section">
            <div className="summary-card">
              <h4>Total Bookings</h4>
              <p>{bookings.length}</p>
            </div>
            <div className="summary-card">
              <h4>Confirmed</h4>
              <p>{bookings.filter((b) => b.status === 'confirmed').length}</p>
            </div>
            <div className="summary-card">
              <h4>Pending</h4>
              <p>{bookings.filter((b) => b.status === 'pending').length}</p>
            </div>
            <div className="summary-card">
              <h4>Revenue</h4>
              <p>{formatCurrency(bookings.reduce((sum, b) => sum + parseFloat(b.payment_amount || 0), 0))}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AllBookings;
