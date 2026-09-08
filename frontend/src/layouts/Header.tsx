import {
    AppBar,
    Toolbar,
    Box,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Typography,
} from '@mui/material'
import {
    LightMode,
    DarkMode,
    MenuOpen,
    Menu as MenuIcon,
    Logout,
} from '@mui/icons-material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Logo from '../shared/components/logo'
import { useAuthStore } from '../store/authStore'
import { HEADER_HEIGHT } from '../shared/constants/layout'

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

    const navigate = useNavigate()
    const user = useAuthStore((s) => s.user)
    const logout = useAuthStore((s) => s.logout)

    const [profileAnchorEl, setProfileAnchorEl] =
        useState<null | HTMLElement>(null)

    const profileMenuOpen = Boolean(profileAnchorEl)

    const handleProfileClick = (
        event: React.MouseEvent<HTMLElement>
    ) => {
        setProfileAnchorEl(event.currentTarget)
    }

    const handleProfileClose = () => {
        setProfileAnchorEl(null)
    }

    const handleLogout = () => {
        handleProfileClose()
        logout()
        navigate('/login', { replace: true })
    }

    const userInitial =
        user?.firstName?.charAt(0).toUpperCase() || 'U'

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                height: HEADER_HEIGHT,
                bgcolor: 'background.paper',
                color: 'text.primary',
                borderBottom: '1px solid',
                borderColor: 'divider',
                zIndex: (theme) =>
                    theme.zIndex.drawer + 2,
            }}
        >
            <Toolbar
                sx={{
                    height: HEADER_HEIGHT,
                    minHeight: `${ HEADER_HEIGHT } px!important`,
                    px: { xs: 2, md: 3 },
                }}
            >
                {/* Sidebar toggle */}
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
                    {sidebarOpen ? (
                        <MenuOpen />
                    ) : (
                        <MenuIcon />
                    )}
                </IconButton>

                {/* Logo */}
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

                {/* Sağ taraf */}
                <Box
                    sx={{
                        marginLeft: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                    }}
                >
                    {/* Theme toggle */}
                    <IconButton
                        onClick={() =>
                            setMode(
                                isDark
                                    ? 'light'
                                    : 'dark'
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

                    {/* User menu */}
                    <IconButton
                        onClick={handleProfileClick}
                        aria-label="Kullanıcı menüsü"
                        aria-controls={
                            profileMenuOpen
                                ? 'profile-menu'
                                : undefined
                        }
                        aria-haspopup="true"
                        aria-expanded={
                            profileMenuOpen
                                ? 'true'
                                : undefined
                        }
                        sx={{
                            ml: 0.5,
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 34,
                                height: 34,
                                bgcolor: 'primary.main',
                                color: '#111111',
                                fontSize: 14,
                                fontWeight: 800,
                            }}
                        >
                            {userInitial}
                        </Avatar>
                    </IconButton>

                    {/* User dropdown */}
                    <Menu
                        id="profile-menu"
                        anchorEl={profileAnchorEl}
                        open={profileMenuOpen}
                        onClose={handleProfileClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        slotProps={{
                            paper: {
                                sx: {
                                    mt: 1,
                                    minWidth: 210,
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                },
                            },
                        }}
                    >
                        <Box
                            sx={{
                                px: 2,
                                py: 1.5,
                            }}
                        >
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    fontSize: 14,
                                }}
                            >
                                {user?.firstName}{' '}
                                {user?.lastName}
                            </Typography>

                            <Typography
                                color="text.secondary"
                                sx={{
                                    fontSize: 12,
                                    mt: 0.25,
                                }}
                            >
                                {user?.role}
                            </Typography>
                        </Box>

                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <Logout fontSize="small" />
                            </ListItemIcon>

                            <ListItemText>
                                Çıkış Yap
                            </ListItemText>
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    )
}