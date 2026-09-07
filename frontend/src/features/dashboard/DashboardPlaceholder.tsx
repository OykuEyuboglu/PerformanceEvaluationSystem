import { useEffect, useState } from 'react'
import {
    Box,
    CircularProgress,
    MenuItem,
    Paper,
    TextField,
    Typography,
} from '@mui/material'
import { useAuthStore } from '../../store/authStore'
import {
    getEvaluationPeriods,
    type EvaluationPeriod,
} from '../evaluationPeriods/api/evaluationPeriodsApi'
import {
    getDepartmentRanking,
    type EmployeeRanking,
} from './api/dashboardApi'

export default function DashboardPlaceholder() {
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

                if (data.length > 0) {
                    setSelectedPeriodId(data[0].id)
                }
            } catch (error) {
                console.error(
                    'Değerlendirme dönemleri alınamadı:',
                    error
                )
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
                const data = await getDepartmentRanking(
                    selectedPeriodId
                )

                setRankings(data)
            } catch (error) {
                console.error(
                    'Performans sıralaması alınamadı:',
                    error
                )

                setRankings([])
            } finally {
                setLoadingRankings(false)
            }
        }

        loadRanking()
    }, [selectedPeriodId])

    const selectedPeriod = periods.find(
        (period) => period.id === selectedPeriodId
    )

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
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 800,
                            letterSpacing: '-0.5px',
                        }}
                    >
                        Hoş geldin, {user?.firstName} 👋
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{
                            mt: 0.75,
                            fontSize: 15,
                        }}
                    >
                        Performans değerlendirme sistemine genel bakış.
                    </Typography>
                </Box>

                {/* Dönem seçimi */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 14,
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Değerlendirme dönemi
                    </Typography>

                    {loadingPeriods ? (
                        <CircularProgress size={24} />
                    ) : (
                        <TextField
                            select
                            size="small"
                            value={selectedPeriodId}
                            onChange={(event) =>
                                setSelectedPeriodId(
                                    Number(event.target.value)
                                )
                            }
                            sx={{
                                width: 180,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                },
                            }}
                        >
                            {periods.map((period) => (
                                <MenuItem
                                    key={period.id}
                                    value={period.id}
                                >
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
                sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    overflow: 'hidden',
                }}
            >
                {/* Dönem özeti */}
                <Box
                    sx={{
                        px: { xs: 2.5, md: 3 },
                        py: 2.5,
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
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 800,
                            }}
                        >
                            {selectedPeriod?.name ||
                                'Değerlendirme Dönemi'}
                        </Typography>

                        {selectedPeriod && (
                            <Typography
                                color="text.secondary"
                                sx={{
                                    mt: 0.5,
                                    fontSize: 14,
                                }}
                            >
                                {formatDate(selectedPeriod.startDate)}
                                {' — '}
                                {formatDate(selectedPeriod.endDate)}
                            </Typography>
                        )}
                    </Box>

                    <Typography
                        sx={{
                            fontSize: 13,
                            color: 'text.secondary',
                        }}
                    >
                        Seçilen döneme ait performans verileri
                    </Typography>
                </Box>

                {/* Performans sıralaması */}
                <Box>
                    <Box
                        sx={{
                            px: { xs: 2.5, md: 3 },
                            py: 2.5,
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 800,
                            }}
                        >
                            Performans Sıralaması
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{
                                mt: 0.5,
                                fontSize: 14,
                            }}
                        >
                            Çalışanların seçilen dönemdeki performans sonuçları.
                        </Typography>
                    </Box>

                    {loadingRankings ? (
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                py: 5,
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    ) : rankings.length === 0 ? (
                        <Box
                            sx={{
                                px: 3,
                                py: 4,
                            }}
                        >
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
                                    gridTemplateColumns:
                                        '70px 1.5fr 1fr 1fr 120px',
                                    alignItems: 'center',
                                    gap: 2,
                                    px: 3,
                                    py: 1.5,
                                    minWidth: 700,
                                    bgcolor: 'action.hover',
                                    borderTop: '1px solid',
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: 12,
                                        fontWeight: 800,
                                        color: 'text.secondary',
                                    }}
                                >
                                    SIRA
                                </Typography>

                                <Typography
                                    sx={{
                                        fontSize: 12,
                                        fontWeight: 800,
                                        color: 'text.secondary',
                                    }}
                                >
                                    ÇALIŞAN
                                </Typography>

                                <Typography
                                    sx={{
                                        fontSize: 12,
                                        fontWeight: 800,
                                        color: 'text.secondary',
                                    }}
                                >
                                    DEPARTMAN
                                </Typography>

                                <Typography
                                    sx={{
                                        fontSize: 12,
                                        fontWeight: 800,
                                        color: 'text.secondary',
                                    }}
                                >
                                    DEĞERLENDİRME
                                </Typography>

                                <Typography
                                    sx={{
                                        fontSize: 12,
                                        fontWeight: 800,
                                        color: 'text.secondary',
                                        textAlign: 'right',
                                    }}
                                >
                                    ORTALAMA
                                </Typography>
                            </Box>

                            {rankings.map((item) => (
                                <Box
                                    key={item.employeeId}
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns:
                                            '70px 1.5fr 1fr 1fr 120px',
                                        alignItems: 'center',
                                        gap: 2,
                                        px: 3,
                                        py: 2,
                                        minWidth: 700,
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',

                                        '&:last-child': {
                                            borderBottom: 'none',
                                        },
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontWeight: 800,
                                        }}
                                    >
                                        #{item.rank}
                                    </Typography>

                                    <Box>
                                        <Typography
                                            sx={{
                                                fontWeight: 700,
                                            }}
                                        >
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

                                    <Typography
                                        sx={{
                                            fontSize: 14,
                                        }}
                                    >
                                        {item.departmentName}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: 14,
                                        }}
                                    >
                                        {item.evaluationCount}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontWeight: 800,
                                            textAlign: 'right',
                                        }}
                                    >
                                        {item.averageScore.toFixed(2)} / 5
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
            </Paper>
        </Box>
    )
}