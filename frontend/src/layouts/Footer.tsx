import { Box, Typography } from '@mui/material'

export default function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                px: { xs: 2, md: 4 },
                py: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}
        >
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                © {new Date().getFullYear()} VakıfBank 360
            </Typography>

            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Tüm hakları saklıdır
            </Typography>
        </Box>
    )
}