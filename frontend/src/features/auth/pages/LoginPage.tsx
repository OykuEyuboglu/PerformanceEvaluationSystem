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

const loginSchema = z.object({
    email: z.string().email('Geçerli bir e-posta adresi girin'),
    password: z.string().min(1, 'Şifre zorunludur'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
    const navigate = useNavigate()

    const setAuth = useAuthStore((s) => s.login)
    const sessionExpired = useAuthStore((s) => s.sessionExpired)
    const clearSessionExpired = useAuthStore((s) => s.clearSessionExpired)

    const [serverError, setServerError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
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
                'E-posta veya şifre hatalı.'
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
                    Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.
                </Alert>
            </Snackbar>

            <Grid container sx={{ minHeight: '100vh' }}>

                {/* SOL PANEL - MARKA */}
                <Grid
                    size={{ xs: 12, md: 6 }}
                    sx={{
                        display: { xs: 'none', md: 'flex' },
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        bgcolor: '#111111',
                        position: 'relative',
                        overflow: 'hidden',
                        p: { md: 5, lg: 6 },
                    }}
                >
                    {/* Üst ışık efekti */}
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

                    {/* Alt daire */}
                    <Box
                        sx={{
                            position: 'absolute',
                            width: 320,
                            height: 320,
                            borderRadius: '50%',
                            border: '1px solid rgba(245,179,1,0.25)',
                            bottom: -100,
                            left: -100,
                        }}
                    />

                    <Logo
                        variant="light"
                        size={52}
                    />

                    {/* Marka mesajı */}
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
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                color: 'rgba(255,255,255,0.6)',
                                maxWidth: 420,
                                lineHeight: 1.6,
                            }}
                        >
                            IT departmanı için objektif, şeffaf ve kriter
                            bazlı performans değerlendirme platformu.
                        </Typography>
                    </Box>

                    {/* Footer */}
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'rgba(255,255,255,0.35)',
                        }}
                    >
                        © {new Date().getFullYear()} VakıfBank 360 · Tüm
                        hakları saklıdır
                    </Typography>
                </Grid>

                {/* SAĞ PANEL - GİRİŞ FORMU */}
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
                        {/* Mobil Logo */}
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

                        {/* Başlık */}
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 800,
                                color: '#111111',
                                mb: 0.5,
                            }}
                        >
                            Hoş geldiniz
                        </Typography>

                        {/* Açıklama */}
                        <Typography
                            variant="body2"
                            sx={{
                                color: '#666666',
                                mb: 3,
                            }}
                        >
                            Devam etmek için hesabınıza giriş yapın
                        </Typography>

                        {/* Backend Hatası */}
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

                        {/* FORM */}
                        <Box
                            component="form"
                            onSubmit={handleSubmit(onSubmit)}
                            noValidate
                        >
                            {/* E-POSTA */}
                            <TextField
                                label="E-posta"
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
                                helperText={errors.email?.message}
                            />

                            {/* ŞİFRE */}
                            <TextField
                                label="Şifre"
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
                                helperText={errors.password?.message}
                            />

                            {/* GİRİŞ BUTONU */}
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
                                ) : (
                                    'Giriş Yap'
                                )}
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </>
    )
}