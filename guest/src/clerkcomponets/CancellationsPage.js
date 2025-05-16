import React, { useState, useEffect } from 'react';
import './CancellationsPage.css';

const CancellationsPage = () => {
  const [cancellations, setCancellations] = useState([]);
  const [filteredCancellations, setFilteredCancellations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchDate, setSearchDate] = useState('');

  useEffect(() => {
    fetchCancellations();
  }, []);

  const fetchCancellations = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/cancellations');
      const data = await response.json();
      setCancellations(data);
      setFilteredCancellations(data);
    } catch (error) {
      console.error('Error fetching cancellations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setSearchDate(selectedDate);

    if (!selectedDate) {
      setFilteredCancellations(cancellations);
      return;
    }

    const filtered = cancellations.filter(item => {
      const cancelledDate = new Date(item.cancelled_at).toISOString().slice(0, 10);
      return cancelledDate === selectedDate;
    });

    setFilteredCancellations(filtered);
  };

  const handleReset = () => {
    setSearchDate('');
    setFilteredCancellations(cancellations);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="cancellations-container">
      <div className="header-section">
        <h2>Cancellation Records</h2>
        <div className="search-controls">
          <div className="date-picker">
            <label htmlFor="date-search">Filter by Date</label>
            <input
              id="date-search"
              type="date"
              value={searchDate}
              onChange={handleDateChange}
              className="date-input"
            />
            {searchDate && (
              <button className="reset-btn" onClick={handleReset}>
                Clear
              </button>
            )}
          </div>
          <div className="results-count">
            Showing {filteredCancellations.length} of {cancellations.length} records
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"></div>
      ) : (
        <div className="table-wrapper">
          <table className="cancellations-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Booking</th>
                <th>User</th>
                <th>Amount</th>
                <th>Cancelled On</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCancellations.length > 0 ? (
                filteredCancellations.map(item => (
                  <tr key={item.cancellation_id}>
                    <td className="id-cell">{item.cancellation_id}</td>
                    <td>{item.booking_id}</td>
                    <td>User {item.user_id}</td>
                    <td className="amount-cell">{formatCurrency(item.refund_amount)}</td>
                    <td>{formatDate(item.cancelled_at)}</td>
                    <td>
                      <span className="status-badge cancelled">Cancelled</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="no-results">
                  <td colSpan="6">
                    <div className="empty-state">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 10H3M21 6H3M21 14H3M21 18H3" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <p>No cancellations found for the selected date</p>
                      {searchDate && (
                        <button className="reset-btn" onClick={handleReset}>
                          Show all records
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CancellationsPage;