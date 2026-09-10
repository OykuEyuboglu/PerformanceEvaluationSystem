import { useEffect, useState } from 'react'
import {
    Box,
    Typography,
    MenuItem,
    TextField,
    Paper,
    CircularProgress,
    Button,
} from '@mui/material'
import { EmojiEvents, FileDownload } from '@mui/icons-material'

import { getEvaluationPeriods } from '../../evaluationPeriods/evaluationPeriodsApi'
import {
    getTeamRanking,
    exportTeamRankingExcel,
    type EmployeeRanking,
} from '../../dashboard/dashboardApi'
import type { EvaluationPeriod } from '../../evaluationPeriods/types'

const RANK_COLORS: Record<number, string> = {
    1: '#F5B301',
    2: '#B0B0B0',
    3: '#B87333',
}

export default function TeamRankingPage() {
    const [periods, setPeriods] = useState<EvaluationPeriod[]>([])
    const [selectedPeriodId, setSelectedPeriodId] = useState<number | ''>('')
    const [rankings, setRankings] = useState<EmployeeRanking[]>([])
    const [loadingPeriods, setLoadingPeriods] = useState(true)
    const [loadingRankings, setLoadingRankings] = useState(false)

    // Excel export için
    const [exporting, setExporting] = useState(false)

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getEvaluationPeriods()
                setPeriods(data)

                if (data.length > 0) {
                    setSelectedPeriodId(data[0].id)
                }
            } finally {
                setLoadingPeriods(false)
            }
        }

        load()
    }, [])

    useEffect(() => {
        if (selectedPeriodId === '') return

        const load = async () => {
            setLoadingRankings(true)

            try {
                const data = await getTeamRanking(selectedPeriodId)
                setRankings(data)
            } catch {
                setRankings([])
            } finally {
                setLoadingRankings(false)
            }
        }

        load()
    }, [selectedPeriodId])

    // Excel export
    const handleExport = async () => {
        if (selectedPeriodId === '') return

        setExporting(true)

        try {
            await exportTeamRankingExcel(selectedPeriodId)
        } finally {
            setExporting(false)
        }
    }

    return (
        <Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    mb: 3,
                    flexWrap: 'wrap',
                    gap: 2,
                }}
            >
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        Ekip Sıralaması
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{ mt: 0.5, fontSize: 14.5 }}
                    >
                        Ekibindeki çalışanların seçilen dönemdeki performans
                        sıralaması.
                    </Typography>
                </Box>

                {loadingPeriods ? (
                    <CircularProgress size={24} />
                ) : (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            flexWrap: 'wrap',
                        }}
                    >
                        <TextField
                            select
                            size="small"
                            label="Değerlendirme Dönemi"
                            value={selectedPeriodId}
                            onChange={(e) =>
                                setSelectedPeriodId(Number(e.target.value))
                            }
                            sx={{ minWidth: 240 }}
                        >
                            {periods.map((p) => (
                                <MenuItem key={p.id} value={p.id}>
                                    {p.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<FileDownload />}
                            disabled={
                                exporting || selectedPeriodId === ''
                            }
                            onClick={handleExport}
                            sx={{
                                minHeight: 40,
                                whiteSpace: 'nowrap',
                                borderRadius: 2,
                            }}
                        >
                            {exporting
                                ? 'Aktarılıyor...'
                                : "Excel'e Aktar"}
                        </Button>
                    </Box>
                )}
            </Box>

            <Paper
                elevation={0}
                sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    overflow: 'hidden',
                }}
            >
                {loadingRankings ? (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            py: 6,
                        }}
                    >
                        <CircularProgress />
                    </Box>
                ) : rankings.length === 0 ? (
                    <Box sx={{ p: 4 }}>
                        <Typography color="text.secondary">
                            Bu dönem için ekibinde henüz değerlendirme verisi
                            yok.
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ overflowX: 'auto' }}>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns:
                                    '80px 1.6fr 1fr 130px',
                                gap: 2,
                                px: 3.5,
                                py: 1.75,
                                minWidth: 600,
                                bgcolor: 'action.hover',
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: 'text.secondary',
                                }}
                            >
                                SIRA
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: 'text.secondary',
                                }}
                            >
                                ÇALIŞAN
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: 'text.secondary',
                                }}
                            >
                                DEĞERLENDİRME
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: 'text.secondary',
                                    textAlign: 'right',
                                }}
                            >
                                ORTALAMA
                            </Typography>
                        </Box>

                        {rankings.map((item) => {
                            const isTop3 = item.rank <= 3

                            return (
                                <Box
                                    key={item.employeeId}
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns:
                                            '80px 1.6fr 1fr 130px',
                                        alignItems: 'center',
                                        gap: 2,
                                        px: 3.5,
                                        py: 2.25,
                                        minWidth: 600,
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                        '&:last-child': {
                                            borderBottom: 'none',
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.75,
                                        }}
                                    >
                                        {isTop3 && (
                                            <EmojiEvents
                                                sx={{
                                                    fontSize: 20,
                                                    color:
                                                        RANK_COLORS[
                                                        item.rank
                                                        ],
                                                }}
                                            />
                                        )}

                                        <Typography
                                            sx={{
                                                fontWeight: 800,
                                                color: isTop3
                                                    ? RANK_COLORS[item.rank]
                                                    : 'text.primary',
                                            }}
                                        >
                                            #{item.rank}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography sx={{ fontWeight: 700 }}>
                                            {item.employeeName}
                                        </Typography>

                                        <Typography
                                            color="text.secondary"
                                            sx={{
                                                fontSize: 13,
                                                mt: 0.25,
                                            }}
                                        >
                                            {item.jobPositionName}
                                        </Typography>
                                    </Box>

                                    <Typography sx={{ fontSize: 14 }}>
                                        {item.evaluationCount}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontWeight: 700,
                                            textAlign: 'right',
                                        }}
                                    >
                                        {item.averageScore.toFixed(2)} / 5
                                    </Typography>
                                </Box>
                            )
                        })}
                    </Box>
                )}
            </Paper>
        </Box>
    )
}