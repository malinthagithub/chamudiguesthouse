import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'guest',  // Default role
        security_key: ''  // Initially empty for 'owner' or 'clerk'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            // Make sure the API endpoint is correct
            const response = await axios.post('http://localhost:5000/api/users/register', formData);
            setSuccess(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <div>
            <h2>Register</h2>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                >
                    <option value="guest">Guest</option>
                    <option value="owner">Owner</option>
                    <option value="clerk">Clerk</option>
                </select>

                {/* Show security_key input only if the user is owner or clerk */}
                {(formData.role === 'owner' || formData.role === 'clerk') && (
                    <input
                        type="text"
                        name="security_key"
                        placeholder="Security Key"
                        value={formData.security_key}
                        onChange={handleChange}
                        required
                    />
                )}
                
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;
