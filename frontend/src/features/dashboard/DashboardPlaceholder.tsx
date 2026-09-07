import { Box, Typography } from '@mui/material'
import { useAuthStore } from '../../store/authStore'

export default function DashboardPlaceholder() {
    const user = useAuthStore((s) => s.user)

    return (
        <Box sx={{ p: 4 }}>
            <Typography
                variant="h5"
                sx={{
                    fontWeight: 700,
                }}
            >
                Hoş geldin, {user?.firstName}
            </Typography>

            <Typography
                color="text.secondary"
                sx={{
                    mt: 1,
                }}
            >
                Rolün: {user?.role}
            </Typography>
        </Box>
    )
}