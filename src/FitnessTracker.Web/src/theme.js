import { createTheme } from '@mui/material/styles';

// Create a dark theme for the FitnessTracker app
const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#7c3aed', // Purple - matches your app's accent color
            light: '#a78bfa',
            dark: '#5b21b6',
        },
        secondary: {
            main: '#06b6d4', // Cyan
            light: '#22d3ee',
            dark: '#0891b2',
        },
        background: {
            default: '#0f172a', // Dark navy - matches your current background
            paper: '#1e293b', // Slightly lighter for cards/modals
        },
        text: {
            primary: '#f1f5f9',
            secondary: '#94a3b8',
        },
        error: {
            main: '#ef4444',
        },
        warning: {
            main: '#f59e0b',
        },
        info: {
            main: '#3b82f6',
        },
        success: {
            main: '#10b981',
        },
        divider: 'rgba(148, 163, 184, 0.12)',
    },
    typography: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
        h1: {
            fontWeight: 700,
        },
        h2: {
            fontWeight: 700,
        },
        h3: {
            fontWeight: 600,
        },
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
        button: {
            textTransform: 'none', // Don't uppercase buttons by default
            fontWeight: 500,
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    paddingTop: 8,
                    paddingBottom: 8,
                    paddingLeft: 16,
                    paddingRight: 16,
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    '&:hover': {
                        backgroundColor: 'rgba(124, 58, 237, 0.08)',
                    },
                },
            },
        },
    },
});

export default theme;
