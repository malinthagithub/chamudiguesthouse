import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";  // Import useNavigate for redirection
import "./Login.css";

const Login = ({ setAuth }) => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        security_key: "", // Ensure this matches backend field
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();  // Initialize navigate for redirection

    // Effect to add 'login-page' class to body for background image
    useEffect(() => {
        document.body.classList.add("login-page");

        return () => {
            document.body.classList.remove("login-page");
        };
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await axios.post(
                "http://localhost:5000/api/users/login",
                { 
                    email: formData.email, 
                    password: formData.password, 
                    security_key: formData.security_key // Ensure key matches backend field name
                }
            );

            const { token, username, role, email, message } = response.data;

            // Check if user role is valid
            if (role !== "owner" && role !== "clerk") {
                setError("Only owners and clerks are allowed to log in.");
                setLoading(false);
                return;
            }

            // Save auth data to localStorage
            localStorage.setItem("auth", JSON.stringify({ token, username, role, email }));

            // Update authentication state
            setAuth({ token, username, role, email });

            setSuccess(message);
            navigate("/revenue");  // Redirect to owner dashboard after successful login

        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Owner/Clerk Login</h2>
                {error && <div className="error-message">❌ {error}</div>}
                {success && <div className="success-message">✅ {success}</div>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="input-field"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="input-field"
                    />
                    <input
                        type="text"
                        name="security_key"
                        placeholder="Security Key (for Owners/Clerks)"
                        value={formData.security_key}
                        onChange={handleChange}
                        required
                        className="input-field"
                    />
                    <button type="submit" disabled={loading} className="login-button">
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
