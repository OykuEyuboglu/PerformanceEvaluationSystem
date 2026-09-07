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
import { useLocation, useNavigate } from 'react-router-dom'
import { navItems } from '../types/navigation'
import { useAuthStore } from '../../store/authStore'

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

const EXPANDED_WIDTH = 260
const COLLAPSED_WIDTH = 76

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
        (item) => user && item.roles.includes(user.role)
    )

    const width = open ? EXPANDED_WIDTH : COLLAPSED_WIDTH

    return (
        <Box
            onMouseEnter={() => onHoverChange(true)}
            onMouseLeave={() => onHoverChange(false)}
            sx={{
                width: COLLAPSED_WIDTH,
                flexShrink: 0,
            }}
        >
            <Drawer
                variant="permanent"
                sx={{
                    width: COLLAPSED_WIDTH,
                    flexShrink: 0,
                    display: { xs: 'none', md: 'block' },

                    '& .MuiDrawer-paper': {
                        width,
                        top: 64,
                        height: 'calc(100vh - 64px)',
                        overflowX: 'hidden',
                        boxSizing: 'border-box',
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        position: 'fixed',
                        left: 0,
                        zIndex: (theme) =>
                            theme.zIndex.drawer + 2,

                        transition: (theme) =>
                            theme.transitions.create('width', {
                                duration: 400,
                            }),
                    },
                }}
            >
                <Box sx={{ overflow: 'hidden', py: 1 }}>
                    <List>
                        {visibleItems.map((item) => {
                            const selected =
                                location.pathname === item.path

                            const button = (
                                <ListItemButton
                                    key={item.path}
                                    selected={selected}
                                    onClick={() =>
                                        navigate(item.path)
                                    }
                                    sx={{
                                        mx: 1.5,
                                        mb: 0.5,
                                        borderRadius: 2,

                                        justifyContent: open
                                            ? 'flex-start'
                                            : 'center',

                                        '&.Mui-selected': {
                                            bgcolor:
                                                'primary.main',
                                            color: '#111111',

                                            '& .MuiListItemIcon-root': {
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
                                            minWidth: open
                                                ? 40
                                                : 0,
                                            justifyContent:
                                                'center',
                                        }}
                                    >
                                        {iconMap[item.icon]}
                                    </ListItemIcon>

                                    {open && (
                                        <ListItemText
                                            slotProps={{
                                                primary: {
                                                    sx: {
                                                        fontSize: 14,
                                                        fontWeight: 600,
                                                    },
                                                },
                                            }}
                                        >
                                            {item.label}
                                        </ListItemText>
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