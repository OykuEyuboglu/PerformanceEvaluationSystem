import { AppBar, Toolbar, Box, IconButton } from '@mui/material'
import { LightMode, DarkMode } from '@mui/icons-material'
import Logo from '../shared/components/logo'

type HeaderProps = {
    mode: 'light' | 'dark'
    setMode: React.Dispatch<React.SetStateAction<'light' | 'dark'>>
}

export default function Header({ mode, setMode }: HeaderProps) {
    const isDark = mode === 'dark'

    const handleThemeChange = () => {
        setMode(isDark ? 'light' : 'dark')
    }

    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                bgcolor: 'background.paper',
                color: 'text.primary',
                borderBottom: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Toolbar sx={{ minHeight: 72, px: { xs: 2, md: 4 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Logo
                        variant={isDark ? 'light' : 'dark'}
                        size={40}
                    />
                </Box>

                <Box sx={{ marginLeft: 'auto' }}>
                    <IconButton
                        onClick={handleThemeChange}
                        sx={{
                            color: 'text.primary',
                        }}
                        aria-label="Tema değiştir"
                    >
                        {isDark ? <LightMode /> : <DarkMode />}
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    )
}