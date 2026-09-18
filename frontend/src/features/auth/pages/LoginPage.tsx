import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import {
    Alert,
    Snackbar,
    Box,
    Grid,
    TextField,
    Button,
    Typography,
    CircularProgress,
    IconButton,
} from '@mui/material'
import Slide from '@mui/material/Slide'
import {
    Visibility,
    VisibilityOff,
    EmailOutlined,
    LockOutlined,
} from '@mui/icons-material'
import { login } from '../authApi'
import { useAuthStore } from '../../../store/authStore'
import Logo from '../../../shared/components/logo'
import { useLanguage } from '../../../shared/i18n/LanguageContext'

type LoginFormValues = {
    email: string
    password: string
}

const getLoginSchema = (language: 'tr' | 'en') =>
    z.object({
        email: z
            .string()
            .min(
                1,
                language === 'tr'
                    ? 'E-posta boş olamaz.'
                    : 'Email is required.'
            )
            .email(
                language === 'tr'
                    ? 'Geçerli bir e-posta adresi girin.'
                    : 'Please enter a valid email address.'
            ),

        password: z
            .string()
            .min(
                1,
                language === 'tr'
                    ? 'Şifre boş olamaz.'
                    : 'Password is required.'
            ),
    })

export default function LoginPage() {
    const navigate = useNavigate()

    const setAuth = useAuthStore((s) => s.login)
    const sessionExpired = useAuthStore(
        (s) => s.sessionExpired
    )
    const clearSessionExpired = useAuthStore(
        (s) => s.clearSessionExpired
    )

    const { language, setLanguage } = useLanguage()

    const [serverError, setServerError] = useState<string | null>(
        null
    )
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(getLoginSchema(language)),
    })

    const onSubmit = async (values: LoginFormValues) => {
        setServerError(null)
        setLoading(true)

        try {
            const res = await login(values)

            setAuth(res.token, res.user)
            navigate('/dashboard')
        } catch (err: any) {
            setServerError(
                err?.response?.data?.message ??
                (language === 'tr'
                    ? 'E-posta veya şifre hatalı.'
                    : 'Incorrect email or password.')
            )
        } finally {
            setLoading(false)
        }
    }

    const inputStyles = {
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: '#C8C8C8',
            },
            '&:hover fieldset': {
                borderColor: '#999999',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#F5B301',
            },
        },

        '& .MuiInputLabel-root': {
            color: '#777777',
        },

        '& .MuiInputLabel-root.Mui-focused': {
            color: '#C68E00',
        },

        '& .MuiInputBase-input': {
            color: '#111111',
        },
    }

    return (
        <>
            <Box
                sx={{
                    position: 'fixed',
                    top: 20,
                    right: 24,
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #D8D8D8',
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: '#FFFFFF',
                    boxShadow:
                        '0 2px 8px rgba(0,0,0,0.06)',
                }}
            >
                <Button
                    onClick={() => setLanguage('tr')}
                    size="small"
                    sx={{
                        minWidth: 40,
                        px: 1,
                        py: 0.5,
                        fontSize: 11,
                        fontWeight:
                            language === 'tr'
                                ? 800
                                : 500,
                        color:
                            language === 'tr'
                                ? '#111111'
                                : '#777777',
                        bgcolor:
                            language === 'tr'
                                ? 'rgba(245,179,1,0.18)'
                                : 'transparent',
                        borderRadius: 0,
                        '&:hover': {
                            bgcolor:
                                'rgba(245,179,1,0.10)',
                        },
                    }}
                >
                    TR
                </Button>

                <Box
                    sx={{
                        width: '1px',
                        height: 18,
                        bgcolor: '#D8D8D8',
                    }}
                />

                <Button
                    onClick={() => setLanguage('en')}
                    size="small"
                    sx={{
                        minWidth: 40,
                        px: 1,
                        py: 0.5,
                        fontSize: 11,
                        fontWeight:
                            language === 'en'
                                ? 800
                                : 500,
                        color:
                            language === 'en'
                                ? '#111111'
                                : '#777777',
                        bgcolor:
                            language === 'en'
                                ? 'rgba(245,179,1,0.18)'
                                : 'transparent',
                        borderRadius: 0,
                        '&:hover': {
                            bgcolor:
                                'rgba(245,179,1,0.10)',
                        },
                    }}
                >
                    EN
                </Button>
            </Box>

            <Snackbar
                open={sessionExpired}
                autoHideDuration={5000}
                onClose={clearSessionExpired}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                slots={{
                    transition: Slide,
                }}
            >
                <Alert
                    onClose={clearSessionExpired}
                    severity="warning"
                    variant="filled"
                    sx={{
                        width: '100%',
                        fontWeight: 600,
                    }}
                >
                    {language === 'tr'
                        ? 'Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.'
                        : 'Your session has expired. Please log in again.'}
                </Alert>
            </Snackbar>

            <Grid
                container
                sx={{ minHeight: '100vh' }}
            >
                <Grid
                    size={{ xs: 12, md: 6 }}
                    sx={{
                        display: {
                            xs: 'none',
                            md: 'flex',
                        },
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        bgcolor: '#111111',
                        position: 'relative',
                        overflow: 'hidden',
                        p: {
                            md: 5,
                            lg: 6,
                        },
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            width: 480,
                            height: 480,
                            borderRadius: '50%',
                            background:
                                'radial-gradient(circle, rgba(245,179,1,0.18) 0%, rgba(245,179,1,0) 70%)',
                            top: -160,
                            right: -160,
                        }}
                    />

                    <Box
                        sx={{
                            position: 'absolute',
                            width: 320,
                            height: 320,
                            borderRadius: '50%',
                            border:
                                '1px solid rgba(245,179,1,0.25)',
                            bottom: -100,
                            left: -100,
                        }}
                    />

                    <Logo
                        variant="light"
                        size={52}
                    />

                    <Box
                        sx={{
                            position: 'relative',
                            zIndex: 1,
                            maxWidth: 500,
                            my: 'auto',
                        }}
                    >
                        <Typography
                            variant="h3"
                            sx={{
                                color: '#FFFFFF',
                                fontWeight: 800,
                                mb: 1.5,
                                maxWidth: 480,
                            }}
                        >
                            {language === 'tr' ? (
                                <>
                                    Performansı{' '}
                                    <Box
                                        component="span"
                                        sx={{
                                            color: '#F5B301',
                                        }}
                                    >
                                        ölçün
                                    </Box>
                                    , potansiyeli{' '}
                                    <Box
                                        component="span"
                                        sx={{
                                            color: '#F5B301',
                                        }}
                                    >
                                        büyütün
                                    </Box>
                                    .
                                </>
                            ) : (
                                <>
                                    Measure{' '}
                                    <Box
                                        component="span"
                                        sx={{
                                            color: '#F5B301',
                                        }}
                                    >
                                        performance
                                    </Box>
                                    , unlock{' '}
                                    <Box
                                        component="span"
                                        sx={{
                                            color: '#F5B301',
                                        }}
                                    >
                                        potential
                                    </Box>
                                    .
                                </>
                            )}
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                color:
                                    'rgba(255,255,255,0.6)',
                                maxWidth: 420,
                                lineHeight: 1.6,
                            }}
                        >
                            {language === 'tr'
                                ? 'IT departmanı için objektif, şeffaf ve kriter bazlı performans değerlendirme platformu.'
                                : 'An objective, transparent and criteria-based performance evaluation platform for IT departments.'}
                        </Typography>
                    </Box>

                    <Typography
                        variant="caption"
                        sx={{
                            color:
                                'rgba(255,255,255,0.35)',
                        }}
                    >
                        © {new Date().getFullYear()}{' '}
                        VakıfBank 360 ·{' '}
                        {language === 'tr'
                            ? 'Tüm hakları saklıdır'
                            : 'All rights reserved'}
                    </Typography>
                </Grid>

                <Grid
                    size={{ xs: 12, md: 6 }}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#FAFAF8',
                        p: {
                            xs: 3,
                            md: 4,
                        },
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            maxWidth: 420,
                        }}
                    >
                        <Box
                            sx={{
                                display: {
                                    xs: 'flex',
                                    md: 'none',
                                },
                                mb: 3,
                                justifyContent: 'center',
                            }}
                        >
                            <Logo variant="dark" />
                        </Box>

                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 800,
                                color: '#111111',
                                mb: 0.5,
                            }}
                        >
                            {language === 'tr'
                                ? 'Hoş geldiniz'
                                : 'Welcome'}
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                color: '#666666',
                                mb: 3,
                            }}
                        >
                            {language === 'tr'
                                ? 'Devam etmek için hesabınıza giriş yapın'
                                : 'Sign in to continue'}
                        </Typography>

                        {serverError && (
                            <Alert
                                severity="error"
                                sx={{
                                    mb: 2,
                                    borderRadius: 2,
                                }}
                            >
                                {serverError}
                            </Alert>
                        )}

                        <Box
                            component="form"
                            onSubmit={handleSubmit(onSubmit)}
                            noValidate
                        >
                            <TextField
                                label={
                                    language === 'tr'
                                        ? 'E-posta'
                                        : 'Email'
                                }
                                fullWidth
                                autoComplete="email"
                                sx={{
                                    ...inputStyles,
                                    mb: 2,
                                }}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <EmailOutlined
                                                fontSize="small"
                                                sx={{
                                                    color: '#666666',
                                                    mr: 1,
                                                }}
                                            />
                                        ),
                                    },
                                }}
                                {...register('email')}
                                error={!!errors.email}
                                helperText={
                                    errors.email?.message
                                }
                            />

                            <TextField
                                label={
                                    language === 'tr'
                                        ? 'Şifre'
                                        : 'Password'
                                }
                                type={
                                    showPassword
                                        ? 'text'
                                        : 'password'
                                }
                                fullWidth
                                autoComplete="current-password"
                                sx={inputStyles}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <LockOutlined
                                                fontSize="small"
                                                sx={{
                                                    color: '#666666',
                                                    mr: 1,
                                                }}
                                            />
                                        ),

                                        endAdornment: (
                                            <IconButton
                                                onClick={() =>
                                                    setShowPassword(
                                                        (p) => !p
                                                    )
                                                }
                                                edge="end"
                                                size="small"
                                                sx={{
                                                    color: '#666666',
                                                }}
                                            >
                                                {showPassword ? (
                                                    <VisibilityOff fontSize="small" />
                                                ) : (
                                                    <Visibility fontSize="small" />
                                                )}
                                            </IconButton>
                                        ),
                                    },
                                }}
                                {...register('password')}
                                error={!!errors.password}
                                helperText={
                                    errors.password?.message
                                }
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                size="large"
                                disabled={loading}
                                sx={{
                                    mt: 2,
                                    py: 1.2,
                                    fontSize: 15,
                                }}
                            >
                                {loading ? (
                                    <CircularProgress
                                        size={24}
                                        sx={{
                                            color: '#111111',
                                        }}
                                    />
                                ) : language === 'tr' ? (
                                    'Giriş Yap'
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </>
    )
}