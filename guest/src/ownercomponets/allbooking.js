import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './allbooking.css';
import { format, parseISO } from 'date-fns';

const SearchIcon = () => <span>🔍</span>;
const FilterIcon = () => <span>⚙️</span>;
const CalendarIcon = () => <span>📅</span>;
const SpinnerIcon = () => <span className="spinner">🔄</span>;

const AllBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'checkin_date', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const bookingsPerPage = 10;

    useEffect(() => {
        fetchBookings();
    }, [filter, searchTerm, sortConfig, currentPage]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/bookings/all-bookings', {
                params: {
                    filter,
                    search: searchTerm,
                    sort: sortConfig.key,
                    order: sortConfig.direction
                }
            });
            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return format(parseISO(dateString), 'MMM dd, yyyy');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    // ✅ Fixed here
    const getStatusBadge = (status) => {
        const safeStatus = (status || '').toLowerCase();
        const statusClasses = {
            confirmed: 'badge-success',
            pending: 'badge-warning',
            cancelled: 'badge-danger',
            completed: 'badge-info',
            paid: 'badge-success',
            unpaid: 'badge-warning',
            refunded: 'badge-secondary'
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

    const handleSearch = (e) => {
        e.preventDefault();
        fetchBookings();
    };

    const indexOfLastBooking = currentPage * bookingsPerPage;
    const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
    const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);
    const totalPages = Math.ceil(bookings.length / bookingsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="all-bookings-container">
            <div className="header-section">
                <h2>
                    <CalendarIcon /> Bookings Management
                </h2>
                <div className="controls-section">
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Search bookings..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button type="submit">
                                <SearchIcon />
                            </button>
                        </div>
                    </form>

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
                            <div className="no-bookings">
                                No bookings found matching your criteria
                            </div>
                        ) : (
                            <table className="bookings-table">
                                <thead>
                                    <tr>
                                        <th onClick={() => handleSort('booking_id')}>
                                            Booking ID {sortConfig.key === 'booking_id' && (
                                                sortConfig.direction === 'asc' ? '↑' : '↓'
                                            )}
                                        </th>
                                        <th onClick={() => handleSort('room_name')}>
                                            Room {sortConfig.key === 'room_name' && (
                                                sortConfig.direction === 'asc' ? '↑' : '↓'
                                            )}
                                        </th>
                                        <th onClick={() => handleSort('username')}>
                                            Guest {sortConfig.key === 'username' && (
                                                sortConfig.direction === 'asc' ? '↑' : '↓'
                                            )}
                                        </th>
                                        <th onClick={() => handleSort('checkin_date')}>
                                            Check-In {sortConfig.key === 'checkin_date' && (
                                                sortConfig.direction === 'asc' ? '↑' : '↓'
                                            )}
                                        </th>
                                        <th onClick={() => handleSort('checkout_date')}>
                                            Check-Out {sortConfig.key === 'checkout_date' && (
                                                sortConfig.direction === 'asc' ? '↑' : '↓'
                                            )}
                                        </th>
                                        <th onClick={() => handleSort('status')}>
                                            Status {sortConfig.key === 'status' && (
                                                sortConfig.direction === 'asc' ? '↑' : '↓'
                                            )}
                                        </th>
                                        <th onClick={() => handleSort('payment_status')}>
                                            Payment {sortConfig.key === 'payment_status' && (
                                                sortConfig.direction === 'asc' ? '↑' : '↓'
                                            )}
                                        </th>
                                        <th onClick={() => handleSort('payment_amount')}>
                                            Amount {sortConfig.key === 'payment_amount' && (
                                                sortConfig.direction === 'asc' ? '↑' : '↓'
                                            )}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentBookings.map((booking) => (
                                        <tr key={booking.booking_id}>
                                            <td>#{booking.booking_id}</td>
                                            <td>{booking.room_name}</td>
                                            <td>
                                                <div className="guest-info">
                                                    <strong>{booking.username}</strong>
                                                    <small>{booking.email}</small>
                                                </div>
                                            </td>
                                            <td>{formatDate(booking.checkin_date)}</td>
                                            <td>{formatDate(booking.checkout_date)}</td>
                                            <td>{getStatusBadge(booking.status)}</td>
                                            <td>{getStatusBadge(booking.payment_status)}</td>
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
                            >
                                Previous
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                <button
                                    key={number}
                                    onClick={() => paginate(number)}
                                    className={currentPage === number ? 'active' : ''}
                                >
                                    {number}
                                </button>
                            ))}

                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
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
                            <p>{bookings.filter(b => b.status === 'confirmed').length}</p>
                        </div>
                        <div className="summary-card">
                            <h4>Pending</h4>
                            <p>{bookings.filter(b => b.status === 'pending').length}</p>
                        </div>
                        <div className="summary-card">
                            <h4>Revenue</h4>
                            <p>{formatCurrency(bookings.reduce((sum, b) => sum + (b.payment_amount || 0), 0))}</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AllBookings;
