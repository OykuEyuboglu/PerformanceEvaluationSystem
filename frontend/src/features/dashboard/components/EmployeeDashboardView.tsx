import { useEffect, useState } from 'react'
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material'
import { ArrowForward, TrendingUp } from '@mui/icons-material'
import { Link as RouterLink } from 'react-router-dom'
import { getMyEvaluations } from '../../evaluations/evaluationsApi'
import type { EvaluationDto } from '../../evaluations/types'

export default function EmployeeDashboardView({ firstName }: { firstName?: string }) {
    const [latest, setLatest] = useState<EvaluationDto | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getMyEvaluations()
                const sorted = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                setLatest(sorted[0] ?? null)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    return (
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>Hoş geldin, {firstName} 👋</Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>Performans özetin.</Typography>

            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 4, textAlign: 'center' }}>
                {loading ? (
                    <CircularProgress size={24} />
                ) : !latest ? (
                    <>
                        <TrendingUp sx={{ fontSize: 36, color: 'text.secondary', mb: 1 }} />
                        <Typography color="text.secondary">Henüz bir değerlendirmen bulunmuyor.</Typography>
                    </>
                ) : (
                    <>
                        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                            Son Dönem: {latest.evaluationPeriodName}
                        </Typography>
                        <Typography sx={{ fontWeight: 800, fontSize: 40, my: 1 }}>
                            {latest.totalScore.toFixed(2)} <Typography component="span" sx={{ fontSize: 18, color: 'text.secondary' }}>/ 5</Typography>
                        </Typography>
                        <Button component={RouterLink} to="/my-evaluations" endIcon={<ArrowForward />}>
                            Tüm Geçmişimi Gör
                        </Button>
                    </>
                )}
            </Paper>
        </Box>
    )
}