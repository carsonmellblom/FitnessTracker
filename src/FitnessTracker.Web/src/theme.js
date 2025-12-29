import { createTheme } from '@mui/material/styles';

// Modern, vibrant dark theme with WCAG 2.2 compliant colors
const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#3b82f6', // Electric blue - WCAG compliant
            light: '#60a5fa',
            dark: '#2563eb',
        },
        secondary: {
            main: '#06b6d4', // Bright cyan accent
            light: '#22d3ee',
            dark: '#0891b2',
        },
        background: {
            default: '#0a0a0f', // Deep black with subtle blue tint
            paper: '#18181f', // Rich dark for elevated surfaces
        },
        text: {
            primary: '#ffffff', // Pure white for maximum contrast
            secondary: '#a1a1aa', // Softer gray for secondary text
        },
        error: {
            main: '#f87171', // Softer red, still vibrant
            light: '#fca5a5',
            dark: '#dc2626',
        },
        warning: {
            main: '#fbbf24', // Warm amber
            light: '#fcd34d',
            dark: '#f59e0b',
        },
        info: {
            main: '#60a5fa', // Bright blue
            light: '#93c5fd',
            dark: '#2563eb',
        },
        success: {
            main: '#34d399', // Bright emerald green
            light: '#6ee7b7',
            dark: '#059669',
        },
        divider: 'rgba(255, 255, 255, 0.08)',
        action: {
            hover: 'rgba(59, 130, 246, 0.08)',
            selected: 'rgba(59, 130, 246, 0.12)',
        },
    },
    typography: {
        fontFamily: [
            'Inter',
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
            letterSpacing: '-0.02em',
        },
        h2: {
            fontWeight: 700,
            letterSpacing: '-0.01em',
        },
        h3: {
            fontWeight: 600,
            letterSpacing: '-0.01em',
        },
        h4: {
            fontWeight: 600,
            letterSpacing: '-0.01em',
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
            letterSpacing: '0.01em',
        },
    },
    shape: {
        borderRadius: 12, // More modern rounded corners
    },
    shadows: [
        'none',
        '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
        '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
        '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
        '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
        '0 25px 50px -12px rgb(0 0 0 / 0.5)',
        '0 25px 50px -12px rgb(0 0 0 / 0.5)',
        '0 25px 50px -12px rgb(0 0 0 / 0.5)',
        '0 25px 50px -12px rgb(0 0 0 / 0.5)',
        '0 25px 50px -12px rgb(0 0 0 / 0.5)',
        '0 25px 50px -12px rgb(0 0 0 / 0.5)',
        '0 25px 50px -12px rgb(0 0 0 / 0.5)',
        '0 25px 50px -12px rgb(0 0 0 / 0.5)',
        '0 25px 50px -12px rgb(0 0 0 / 0.5)',
        '0 25px 50px -12px rgb(0 0 0 / 0.5)',
        '0 25px 50px -12px rgb(0 0 0 / 0.5)',
        '0 25px 50px -12px rgb(0 0 0 / 0.5)',
        '0 25px 50px -12px rgb(0 0 0 / 0.5)',
        '0 25px 50px -12px rgb(0 0 0 / 0.5)',
        '0 25px 50px -12px rgb(0 0 0 / 0.5)',
        '0 25px 50px -12px rgb(0 0 0 / 0.5)',
        '0 25px 50px -12px rgb(0 0 0 / 0.5)',
        '0 25px 50px -12px rgb(0 0 0 / 0.5)',
        '0 25px 50px -12px rgb(0 0 0 / 0.5)',
        '0 25px 50px -12px rgb(0 0 0 / 0.5)',
    ],
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    paddingTop: 10,
                    paddingBottom: 10,
                    paddingLeft: 20,
                    paddingRight: 20,
                    fontWeight: 600,
                    transition: 'all 0.2s ease-in-out',
                },
                contained: {
                    boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
                    '&:hover': {
                        boxShadow: '0 6px 20px 0 rgba(59, 130, 246, 0.5)',
                        transform: 'translateY(-1px)',
                    },
                    '&:active': {
                        transform: 'translateY(0)',
                    },
                },
                outlined: {
                    borderWidth: 2,
                    '&:hover': {
                        borderWidth: 2,
                        backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    borderRadius: 16,
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        borderColor: 'rgba(59, 130, 246, 0.2)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation1: {
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.3)',
                },
                elevation2: {
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
                },
                elevation3: {
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)',
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundImage: 'none',
                    borderRadius: 16,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        backgroundColor: 'rgba(59, 130, 246, 0.12)',
                        transform: 'scale(1.05)',
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 600,
                },
                filled: {
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 10,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(59, 130, 246, 0.5)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderWidth: 2,
                        },
                    },
                },
            },
        },
        MuiAccordion: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    borderRadius: 12,
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    '&:before': {
                        display: 'none',
                    },
                    '&:hover': {
                        borderColor: 'rgba(168, 85, 247, 0.2)',
                    },
                },
            },
        },
        MuiToggleButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&.Mui-selected': {
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        '&:hover': {
                            backgroundColor: 'rgba(59, 130, 246, 0.3)',
                        },
                    },
                },
            },
        },
    },
});

export default theme;
