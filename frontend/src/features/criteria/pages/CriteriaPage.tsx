import { Box, Typography } from '@mui/material'

export default function CriteriaPage() {
    return (
        <Box>
            <Typography
                variant="h5"
                sx={{
                    fontWeight: 800,
                    mb: 1,
                }}
            >
                Kriter Yönetimi
            </Typography>

            <Typography color="text.secondary">
                Bu sayfa bir sonraki adımda doldurulacak.
            </Typography>
        </Box>
    )
}