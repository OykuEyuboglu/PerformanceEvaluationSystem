import { createTheme } from '@mui/material/styles'

export const createAppTheme = (mode: 'light' | 'dark') =>
    createTheme({
        palette: {
            mode,

            primary: {
                main: '#F5B301',
                light: '#FFC933',
                dark: '#C68E00',
                contrastText: '#111111',
            },

            secondary: {
                main: mode === 'light' ? '#111111' : '#ffffff',
            },

            background: {
                default: mode === 'light' ? '#f7f7f5' : '#121212',
                paper: mode === 'light' ? '#ffffff' : '#1c1c1c',
            },

            text: {
                primary: mode === 'light' ? '#161616' : '#ffffff',
                secondary: mode === 'light' ? '#5f5f5f' : '#bdbdbd',
            },

            success: { main: '#2e7d32' },
            warning: { main: '#ed6c02' },
            error: { main: '#d32f2f' },
        },

        typography: {
            fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
            h1: { fontWeight: 800 },
            h2: { fontWeight: 800 },
            h5: { fontWeight: 700 },
            h6: { fontWeight: 700 },
            button: { fontWeight: 700 },
        },

        shape: {
            borderRadius: 10,
        },

        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: 8,
                    },
                },

                variants: [
                    {
                        props: {
                            variant: 'contained',
                            color: 'primary',
                        },
                        style: {
                            color: '#111111',

                            '&:hover': {
                                backgroundColor: '#D9A514',
                            },

                            '&.Mui-disabled': {
                                backgroundColor: '#F5B301',
                                color: '#111111',
                                opacity: 0.85,
                            },
                        },
                    },
                ],
            },

            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                    },
                },
            },

            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#F5B301',
                            borderWidth: 2,
                        },
                    },
                },
            },
        },
    })