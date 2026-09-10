import { Box } from '@mui/material'
import logoWhite from '../../assets/logo-white.png'
import logoBlack from '../../assets/logo-black.png'

interface LogoProps {
    variant?: 'light' | 'dark'
    size?: number
}

export default function Logo({
    variant = 'dark',
    size = 44,
}: LogoProps) {
    const src =
        variant === 'light'
            ? logoWhite
            : logoBlack

    const textColor =
        variant === 'light'
            ? '#ffffff'
            : '#111111'

    const subColor =
        variant === 'light'
            ? 'rgba(255,255,255,0.65)'
            : '#5f5f5f'

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',

                gap: {
                    xs: 0.6,
                    sm: 1,
                    md: 1.5,
                },

                minWidth: 0,
                maxWidth: '100%',
                overflow: 'hidden',
                flexShrink: 1,
            }}
        >
            {/* LOGO ICON */}
            <Box
                component="img"
                src={src}
                alt="VakıfBank 360 Logo"
                sx={{
                    width: {
                        xs: `clamp(28px, 9vw, ${size}px)`,
                        sm: size,
                        md: size,
                    },

                    height: {
                        xs: `clamp(28px, 9vw, ${size}px)`,
                        sm: size,
                        md: size,
                    },

                    minWidth: {
                        xs: 28,
                        sm: size,
                    },

                    flexShrink: 1,

                    objectFit: 'contain',
                    display: 'block',
                }}
            />

            {/* LOGO TEXT */}
            <Box
                sx={{
                    minWidth: 0,
                    flexShrink: 1,
                    overflow: 'hidden',
                }}
            >
                {/* VAKIFBANK 360 */}
                <Box
                    component="p"
                    sx={{
                        m: 0,
                        color: textColor,

                        lineHeight: 1.05,

                        letterSpacing: {
                            xs: 0,
                            sm: 0.2,
                            md: 0.3,
                        },

                        fontSize: {
                            xs: 'clamp(11px, 3.5vw, 16px)',
                            sm: 17,
                            md: 18,
                        },

                        fontWeight: 700,

                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                    }}
                >
                    VAKIFBANK{' '}
                    <Box
                        component="span"
                        sx={{
                            color: '#F5B301',
                        }}
                    >
                        360
                    </Box>
                </Box>

                {/* ALT BAŞLIK */}
                <Box
                    component="p"
                    sx={{
                        m: 0,
                        color: subColor,

                        letterSpacing: {
                            xs: 0.3,
                            sm: 0.7,
                            md: 1,
                        },

                        fontSize: {
                            xs: 'clamp(6px, 1.8vw, 8px)',
                            sm: 9,
                            md: 11,
                        },

                        lineHeight: 1.15,

                        whiteSpace: 'nowrap',
                        overflow: 'hidden',

                        maxWidth: '100%',
                    }}
                >
                    360° PERFORMANCE EVALUATION
                </Box>
            </Box>
        </Box>
    )
}