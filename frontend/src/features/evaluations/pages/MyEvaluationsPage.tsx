import { useEffect, useState } from 'react'
import { Box, Typography, Paper, CircularProgress, Chip } from '@mui/material'
import { LineChart } from '@mui/x-charts/LineChart'
import { getMyEvaluations } from '../evaluationsApi'
import type { EvaluationDto } from '../types'
import EvaluationDetailDialog from '../components/EvaluationDetailDialog'

const STATUS_LABELS: Record<string, string> = { Draft: 'Taslak', Submitted: 'Gönderildi', Approved: 'Onaylandı' }
const STATUS_COLORS: Record<string, 'default' | 'info' | 'success'> = { Draft: 'default', Submitted: 'info', Approved: 'success' }

export default function MyEvaluationsPage() {
    const [evaluations, setEvaluations] = useState<EvaluationDto[]>([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState<EvaluationDto | null>(null)

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getMyEvaluations()
                setEvaluations(
                    [...data].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                )
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
            </Box>
        )
    }

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Performansım</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: 14.5 }}>
                    Geçmiş değerlendirmelerin ve puan gelişimin.
                </Typography>
            </Box>

            {evaluations.length === 0 ? (
                <Typography color="text.secondary">Henüz bir değerlendirmen bulunmuyor.</Typography>
            ) : (
                <>
                    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: { xs: 2, md: 3 }, mb: 3 }}>
                        <Typography sx={{ fontWeight: 700, mb: 1 }}>Puan Gelişimi</Typography>
                        <LineChart
                            height={260}
                            xAxis={[{ scaleType: 'point', data: evaluations.map((e) => e.evaluationPeriodName) }]}
                            series={[{ data: evaluations.map((e) => e.totalScore), label: 'Toplam Skor', color: '#F5B301' }]}
                            yAxis={[{ min: 0, max: 5 }]}
                        />
                    </Paper>

                    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
                        {[...evaluations].reverse().map((evaluation) => (
                            <Box
                                key={evaluation.id}
                                onClick={() => setSelected(evaluation)}
                                sx={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider',
                                    cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, '&:last-child': { borderBottom: 'none' },
                                }}
                            >
                                <Box>
                                    <Typography sx={{ fontWeight: 700 }}>{evaluation.evaluationPeriodName}</Typography>
                                    <Typography color="text.secondary" sx={{ fontSize: 13, mt: 0.25 }}>
                                        Değerlendiren: {evaluation.evaluatorName} · {new Date(evaluation.createdAt).toLocaleDateString('tr-TR')}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Chip
                                        size="small"
                                        label={STATUS_LABELS[evaluation.status] ?? evaluation.status}
                                        color={STATUS_COLORS[evaluation.status] ?? 'default'}
                                        sx={{ fontWeight: 600 }}
                                    />
                                    <Typography sx={{ fontWeight: 800 }}>{evaluation.totalScore.toFixed(2)} / 5</Typography>
                                </Box>
                            </Box>
                        ))}
                    </Paper>
                </>
            )}

            <EvaluationDetailDialog open={!!selected} evaluation={selected} onClose={() => setSelected(null)} />
        </Box>
    )
}