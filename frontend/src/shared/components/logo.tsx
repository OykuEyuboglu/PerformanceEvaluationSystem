import { Box } from '@mui/material'
import logoWhite from '../../assets/logo-white.png'
import logoBlack from '../../assets/logo-black.png'

interface LogoProps {
    variant?: 'light' | 'dark'
    size?: number
}

export default function Logo({ variant = 'dark', size = 44 }: LogoProps) {
    const src = variant === 'light' ? logoWhite : logoBlack
    const textColor = variant === 'light' ? '#ffffff' : '#111111'
    const subColor = variant === 'light' ? 'rgba(255,255,255,0.65)' : '#5f5f5f'

    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5, alignItems: 'center' }}>
            <Box
                component="img"
                src={src}
                alt="VakıfBank 360 Logo"
                sx={{ width: size, height: size, objectFit: 'contain' }}
            />
            <Box>
                <Box
                    component="p"
                    sx={{ m: 0, color: textColor, lineHeight: 1.1, letterSpacing: 0.3, fontSize: 18, fontWeight: 700 }}
                >
                    VAKIFBANK <Box component="span" sx={{ color: '#F5B301' }}>360</Box>
                </Box>
                <Box
                    component="p"
                    sx={{ m: 0, color: subColor, letterSpacing: 1, fontSize: 11 }}
                >
                    360° PERFORMANCE EVALUATION
                </Box>
            </Box>
        </Box>
    )
}