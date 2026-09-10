import {
    AppBar,
    Toolbar,
    Box,
    Button,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Typography,
    Chip,
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

import { useLanguage } from '../shared/i18n/LanguageContext'
import { translations } from '../shared/i18n/translations'

import { HEADER_HEIGHT } from '../shared/constants/layout'

type HeaderProps = {
    mode: 'light' | 'dark'
    setMode: React.Dispatch<
        React.SetStateAction<'light' | 'dark'>
    >
    sidebarOpen: boolean
    onToggleSidebar: () => void
    onOpenMobileSidebar: () => void
}

export default function Header({
    mode,
    setMode,
    sidebarOpen,
    onToggleSidebar,
    onOpenMobileSidebar,
}: HeaderProps) {
    const isDark = mode === 'dark'

    const { language, setLanguage } =
        useLanguage()

    const t = translations[language]

    const navigate = useNavigate()

    const user = useAuthStore(
        (s) => s.user
    )

    const roleLabel =
        user?.role === 'Admin'
            ? language === 'tr'
                ? 'Admin'
                : 'Admin'
            : user?.role === 'Evaluator'
                ? language === 'tr'
                    ? 'Değerlendirici'
                    : 'Evaluator'
                : ''

    const logout = useAuthStore(
        (s) => s.logout
    )

    const [
        profileAnchorEl,
        setProfileAnchorEl,
    ] = useState<null | HTMLElement>(null)

    const profileMenuOpen =
        Boolean(profileAnchorEl)

    const handleProfileClick = (
        event: React.MouseEvent<HTMLElement>
    ) => {
        setProfileAnchorEl(
            event.currentTarget
        )
    }

    const handleProfileClose = () => {
        setProfileAnchorEl(null)
    }

    const handleLogout = () => {
        handleProfileClose()
        logout()

        navigate('/login', {
            replace: true,
        })
    }

    const userInitial =
        user?.firstName
            ?.charAt(0)
            .toUpperCase() || 'U'

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
                    minHeight: `${HEADER_HEIGHT}px !important`,

                    px: {
                        xs: 1,
                        sm: 1.5,
                        md: 3,
                    },

                    width: '100%',
                    boxSizing: 'border-box',

                    overflow: 'hidden',
                }}
            >
                {/* DESKTOP SIDEBAR TOGGLE */}
                <IconButton
                    id="sidebar-toggle"
                    onClick={onToggleSidebar}
                    sx={{
                        color: 'text.primary',
                        mr: 1,

                        display: {
                            xs: 'none',
                            md: 'inline-flex',
                        },
                    }}
                    aria-label={
                        language === 'tr'
                            ? 'Menüyü daralt/genişlet'
                            : 'Collapse/expand menu'
                    }
                >
                    {sidebarOpen ? (
                        <MenuOpen />
                    ) : (
                        <MenuIcon />
                    )}
                </IconButton>

                {/* MOBILE SIDEBAR TOGGLE */}
                <IconButton
                    onClick={
                        onOpenMobileSidebar
                    }
                    sx={{
                        color: 'text.primary',

                        mr: {
                            xs: 0.25,
                            sm: 0.5,
                        },

                        flexShrink: 0,

                        display: {
                            xs: 'inline-flex',
                            md: 'none',
                        },
                    }}
                    aria-label={
                        language === 'tr'
                            ? 'Menüyü aç'
                            : 'Open menu'
                    }
                >
                    <MenuIcon />
                </IconButton>

                {/* LOGO */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',

                        minWidth: 0,

                        flex: {
                            xs: 1,
                            md: 'initial',
                        },

                        maxWidth: {
                            xs: '100%',
                            md: 'none',
                        },

                        overflow: 'hidden',
                    }}
                >
                    <Logo
                        variant={
                            isDark
                                ? 'light'
                                : 'dark'
                        }
                        size={40}
                    />
                </Box>

                {/* RIGHT SIDE */}
                <Box
                    sx={{
                        ml: 'auto',

                        display: 'flex',
                        alignItems: 'center',

                        gap: {
                            xs: 0,
                            sm: 0.25,
                            md: 0.5,
                        },

                        flexShrink: 0,
                    }}
                >
                    {/* LANGUAGE */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',

                            border: '1px solid',
                            borderColor:
                                'divider',

                            borderRadius: 2,
                            overflow: 'hidden',

                            flexShrink: 0,
                        }}
                    >
                        <Button
                            onClick={() =>
                                setLanguage('tr')
                            }
                            size="small"
                            aria-label="Türkçe"
                            sx={{
                                minWidth: {
                                    xs: 28,
                                    sm: 32,
                                    md: 38,
                                },

                                px: {
                                    xs: 0.4,
                                    sm: 0.6,
                                    md: 1,
                                },

                                py: 0.5,

                                fontSize: {
                                    xs: 10,
                                    sm: 10.5,
                                    md: 11,
                                },

                                fontWeight:
                                    language === 'tr'
                                        ? 800
                                        : 500,

                                color:
                                    language === 'tr'
                                        ? 'text.primary'
                                        : 'text.secondary',

                                bgcolor:
                                    language === 'tr'
                                        ? 'action.selected'
                                        : 'transparent',

                                borderRadius: 0,

                                '&:hover': {
                                    bgcolor:
                                        'action.hover',
                                },
                            }}
                        >
                            TR
                        </Button>

                        <Box
                            sx={{
                                width: '1px',
                                height: 18,
                                bgcolor:
                                    'divider',
                            }}
                        />

                        <Button
                            onClick={() =>
                                setLanguage('en')
                            }
                            size="small"
                            aria-label="English"
                            sx={{
                                minWidth: {
                                    xs: 28,
                                    sm: 32,
                                    md: 38,
                                },

                                px: {
                                    xs: 0.4,
                                    sm: 0.6,
                                    md: 1,
                                },

                                py: 0.5,

                                fontSize: {
                                    xs: 10,
                                    sm: 10.5,
                                    md: 11,
                                },

                                fontWeight:
                                    language === 'en'
                                        ? 800
                                        : 500,

                                color:
                                    language === 'en'
                                        ? 'text.primary'
                                        : 'text.secondary',

                                bgcolor:
                                    language === 'en'
                                        ? 'action.selected'
                                        : 'transparent',

                                borderRadius: 0,

                                '&:hover': {
                                    bgcolor:
                                        'action.hover',
                                },
                            }}
                        >
                            EN
                        </Button>
                    </Box>

                    {/* THEME TOGGLE */}
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

                            p: {
                                xs: 0.5,
                                sm: 0.75,
                                md: 1,
                            },
                        }}
                        aria-label={
                            language === 'tr'
                                ? 'Tema değiştir'
                                : 'Change theme'
                        }
                    >
                        {isDark ? (
                            <LightMode />
                        ) : (
                            <DarkMode />
                        )}
                    </IconButton>

                    {/* USER */}
                    <IconButton
                        onClick={
                            handleProfileClick
                        }
                        aria-label={
                            language === 'tr'
                                ? 'Kullanıcı menüsü'
                                : 'User menu'
                        }
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
                            ml: {
                                xs: 0,
                                md: 0.5,
                            },

                            p: {
                                xs: 0.5,
                                md: 1,
                            },
                        }}
                    >
                        <Avatar
                            sx={{
                                width: {
                                    xs: 28,
                                    sm: 32,
                                    md: 34,
                                },

                                height: {
                                    xs: 28,
                                    sm: 32,
                                    md: 34,
                                },

                                bgcolor:
                                    'primary.main',

                                color: '#111111',

                                fontSize: {
                                    xs: 12,
                                    sm: 13,
                                    md: 14,
                                },

                                fontWeight: 800,
                            }}
                        >
                            {userInitial}
                        </Avatar>
                    </IconButton>

                    {/* USER DROPDOWN */}
                    <Menu
                        id="profile-menu"
                        anchorEl={
                            profileAnchorEl
                        }
                        open={
                            profileMenuOpen
                        }
                        onClose={
                            handleProfileClose
                        }
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
                                    borderColor:
                                        'divider',
                                },
                            },
                        }}
                    >
                        <Box
                            sx={{
                                px: 2,
                                py: 1,
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

                            {user?.jobPositionName && (
                                <Typography
                                    color="text.secondary"
                                    sx={{
                                        fontSize: 12,
                                        mt: 0.35,
                                    }}
                                >
                                    {user?.jobPositionName ||
                                        (user?.role === 'Admin'
                                            ? language === 'tr'
                                                ? 'Sistem Yöneticisi'
                                                : 'System Administrator'
                                            : '')}
                                </Typography>
                            )}

                            {roleLabel && (
                                <Chip
                                    label={roleLabel}
                                    size="small"
                                    sx={{
                                        mt: 1,
                                        height: 22,
                                        fontSize: 11,
                                        fontWeight: 700,
                                        bgcolor: 'action.selected',
                                        color: 'text.primary',
                                        borderRadius: 1.5,
                                    }}
                                />
                            )}
                        </Box>

                        <MenuItem
                            onClick={
                                handleLogout
                            }
                        >
                            <ListItemIcon>
                                <Logout fontSize="small" />
                            </ListItemIcon>

                            <ListItemText>
                                {t.header.logout}
                            </ListItemText>
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    )
}