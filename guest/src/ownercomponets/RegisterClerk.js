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

    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required.';
        } else if (formData.username.length < 3 || formData.username.length > 20) {
            newErrors.username = 'Username must be between 3 and 20 characters.';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address.';
        }

        if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters.';
        }

        const nameRegex = /^[A-Za-z\s]+$/;
        if (!formData.last_name.trim()) {
            newErrors.last_name = 'Last name is required.';
        } else if (!nameRegex.test(formData.last_name)) {
            newErrors.last_name = 'Last name must contain only letters.';
        }

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Phone number must be exactly 10 digits.';
        }

        if (!formData.address1.trim()) {
            newErrors.address1 = 'Address Line 1 is required.';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        const token = localStorage.getItem('token');
        if (!token) {
            setErrorMessage('You must be logged in to register a clerk.');
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:5000/api/users/register-ownerclerk',
                {
                    ...formData,
                    role: 'clerk'
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
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="clerk-reg-container">
            <div className="clerk-reg-card">
                <div className="clerk-reg-header">
                    <h2 className="clerk-reg-title">Register New Clerk</h2>
                    <p className="clerk-reg-subtitle">Fill in the clerk's details below</p>
                </div>

                {errorMessage && <div className="clerk-reg-alert clerk-reg-alert-error">{errorMessage}</div>}
                {successMessage && <div className="clerk-reg-alert clerk-reg-alert-success">{successMessage}</div>}

                <form onSubmit={handleSubmit} className="clerk-reg-form">
                    <div className="clerk-reg-grid">
                        {[
                            { name: 'username', label: 'Username', type: 'text', required: true },
                            { name: 'email', label: 'Email', type: 'email', required: true },
                            { name: 'password', label: 'Password (min 6 chars)', type: 'password', required: true },
                            { name: 'last_name', label: 'Last Name', type: 'text', required: true },
                            { name: 'phoneNumber', label: 'Phone Number', type: 'tel', required: true },
                            { name: 'address1', label: 'Address Line 1', type: 'text', required: true },
                            { name: 'address2', label: 'Address Line 2 (optional)', type: 'text', required: false },
                        ].map(({ name, label, type, required }) => (
                            <div key={name} className="clerk-reg-input-group">
                                <input
                                    type={type}
                                    name={name}
                                    value={formData[name]}
                                    onChange={handleChange}
                                    placeholder=" "
                                    required={required}
                                    className="clerk-reg-input"
                                />
                                <label className="clerk-reg-label">{label}</label>
                                <span className="clerk-reg-input-border"></span>
                                {errors[name] && (
                                    <div className="clerk-reg-error-msg">{errors[name]}</div>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        type="submit"
                        className="clerk-reg-submit-btn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <span className="clerk-reg-spinner"></span>
                        ) : (
                            <>
                                Register Clerk
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14"></path>
                                    <path d="M12 5l7 7-7 7"></path>
                                </svg>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterClerk;
