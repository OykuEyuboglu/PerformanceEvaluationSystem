import { useEffect, useState } from 'react'
import {
    Box,
    CircularProgress,
    MenuItem,
    Paper,
    TextField,
    Typography,
} from '@mui/material'
import { EmojiEvents } from '@mui/icons-material'
import { useAuthStore } from '../../../store/authStore'
import {
    getEvaluationPeriods,
    type EvaluationPeriod,
} from '../../evaluationPeriods/api/evaluationPeriodsApi'
import { getDepartmentRanking, type EmployeeRanking } from '../api/dashboardApi'

const RANK_COLORS: Record<number, string> = {
    1: '#F5B301', // altın
    2: '#B0B0B0', // gümüş
    3: '#B87333', // bronz
}

export default function DashboardPage() {
    const user = useAuthStore((s) => s.user)

    const [periods, setPeriods] = useState<EvaluationPeriod[]>([])
    const [selectedPeriodId, setSelectedPeriodId] = useState<number | ''>('')
    const [rankings, setRankings] = useState<EmployeeRanking[]>([])

    const [loadingPeriods, setLoadingPeriods] = useState(true)
    const [loadingRankings, setLoadingRankings] = useState(false)

    useEffect(() => {
        const loadPeriods = async () => {
            try {
                const data = await getEvaluationPeriods()
                setPeriods(data)
                if (data.length > 0) setSelectedPeriodId(data[0].id)
            } catch (error) {
                console.error('Değerlendirme dönemleri alınamadı:', error)
            } finally {
                setLoadingPeriods(false)
            }
        }
        loadPeriods()
    }, [])

    useEffect(() => {
        if (selectedPeriodId === '') return

        const loadRanking = async () => {
            setLoadingRankings(true)
            try {
                const data = await getDepartmentRanking(selectedPeriodId)
                setRankings(data)
            } catch (error) {
                console.error('Performans sıralaması alınamadı:', error)
                setRankings([])
            } finally {
                setLoadingRankings(false)
            }
        }
        loadRanking()
    }, [selectedPeriodId])

    const selectedPeriod = periods.find((p) => p.id === selectedPeriodId)

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        })

    return (
        <Box>
            {/* Sayfa başlığı */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    gap: 3,
                    mb: 4,
                    flexWrap: 'wrap',
                }}
            >
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
                        Hoş geldin, {user?.firstName} 👋
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.75, fontSize: 15 }}>
                        Performans değerlendirme sistemine genel bakış.
                    </Typography>
                </Box>

                {/* Dönem seçimi */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap' }}>
                        Değerlendirme dönemi
                    </Typography>

                    {loadingPeriods ? (
                        <CircularProgress size={24} />
                    ) : (
                        <TextField
                            select
                            size="small"
                            value={selectedPeriodId}
                            onChange={(e) => setSelectedPeriodId(Number(e.target.value))}
                            sx={{
                                width: 260,
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                '& .MuiSelect-select': {
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                },
                            }}
                        >
                            {periods.map((period) => (
                                <MenuItem key={period.id} value={period.id}>
                                    {period.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                </Box>
            </Box>

            {/* Seçilen dönem bilgisi + performans sıralaması */}
            <Paper
                elevation={0}
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}
            >
                {/* Dönem özeti */}
                <Box
                    sx={{
                        px: { xs: 2.5, md: 3.5 },
                        py: 2.75,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2,
                        flexWrap: 'wrap',
                    }}
                >
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {selectedPeriod?.name || 'Değerlendirme Dönemi'}
                        </Typography>
                        {selectedPeriod && (
                            <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: 12.5 }}>
                                {formatDate(selectedPeriod.startDate)} — {formatDate(selectedPeriod.endDate)}
                            </Typography>
                        )}
                    </Box>
                    <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>
                        Seçilen döneme ait performans verileri
                    </Typography>
                </Box>

                {/* Performans sıralaması */}
                <Box>
                    <Box sx={{ px: { xs: 2.5, md: 3.5 }, py: 2.75 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Performans Sıralaması
                        </Typography>
                        <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: 12.5 }}>
                            Çalışanların seçilen dönemdeki performans sonuçları.
                        </Typography>
                    </Box>

                    {loadingRankings ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                            <CircularProgress />
                        </Box>
                    ) : rankings.length === 0 ? (
                        <Box sx={{ px: 3.5, py: 5 }}>
                            <Typography color="text.secondary">
                                Bu dönem için performans verisi bulunmuyor.
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ overflowX: 'auto' }}>
                            {/* Tablo başlıkları */}
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: '80px 1.6fr 1fr 1fr 130px',
                                    alignItems: 'center',
                                    gap: 2,
                                    px: 3.5,
                                    py: 1.75,
                                    minWidth: 720,
                                    bgcolor: 'action.hover',
                                    borderTop: '1px solid',
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>
                                    SIRA
                                </Typography>
                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>
                                    ÇALIŞAN
                                </Typography>
                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>
                                    DEPARTMAN
                                </Typography>
                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>
                                    DEĞERLENDİRME
                                </Typography>
                                <Typography
                                    sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', textAlign: 'right' }}
                                >
                                    ORTALAMA
                                </Typography>
                            </Box>

                            {rankings.map((item) => {
                                const isTop3 = item.rank <= 3
                                const rankColor = RANK_COLORS[item.rank]

                                return (
                                    <Box
                                        key={item.employeeId}
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: '80px 1.6fr 1fr 1fr 130px',
                                            alignItems: 'center',
                                            gap: 2,
                                            px: 3.5,
                                            py: 2.25,
                                            minWidth: 720,
                                            borderBottom: '1px solid',
                                            borderColor: 'divider',
                                            '&:last-child': { borderBottom: 'none' },
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                            {isTop3 && <EmojiEvents sx={{ fontSize: 20, color: rankColor }} />}
                                            <Typography sx={{ fontWeight: 800, color: isTop3 ? rankColor : 'text.primary' }}>
                                                #{item.rank}
                                            </Typography>
                                        </Box>

                                        <Box>
                                            <Typography sx={{ fontWeight: 700 }}>{item.employeeName}</Typography>
                                            <Typography color="text.secondary" sx={{ fontSize: 13, mt: 0.25 }}>
                                                {item.jobPositionName}
                                            </Typography>
                                        </Box>

                                        <Typography sx={{ fontSize: 14 }}>{item.departmentName}</Typography>
                                        <Typography sx={{ fontSize: 14 }}>{item.evaluationCount}</Typography>

                                        <Typography sx={{ fontWeight: 700, textAlign: 'right' }}>
                                            {item.averageScore.toFixed(2)} / 5
                                        </Typography>
                                    </Box>
                                )
                            })}
                        </Box>
                    )}
                </Box>
            </Paper>
        </Box>
    )
}