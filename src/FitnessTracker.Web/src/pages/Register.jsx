import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../index.css';

export default function Register() {
    const [formData, setFormData] = useState({
        email: '',
        userName: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validateForm = () => {
        if (formData.password.length < 10) {
            setError('Password must be at least 10 characters long');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (!/(?=.*[a-z])/.test(formData.password)) {
            setError('Password must contain at least one lowercase letter');
            return false;
        }
        if (!/(?=.*[A-Z])/.test(formData.password)) {
            setError('Password must contain at least one uppercase letter');
            return false;
        }
        if (!/(?=.*\d)/.test(formData.password)) {
            setError('Password must contain at least one number');
            return false;
        }
        if (!/(?=.*[@$!%*?&])/.test(formData.password)) {
            setError('Password must contain at least one special character (@$!%*?&)');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            await register(
                formData.email,
                formData.password,
                formData.confirmPassword,
                formData.userName
            );
            navigate('/'); // Redirect to dashboard after successful registration
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>Create Account</h1>
                        <p>Join FitnessTracker to start tracking your progress</p>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                placeholder="you@example.com"
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="userName">Username</label>
                            <input
                                id="userName"
                                name="userName"
                                type="text"
                                value={formData.userName}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                placeholder="Your name"
                                autoComplete="name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                placeholder="••••••••••"
                                autoComplete="new-password"
                            />
                            <small className="form-hint">
                                Min 10 characters with uppercase, lowercase, number, and special character
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                placeholder="••••••••••"
                                autoComplete="new-password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={loading}
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Already have an account?{' '}
                            <Link to="/login" className="link-primary">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
