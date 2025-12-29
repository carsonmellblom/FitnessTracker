import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Link,
    Alert,
    Container,
    Stack
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { useAuth } from '../context/AuthContext';

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
        if (!/[a-z]/.test(formData.password)) {
            setError('Password must contain at least one lowercase letter');
            return false;
        }
        if (!/[A-Z]/.test(formData.password)) {
            setError('Password must contain at least one uppercase letter');
            return false;
        }
        if (!/\d/.test(formData.password)) {
            setError('Password must contain at least one number');
            return false;
        }
        if (!/[@$!%*?&]/.test(formData.password)) {
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
            navigate('/');
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 4
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        width: '100%',
                        maxWidth: 450
                    }}
                >
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <FitnessCenterIcon
                            sx={{ fontSize: 48, color: 'primary.main', mb: 2 }}
                            aria-hidden="true"
                        />
                        <Typography
                            variant="h4"
                            component="h1"
                            gutterBottom
                            sx={{ fontWeight: 'bold' }}
                        >
                            Create Account
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Join FitnessTracker to start tracking your progress
                        </Typography>
                    </Box>

                    {/* Error Alert */}
                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 3 }}
                            onClose={() => setError('')}
                        >
                            {error}
                        </Alert>
                    )}

                    {/* Registration Form */}
                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <Stack spacing={2.5}>
                            <TextField
                                id="email"
                                name="email"
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                fullWidth
                                disabled={loading}
                                placeholder="you@example.com"
                                autoComplete="email"
                                inputProps={{
                                    'aria-required': 'true'
                                }}
                            />

                            <TextField
                                id="userName"
                                name="userName"
                                label="Username"
                                type="text"
                                value={formData.userName}
                                onChange={handleChange}
                                required
                                fullWidth
                                disabled={loading}
                                placeholder="Your name"
                                autoComplete="name"
                                inputProps={{
                                    'aria-required': 'true'
                                }}
                            />

                            <TextField
                                id="password"
                                name="password"
                                label="Password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                fullWidth
                                disabled={loading}
                                placeholder="••••••••••"
                                autoComplete="new-password"
                                helperText="Min 10 characters with uppercase, lowercase, number, and special character"
                                inputProps={{
                                    'aria-required': 'true',
                                    'aria-describedby': 'password-requirements'
                                }}
                            />

                            <TextField
                                id="confirmPassword"
                                name="confirmPassword"
                                label="Confirm Password"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                fullWidth
                                disabled={loading}
                                placeholder="••••••••••"
                                autoComplete="new-password"
                                inputProps={{
                                    'aria-required': 'true'
                                }}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={loading}
                                sx={{ mt: 1 }}
                            >
                                {loading ? 'Creating account...' : 'Create Account'}
                            </Button>
                        </Stack>
                    </Box>

                    {/* Footer */}
                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            Already have an account?{' '}
                            <Link
                                component={RouterLink}
                                to="/login"
                                underline="hover"
                                sx={{ fontWeight: 'medium' }}
                            >
                                Sign in
                            </Link>
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}
