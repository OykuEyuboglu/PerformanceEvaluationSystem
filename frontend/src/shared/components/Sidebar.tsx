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

import {
    HEADER_HEIGHT,
    SIDEBAR_EXPANDED_WIDTH,
    SIDEBAR_COLLAPSED_WIDTH,
} from '../constants/layout'

const iconMap: Record<string, React.ReactElement> = {
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
    onHoverChange: (open: boolean) => void
}

export default function Sidebar({
    open,
    onHoverChange,
}: SidebarProps) {
    const location = useLocation()
    const navigate = useNavigate()

    const user = useAuthStore((s) => s.user)

    const visibleItems = navItems.filter(
        (item) =>
            user &&
            item.roles.includes(user.role)
    )

    const width = open
        ? SIDEBAR_EXPANDED_WIDTH
        : SIDEBAR_COLLAPSED_WIDTH

    return (
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
                minHeight: `calc(100vh - ${ HEADER_HEIGHT }px)`,
                backgroundColor:
                    'background.paper',
            }}
        >
            <Drawer
                variant="permanent"
                sx={{
                    width: SIDEBAR_COLLAPSED_WIDTH,
                    flexShrink: 0,

                    display: {
                        xs: 'none',
                        md: 'block',
                    },

                    '& .MuiDrawer-paper': {
                        width,
                        top: HEADER_HEIGHT,
                        height: `calc(100vh - ${ HEADER_HEIGHT }px)`,

                        overflowX: 'hidden',
                        boxSizing: 'border-box',

                        borderRight: '1px solid',
                        borderColor: 'divider',

                        position: 'fixed',
                        left: 0,

                        zIndex: (theme) =>
                            theme.zIndex.appBar - 1,

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

                            const button = (
                                <ListItemButton
                                    key={item.path}
                                    disableRipple
                                    selected={selected}
                                    onClick={() =>
                                        navigate(
                                            item.path
                                        )
                                    }
                                    sx={{
                                        mx: 1.5,
                                        mb: 0.5,
                                        borderRadius: 2,
                                        minWidth: 0,

                                        justifyContent:
                                            open
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

                                            '&:hover':
                                                {
                                                    bgcolor:
                                                        'primary.main',
                                                },
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: open
                                                ? 40
                                                : 0,

                                            justifyContent:
                                                'center',
                                        }}
                                    >
                                        {
                                            iconMap[
                                                item.icon
                                            ]
                                        }
                                    </ListItemIcon>

                                    {open && (
                                        <ListItemText
                                            primary={
                                                item.label
                                            }
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

                            return open ? (
                                button
                            ) : (
                                <Tooltip
                                    key={item.path}
                                    title={item.label}
                                    placement="right"
                                >
                                    {button}
                                </Tooltip>
                            )
                        })}
                    </List>
                </Box>
            </Drawer>
        </Box>
    )
}