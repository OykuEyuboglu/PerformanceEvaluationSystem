import {
    AppBar,
    Toolbar,
    Box,
    IconButton,
} from '@mui/material'
import {
    LightMode,
    DarkMode,
    MenuOpen,
    Menu as MenuIcon,
} from '@mui/icons-material'
import Logo from '../shared/components/logo'

type HeaderProps = {
    mode: 'light' | 'dark'
    setMode: React.Dispatch<React.SetStateAction<'light' | 'dark'>>
    sidebarOpen: boolean
    onToggleSidebar: () => void
}

export default function Header({
    mode,
    setMode,
    sidebarOpen,
    onToggleSidebar,
}: HeaderProps) {
    const isDark = mode === 'dark'

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
            <Toolbar
                sx={{
                    height: 64,
                    minHeight: '64px !important',
                    px: { xs: 2, md: 3 },
                }}
            >
                <IconButton
                    onClick={onToggleSidebar}
                    sx={{
                        color: 'text.primary',
                        mr: 1,
                        display: {
                            xs: 'none',
                            md: 'inline-flex',
                        },
                    }}
                    aria-label="Menüyü daralt/genişlet"
                >
                    {sidebarOpen ? <MenuOpen /> : <MenuIcon />}
                </IconButton>

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <Logo
                        variant={isDark ? 'light' : 'dark'}
                        size={40}
                    />
                </Box>

                <Box sx={{ marginLeft: 'auto' }}>
                    <IconButton
                        onClick={() =>
                            setMode(
                                isDark ? 'light' : 'dark'
                            )
                        }
                        sx={{
                            color: 'text.primary',
                        }}
                        aria-label="Tema değiştir"
                    >
                        {isDark ? (
                            <LightMode />
                        ) : (
                            <DarkMode />
                        )}
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    )
}