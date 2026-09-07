import { Box, Typography } from '@mui/material'

export default function MyEvaluationsPage() {
    return (
        <Box>
            <Typography
                variant="h5"
                sx={{
                    fontWeight: 800,
                    mb: 1,
                }}
            >
                Performannsım
            </Typography>

            <Typography color="text.secondary">
                Bu sayfa bir sonraki adımda doldurulacak.
            </Typography>
        </Box>
    )
}