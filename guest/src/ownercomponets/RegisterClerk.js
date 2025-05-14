import React, { useState } from 'react';
import axios from 'axios';
import './RegisterClerk.css';

const RegisterClerk = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        phoneNumber: '',
        last_name: '',
        address1: '',
        address2: ''
    });

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        const token = localStorage.getItem('token');
        if (!token) {
            setErrorMessage('You must be logged in to register a clerk.');
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:5000/api/users/register-ownerclerk',
                {
                    ...formData,
                    role: 'clerk' // Always clerk
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.status === 201) {
                setSuccessMessage('Clerk registered successfully!');
                setFormData({
                    username: '',
                    email: '',
                    password: '',
                    phoneNumber: '',
                    last_name: '',
                    address1: '',
                    address2: ''
                });
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="register-clerk-modern">
            <h2>Register New Clerk</h2>

            {errorMessage && <div className="alert error">{errorMessage}</div>}
            {successMessage && <div className="alert success">{successMessage}</div>}

            <div className="input-grid">
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Username"
                    required
                />
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                />
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password (min 6 chars)"
                    required
                    minLength="6"
                />
                <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Last Name"
                    required
                />
                <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    required
                />
                <input
                    type="text"
                    name="address1"
                    value={formData.address1}
                    onChange={handleChange}
                    placeholder="Address Line 1"
                    required
                />
                <input
                    type="text"
                    name="address2"
                    value={formData.address2}
                    onChange={handleChange}
                    placeholder="Address Line 2 (optional)"
                />
            </div>

            <button onClick={handleSubmit} className="register-btn">
                Register Clerk
            </button>
        </div>
    );
};

export default RegisterClerk;
