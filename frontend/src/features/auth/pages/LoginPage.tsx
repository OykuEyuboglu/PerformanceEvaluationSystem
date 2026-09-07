import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import {
    Box,
    Grid,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    IconButton,
} from '@mui/material'
import { Visibility, VisibilityOff, EmailOutlined, LockOutlined } from '@mui/icons-material'
import { login } from '../api/authApi'
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
    const [serverError, setServerError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

    const onSubmit = async (values: LoginFormValues) => {
        setServerError(null)
        setLoading(true)
        try {
            const res = await login(values)
            setAuth(res.token, res.user)
            navigate('/dashboard')
        } catch (err: any) {
            setServerError(err?.response?.data?.message ?? 'E-posta veya şifre hatalı.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Grid container sx={{ minHeight: '100vh' }}>
            {/* SOL PANEL - Marka */}
            <Grid
                size={{ xs: 12, md: 6 }}
                sx={{
                    display: { xs: 'none', md: 'flex' },
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    bgcolor: '#111111',
                    position: 'relative',
                    overflow: 'hidden',
                    p: 6,
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        width: 480,
                        height: 480,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(245,179,1,0.18) 0%, rgba(245,179,1,0) 70%)',
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
                        border: '1px solid rgba(245,179,1,0.25)',
                        bottom: -100,
                        left: -100,
                    }}
                />

                <Logo variant="light" size={52} />

                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="h3" sx={{ color: '#fff', fontWeight: 800, mb: 2, maxWidth: 480 }}>
                        Performansı <Box component="span" sx={{ color: '#F5B301' }}>ölçün</Box>,
                        potansiyeli <Box component="span" sx={{ color: '#F5B301' }}>büyütün</Box>.
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: 420 }}>
                        IT departmanı için objektif, şeffaf ve kriter bazlı performans değerlendirme platformu.
                    </Typography>
                </Box>

                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)' }}>
                    © {new Date().getFullYear()} VakıfBank 360 · Tüm hakları saklıdır
                </Typography>
            </Grid>

            {/* SAĞ PANEL - Form */}
            <Grid
                size={{ xs: 12, md: 6 }}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.default',
                    p: 3,
                }}
            >
                <Box sx={{ width: '100%', maxWidth: 400 }}>
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, mb: 4, justifyContent: 'center' }}>
                        <Logo variant="dark" />
                    </Box>

                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                        Hoş geldiniz
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
                        Devam etmek için hesabınıza giriş yapın
                    </Typography>

                    {serverError && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                            {serverError}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                        <TextField
                            label="E-posta"
                            fullWidth
                            margin="normal"
                            autoComplete="email"
                            slotProps={{
                                input: {
                                    startAdornment: <EmailOutlined fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />,
                                },
                            }}
                            {...register('email')}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                        />
                        <TextField
                            label="Şifre"
                            type={showPassword ? 'text' : 'password'}
                            fullWidth
                            margin="normal"
                            autoComplete="current-password"
                            slotProps={{
                                input: {
                                    startAdornment: <LockOutlined fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />,
                                    endAdornment: (
                                        <IconButton onClick={() => setShowPassword((p) => !p)} edge="end" size="small">
                                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                        </IconButton>
                                    ),
                                },
                            }}
                            {...register('password')}
                            error={!!errors.password}
                            helperText={errors.password?.message}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            size="large"
                            disabled={loading}
                            sx={{ mt: 3, py: 1.3, fontSize: 15 }}
                        >
                            {loading ? <CircularProgress size={24} sx={{ color: '#111' }} /> : 'Giriş Yap'}
                        </Button>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    )
}