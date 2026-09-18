import {
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    Tooltip,
} from '@mui/material'

import {
    Dashboard,
    People,
    Rule,
    CalendarMonth,
    Groups,
    Assignment,
    RateReview,
    Leaderboard,
    BarChart,
    TrendingUp,
} from '@mui/icons-material'

import {
    useLocation,
    useNavigate,
} from 'react-router-dom'

import { navItems } from '../types/navigation'
import { useAuthStore } from '../../store/authStore'

import { useLanguage } from '../i18n/LanguageContext'
import { translations } from '../i18n/translations'

import {
    HEADER_HEIGHT,
    SIDEBAR_EXPANDED_WIDTH,
    SIDEBAR_COLLAPSED_WIDTH,
} from '../constants/layout'

const iconMap: Record<
    string,
    React.ReactElement
> = {
    Dashboard: <Dashboard />,
    People: <People />,
    Rule: <Rule />,
    CalendarMonth: <CalendarMonth />,
    Groups: <Groups />,
    Assignment: <Assignment />,
    RateReview: <RateReview />,
    Leaderboard: <Leaderboard />,
    BarChart: <BarChart />,
    TrendingUp: <TrendingUp />,
}

interface SidebarProps {
    open: boolean
    mobileOpen: boolean
    onHoverChange: (open: boolean) => void
    onCloseMobile: () => void
}

export default function Sidebar({
    open,
    mobileOpen,
    onHoverChange,
    onCloseMobile,
}: SidebarProps) {
    const location = useLocation()
    const navigate = useNavigate()

    const user = useAuthStore(
        (s) => s.user
    )

    const { language } = useLanguage()
    const t = translations[language]

    const visibleItems = navItems.filter(
        (item) =>
            user &&
            item.roles.includes(user.role)
    )

    const width = open
        ? SIDEBAR_EXPANDED_WIDTH
        : SIDEBAR_COLLAPSED_WIDTH

    const menuExpanded =
        open || mobileOpen

    const getLabel = (key: string) => {
        return (
            t.sidebar[
            key as keyof typeof t.sidebar
            ] ?? key
        )
    }

    const menuContent = (
        <Box
            sx={{
                overflow: 'hidden',
                py: 1,
            }}
        >
            <List>
                {visibleItems.map((item) => {
                    const selected =
                        location.pathname ===
                        item.path

                    const label =
                        getLabel(item.label)

                    const handleNavigate =
                        () => {
                            navigate(item.path)

                            if (mobileOpen) {
                                onCloseMobile()
                            }
                        }

                    const button = (
                        <ListItemButton
                            key={item.path}
                            disableRipple
                            selected={selected}
                            onClick={
                                handleNavigate
                            }
                            sx={{
                                mx: 1.5,
                                mb: 0.5,
                                borderRadius: 2,
                                minWidth: 0,

                                justifyContent:
                                    menuExpanded
                                        ? 'flex-start'
                                        : 'center',

                                '&.Mui-selected': {
                                    bgcolor:
                                        'primary.main',
                                    color: '#111111',

                                    '& .MuiListItemIcon-root':
                                    {
                                        color: '#111111',
                                    },

                                    '&:hover': {
                                        bgcolor:
                                            'primary.main',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth:
                                        menuExpanded
                                            ? 40
                                            : 0,

                                    justifyContent:
                                        'center',

                                    color:
                                        'text.secondary',
                                }}
                            >
                                {
                                    iconMap[
                                    item.icon
                                    ]
                                }
                            </ListItemIcon>

                            {menuExpanded && (
                                <ListItemText
                                    primary={label}
                                    slotProps={{
                                        primary: {
                                            sx: {
                                                fontSize: 14,
                                                fontWeight: 600,
                                                whiteSpace:
                                                    'nowrap',
                                            },
                                        },
                                    }}
                                />
                            )}
                        </ListItemButton>
                    )

                    return menuExpanded ? (
                        button
                    ) : (
                        <Tooltip
                            key={item.path}
                            title={label}
                            placement="right"
                        >
                            {button}
                        </Tooltip>
                    )
                })}
            </List>
        </Box>
    )

    return (
        <>
            <Box
                onMouseEnter={() =>
                    onHoverChange(true)
                }
                onMouseLeave={() =>
                    onHoverChange(false)
                }
                sx={{
                    width: SIDEBAR_COLLAPSED_WIDTH,
                    flexShrink: 0,

                    minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,

                    backgroundColor:
                        'background.paper',

                    display: {
                        xs: 'none',
                        md: 'block',
                    },
                }}
            >
                <Drawer
                    id="main-sidebar"
                    variant="permanent"
                    sx={{
                        width:
                            SIDEBAR_COLLAPSED_WIDTH,
                        flexShrink: 0,

                        '& .MuiDrawer-paper': {
                            width,
                            top: HEADER_HEIGHT,

                            height: `calc(100vh - ${HEADER_HEIGHT}px)`,

                            overflowX: 'hidden',
                            boxSizing: 'border-box',

                            borderRight: '1px solid',
                            borderColor: 'divider',

                            position: 'fixed',
                            left: 0,

                            zIndex: (theme) =>
                                theme.zIndex.appBar -
                                1,

                            transition: (theme) =>
                                theme.transitions.create(
                                    'width',
                                    {
                                        duration: 300,
                                    }
                                ),
                        },
                    }}
                >
                    {menuContent}
                </Drawer>
            </Box>

            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onCloseMobile}
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    display: {
                        xs: 'block',
                        md: 'none',
                    },

                    '& .MuiDrawer-paper': {
                        width: 220,
                        boxSizing: 'border-box',

                        top: HEADER_HEIGHT,

                        height: `calc(100vh - ${HEADER_HEIGHT}px)`,

                        borderRight: '1px solid',
                        borderColor: 'divider',

                        backgroundColor:
                            'background.paper',
                    },
                }}
            >
                {menuContent}
            </Drawer>
        </>
    )
}