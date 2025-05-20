import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    lastname: '',
    email: '',
    password: '',
    phoneNumber: '',
    address1: '',
    address2: '',
    city: '',
    zipCode: '',
    country: '',
  });

  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  // Validate form inputs
  const validate = () => {
    const newErrors = {};

    if (!formData.username.trim()) newErrors.username = "First name is required";
    else if (!/^[A-Za-z\s]+$/.test(formData.username)) newErrors.username = "First name should only contain letters";
    if (!formData.lastname.trim()) newErrors.lastname = "Last name is required";
    else if (!/^[A-Za-z\s]+$/.test(formData.lastname)) newErrors.lastname = "Last name should only contain letters";


    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required";
    else if (!/^[0-9]{10,15}$/.test(formData.phoneNumber)) newErrors.phoneNumber = "Phone number is invalid";

    if (!formData.address1.trim()) newErrors.address1 = "Address line 1 is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "Zip code is required";
    else if (!/^\d+$/.test(formData.zipCode)) newErrors.zipCode = "Zip code must contain only numbers";
    if (!formData.country.trim()) newErrors.country = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' }); // clear error for that field
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await axios.post('http://localhost:5000/api/users/register-guest', formData);
      console.log(response.data);
      setIsSuccess(true);
      setFormData({
        username: '',
        lastname: '',
        email: '',
        password: '',
        phoneNumber: '',
        address1: '',
        address2: '',
        city: '',
        zipCode: '',
        country: '',
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
  const errMsg = error.response?.data?.message || "Registration failed. Please try again.";

  if (errMsg.toLowerCase().includes("user already exists")) {
    setErrors((prev) => ({ ...prev, email: errMsg }));  // attach to email field
  } else {
    setErrorMessage(errMsg);  // general error message
  }
}
  };

  return (
    <div className="register-page">
      <div className="form-container">
        <h2>Sign Up</h2>

        {isSuccess && <div className="success-message"><p>Registration successful! Redirecting to login...</p></div>}
        {errorMessage && <div className="error-message"><p>{errorMessage}</p></div>}

        <div className="form-wrapper">
          <form className="form-left" onSubmit={handleSubmit}>
            <h3>Personal Information</h3>
            <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="First Name" autoComplete="off" />
            {errors.username && <small className="error">{errors.username}</small>}

            <input type="text" name="lastname" value={formData.lastname} onChange={handleChange} placeholder="Last Name" autoComplete="off" />
            {errors.lastname && <small className="error">{errors.lastname}</small>}

            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" autoComplete="off" />
            {errors.email && <small className="error">{errors.email}</small>}

            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" autoComplete="off" />
            {errors.password && <small className="error">{errors.password}</small>}

            <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Phone Number" autoComplete="off" />
            {errors.phoneNumber && <small className="error">{errors.phoneNumber}</small>}
          </form>

          <form className="form-right" onSubmit={handleSubmit}>
            <h3>Address Information</h3>
            <input type="text" name="address1" value={formData.address1} onChange={handleChange} placeholder="Address Line 1" />
            {errors.address1 && <small className="error">{errors.address1}</small>}

            <input type="text" name="address2" value={formData.address2} onChange={handleChange} placeholder="Address Line 2" />

            <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" />
            {errors.city && <small className="error">{errors.city}</small>}

            <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} placeholder="Zip Code" />
            {errors.zipCode && <small className="error">{errors.zipCode}</small>}

            <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="Country" />
            {errors.country && <small className="error">{errors.country}</small>}

            <div className="form-button">
              <button type="submit">Register</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
