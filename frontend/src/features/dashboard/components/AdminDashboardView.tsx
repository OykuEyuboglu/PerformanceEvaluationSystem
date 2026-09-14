import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'

import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    MenuItem,
    Paper,
    TextField,
    Typography,
} from '@mui/material'

import {
    ArrowForward,
    Assessment,
    EmojiEvents,
    FileDownload,
    Groups,
    TrendingUp,
    WorkspacePremium,
} from '@mui/icons-material'

import { useAuthStore } from '../../../store/authStore'

import { getEvaluationPeriods } from '../../evaluationPeriods/evaluationPeriodsApi'
import type { EvaluationPeriod } from '../../evaluationPeriods/types'

import {
    getDepartmentRanking,
    exportDepartmentRankingExcel,
    type EmployeeRanking,
} from '../dashboardApi'

import { useLanguage } from '../../../shared/i18n/LanguageContext'
import { translations } from '../../../shared/i18n/translations'

const RANK_COLORS: Record<number, string> = {
    1: '#F5B301',
    2: '#B0B0B0',
    3: '#B87333',
}

export default function AdminDashboardView() {
    const user = useAuthStore((s) => s.user)

    const { language } = useLanguage()
    const t = translations[language]

    const isTurkish = language === 'tr'

    const [periods, setPeriods] =
        useState<EvaluationPeriod[]>([])

    const [selectedPeriodId, setSelectedPeriodId] =
        useState<number | ''>('')

    const [rankings, setRankings] =
        useState<EmployeeRanking[]>([])

    const [loadingPeriods, setLoadingPeriods] =
        useState(true)

    const [loadingRankings, setLoadingRankings] =
        useState(false)

    const [exporting, setExporting] =
        useState(false)

    /* ---------------------------------------------------------------------- */
    /* PAGE ANIMATION                                                         */
    /* ---------------------------------------------------------------------- */

    const [animationProgress, setAnimationProgress] =
        useState(0)

    useEffect(() => {
        let frameId = 0
        const startTime = performance.now()
        const duration = 900

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime

            const progress = Math.min(
                elapsed / duration,
                1
            )

            const easedProgress =
                1 - Math.pow(1 - progress, 3)

            setAnimationProgress(easedProgress)

            if (progress < 1) {
                frameId =
                    requestAnimationFrame(animate)
            }
        }

        frameId =
            requestAnimationFrame(animate)

        return () =>
            cancelAnimationFrame(frameId)
    }, [selectedPeriodId, rankings])

    useEffect(() => {
        const loadPeriods = async () => {
            try {
                const data =
                    await getEvaluationPeriods()

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
                const data =
                    await getDepartmentRanking(
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

    const handleExport = async () => {
        if (selectedPeriodId === '') return

        setExporting(true)

        try {
            await exportDepartmentRankingExcel(
                selectedPeriodId
            )
        } catch (error) {
            console.error(
                'Excel dışa aktarma başarısız:',
                error
            )
        } finally {
            setExporting(false)
        }
    }

    const selectedPeriod = periods.find(
        (period) =>
            period.id === selectedPeriodId
    )

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString(
            isTurkish ? 'tr-TR' : 'en-US',
            {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            }
        )

    /* ---------------------------------------------------------------------- */
    /* DASHBOARD STATS                                                        */
    /* ---------------------------------------------------------------------- */

    const dashboardStats = useMemo(() => {
        if (rankings.length === 0) {
            return {
                employeeCount: 0,
                evaluationCount: 0,
                averageScore: 0,
                highestScore: 0,
            }
        }

        const evaluationCount = rankings.reduce(
            (total, item) =>
                total + item.evaluationCount,
            0
        )

        const weightedTotal = rankings.reduce(
            (total, item) =>
                total +
                item.averageScore *
                item.evaluationCount,
            0
        )

        const averageScore =
            evaluationCount > 0
                ? weightedTotal / evaluationCount
                : 0

        const highestScore = Math.max(
            ...rankings.map(
                (item) => item.averageScore
            )
        )

        return {
            employeeCount: rankings.length,
            evaluationCount,
            averageScore,
            highestScore,
        }
    }, [rankings])

    const topPerformers = useMemo(
        () => rankings.slice(0, 5),
        [rankings]
    )

    /* ---------------------------------------------------------------------- */
    /* ANIMATED VALUES                                                        */
    /* ---------------------------------------------------------------------- */

    const animatedEmployeeCount = Math.round(
        dashboardStats.employeeCount *
        animationProgress
    )

    const animatedEvaluationCount = Math.round(
        dashboardStats.evaluationCount *
        animationProgress
    )

    const animatedAverage =
        dashboardStats.averageScore *
        animationProgress

    const animatedHighest =
        dashboardStats.highestScore *
        animationProgress

    const getScoreLabel = (score: number) => {
        if (score >= 4.5) {
            return isTurkish
                ? 'Mükemmel'
                : 'Excellent'
        }

        if (score >= 4) {
            return isTurkish
                ? 'Çok İyi'
                : 'Very Good'
        }

        if (score >= 3) {
            return isTurkish
                ? 'İyi'
                : 'Good'
        }

        if (score >= 2) {
            return isTurkish
                ? 'Geliştirilmeli'
                : 'Needs Improvement'
        }

        return isTurkish
            ? 'Kritik'
            : 'Critical'
    }

    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: 1600,
                mx: 'auto',
            }}
        >
            {/* ================================================================== */}
            {/* HERO                                                               */}
            {/* ================================================================== */}

            <Paper
                elevation={0}
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 4,
                    mb: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    background:
                        'linear-gradient(135deg, rgba(245,179,1,0.14) 0%, rgba(245,179,1,0.035) 48%, transparent 100%)',

                    opacity: 0,
                    animation:
                        'heroEnter 700ms ease-out forwards',

                    '@keyframes heroEnter': {
                        from: {
                            opacity: 0,
                            transform:
                                'translateY(14px)',
                        },
                        to: {
                            opacity: 1,
                            transform:
                                'translateY(0)',
                        },
                    },
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        width: 260,
                        height: 260,
                        borderRadius: '50%',
                        background:
                            'rgba(245,179,1,0.09)',
                        right: -100,
                        top: -140,
                    }}
                />

                <Box
                    sx={{
                        position: 'relative',
                        p: {
                            xs: 2.5,
                            sm: 3,
                            md: 4,
                        },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent:
                            'space-between',
                        gap: 3,
                        flexWrap: 'wrap',
                    }}
                >
                    <Box>
                        <Typography
                            sx={{
                                fontSize: {
                                    xs: 12,
                                    md: 13,
                                },
                                fontWeight: 700,
                                color: '#C68E00',
                                letterSpacing: 1.2,
                                textTransform:
                                    'uppercase',
                                mb: 0.8,
                            }}
                        >
                            {isTurkish
                                ? 'Yönetim Paneli'
                                : 'Administration'}
                        </Typography>

                        <Typography
                            sx={{
                                fontSize: {
                                    xs: 24,
                                    sm: 28,
                                    md: 32,
                                },
                                fontWeight: 850,
                                letterSpacing:
                                    '-0.8px',
                                lineHeight: 1.15,
                            }}
                        >
                            {t.dashboard.welcome},{' '}
                            {user?.firstName}
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{
                                mt: 1,
                                fontSize: {
                                    xs: 13,
                                    md: 14,
                                },
                                maxWidth: 600,
                                lineHeight: 1.6,
                            }}
                        >
                            {isTurkish
                                ? 'Performans değerlendirme süreçlerini ve kurum genelindeki sonuçları tek bir ekrandan takip edin.'
                                : 'Monitor performance evaluation processes and organization-wide results from a single dashboard.'}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            flexWrap: 'wrap',
                        }}
                    >
                        {loadingPeriods ? (
                            <CircularProgress size={24} />
                        ) : (
                            <>
                                <TextField
                                    select
                                    size="small"
                                    value={
                                        selectedPeriodId
                                    }
                                    onChange={(e) =>
                                        setSelectedPeriodId(
                                            Number(
                                                e.target
                                                    .value
                                            )
                                        )
                                    }
                                    label={
                                        isTurkish
                                            ? 'Değerlendirme Dönemi'
                                            : 'Evaluation Period'
                                    }
                                    sx={{
                                        width: {
                                            xs: '100%',
                                            sm: 400,
                                        },
                                        '& .MuiOutlinedInput-root':
                                        {
                                            borderRadius: 2,
                                            bgcolor:
                                                'background.paper',
                                        },
                                    }}
                                >
                                    {periods.map(
                                        (period) => (
                                            <MenuItem
                                                key={
                                                    period.id
                                                }
                                                value={
                                                    period.id
                                                }
                                            >
                                                {
                                                    period.name
                                                }
                                            </MenuItem>
                                        )
                                    )}
                                </TextField>

                                <Button
                                    variant="contained"
                                    size="medium"
                                    startIcon={
                                        <FileDownload />
                                    }
                                    disabled={
                                        exporting ||
                                        selectedPeriodId ===
                                        ''
                                    }
                                    onClick={
                                        handleExport
                                    }
                                    sx={{
                                        minHeight: 40,
                                        px: 2,
                                        borderRadius: 2,
                                        bgcolor:
                                            '#F5B301',
                                        color: '#111111',
                                        fontWeight: 700,
                                        boxShadow:
                                            'none',
                                        transition:
                                            'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor:
                                                '#E0A300',
                                            transform:
                                                'translateY(-1px)',
                                            boxShadow:
                                                '0 6px 18px rgba(245,179,1,0.22)',
                                        },
                                        '&:active': {
                                            transform:
                                                'translateY(0)',
                                        },
                                    }}
                                >
                                    {exporting
                                        ? isTurkish
                                            ? 'Aktarılıyor...'
                                            : 'Exporting...'
                                        : isTurkish
                                            ? "Excel'e Aktar"
                                            : 'Export Excel'}
                                </Button>
                            </>
                        )}
                    </Box>
                </Box>
            </Paper>

            {/* ================================================================== */}
            {/* PERIOD STATUS                                                      */}
            {/* ================================================================== */}

            {selectedPeriod && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2.5,

                        opacity: 0,
                        animation:
                            'fadeUp 500ms ease-out 250ms forwards',

                        '@keyframes fadeUp': {
                            from: {
                                opacity: 0,
                                transform:
                                    'translateY(8px)',
                            },
                            to: {
                                opacity: 1,
                                transform:
                                    'translateY(0)',
                            },
                        },
                    }}
                >
                    <Box
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: '#F5B301',
                            boxShadow:
                                '0 0 0 4px rgba(245,179,1,0.12)',
                        }}
                    />

                    <Typography
                        sx={{
                            fontSize: 12.5,
                            color: 'text.secondary',
                        }}
                    >
                        {selectedPeriod.name}
                        {' · '}
                        {formatDate(
                            selectedPeriod.startDate
                        )}
                        {' — '}
                        {formatDate(
                            selectedPeriod.endDate
                        )}
                    </Typography>
                </Box>
            )}

            {/* ================================================================== */}
            {/* KPI CARDS                                                           */}
            {/* ================================================================== */}

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        lg: 'repeat(4, 1fr)',
                    },
                    gap: 2,
                    mb: 3,
                }}
            >
                <StatCard
                    icon={<Groups />}
                    title={
                        isTurkish
                            ? 'Değerlendirilen Çalışan'
                            : 'Evaluated Employees'
                    }
                    value={animatedEmployeeCount}
                    description={
                        isTurkish
                            ? 'Seçili dönemde'
                            : 'In selected period'
                    }
                    animationDelay={350}
                />

                <StatCard
                    icon={<Assessment />}
                    title={
                        isTurkish
                            ? 'Toplam Değerlendirme'
                            : 'Total Evaluations'
                    }
                    value={
                        animatedEvaluationCount
                    }
                    description={
                        isTurkish
                            ? 'Tamamlanan değerlendirmeler'
                            : 'Completed evaluations'
                    }
                    animationDelay={430}
                />

                <StatCard
                    icon={<TrendingUp />}
                    title={
                        isTurkish
                            ? 'Genel Ortalama'
                            : 'Overall Average'
                    }
                    value={animatedAverage.toFixed(
                        2
                    )}
                    suffix="/ 5"
                    description={
                        isTurkish
                            ? 'Kurum performans ortalaması'
                            : 'Overall performance average'
                    }
                    animationDelay={510}
                />

                <StatCard
                    icon={<WorkspacePremium />}
                    title={
                        isTurkish
                            ? 'En Yüksek Performans'
                            : 'Highest Performance'
                    }
                    value={animatedHighest.toFixed(
                        2
                    )}
                    suffix="/ 5"
                    description={
                        getScoreLabel(
                            dashboardStats.highestScore
                        )
                    }
                    animationDelay={590}
                />
            </Box>

            {/* ================================================================== */}
            {/* MAIN CONTENT                                                        */}
            {/* ================================================================== */}

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        lg: 'minmax(0, 1.55fr) minmax(320px, 0.85fr)',
                    },
                    gap: 2.5,
                    alignItems: 'stretch',
                }}
            >
                {/* ============================================================== */}
                {/* RANKING                                                         */}
                {/* ============================================================== */}

                <Paper
                    elevation={0}
                    sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 3,
                        overflow: 'hidden',

                        opacity: 0,
                        animation:
                            'contentEnter 650ms ease-out 450ms forwards',

                        '@keyframes contentEnter': {
                            from: {
                                opacity: 0,
                                transform:
                                    'translateY(14px)',
                            },
                            to: {
                                opacity: 1,
                                transform:
                                    'translateY(0)',
                            },
                        },
                    }}
                >
                    <Box
                        sx={{
                            px: {
                                xs: 2,
                                md: 2.5,
                            },
                            py: 2,
                            display: 'flex',
                            justifyContent:
                                'space-between',
                            alignItems: 'center',
                            gap: 2,
                            borderBottom:
                                '1px solid',
                            borderColor:
                                'divider',
                        }}
                    >
                        <Box>
                            <Typography
                                sx={{
                                    fontWeight: 800,
                                    fontSize: 16,
                                }}
                            >
                                {isTurkish
                                    ? 'Performans Özeti'
                                    : 'Performance Overview'}
                            </Typography>

                            <Typography
                                color="text.secondary"
                                sx={{
                                    mt: 0.35,
                                    fontSize: 12,
                                }}
                            >
                                {isTurkish
                                    ? 'Seçili dönemin en yüksek performans gösteren çalışanları.'
                                    : 'Top performing employees in the selected period.'}
                            </Typography>
                        </Box>

                        <Button
                            component={RouterLink}
                            to={`/evaluations?periodId=${selectedPeriodId}`}
                            endIcon={
                                <ArrowForward />
                            }
                            size="small"
                            sx={{
                                color: 'text.primary',
                                fontWeight: 700,
                                whiteSpace:
                                    'nowrap',
                                transition:
                                    'all 0.2s ease',
                                '&:hover': {
                                    bgcolor:
                                        'rgba(245,179,1,0.08)',
                                    transform:
                                        'translateX(2px)',
                                },
                            }}
                        >
                            {isTurkish
                                ? 'Tümünü Gör'
                                : 'View All'}
                        </Button>
                    </Box>

                    {loadingRankings ? (
                        <Box
                            sx={{
                                minHeight: 360,
                                display: 'flex',
                                alignItems:
                                    'center',
                                justifyContent:
                                    'center',
                            }}
                        >
                            <CircularProgress
                                size={30}
                            />
                        </Box>
                    ) : topPerformers.length ===
                        0 ? (
                        <Box
                            sx={{
                                minHeight: 360,
                                display: 'flex',
                                flexDirection:
                                    'column',
                                alignItems:
                                    'center',
                                justifyContent:
                                    'center',
                                px: 3,
                                textAlign:
                                    'center',
                            }}
                        >
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 2.5,
                                    display: 'flex',
                                    alignItems:
                                        'center',
                                    justifyContent:
                                        'center',
                                    bgcolor:
                                        'rgba(245,179,1,0.10)',
                                    color: '#C68E00',
                                    mb: 1.5,
                                }}
                            >
                                <Assessment />
                            </Box>

                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    fontSize: 14,
                                }}
                            >
                                {isTurkish
                                    ? 'Henüz değerlendirme verisi yok'
                                    : 'No evaluation data yet'}
                            </Typography>

                            <Typography
                                color="text.secondary"
                                sx={{
                                    fontSize: 12,
                                    mt: 0.5,
                                }}
                            >
                                {isTurkish
                                    ? 'Seçili dönem için sonuçlar oluştuğunda burada görünecek.'
                                    : 'Results for the selected period will appear here.'}
                            </Typography>
                        </Box>
                    ) : (
                        <Box>
                            {topPerformers.map(
                                (item, index) => {
                                    const rank =
                                        index + 1

                                    const rankColor =
                                        RANK_COLORS[
                                        rank
                                        ]

                                    return (
                                        <Box
                                            key={
                                                item.employeeId
                                            }
                                            sx={{
                                                display:
                                                    'flex',
                                                alignItems:
                                                    'center',
                                                gap: 1.5,
                                                px: {
                                                    xs: 2,
                                                    md: 2.5,
                                                },
                                                py: 1.65,
                                                borderBottom:
                                                    index <
                                                        topPerformers.length -
                                                        1
                                                        ? '1px solid'
                                                        : 'none',
                                                borderColor:
                                                    'divider',

                                                opacity: 0,
                                                animation:
                                                    'rankingEnter 500ms ease-out forwards',
                                                animationDelay:
                                                    `${650 + index * 90}ms`,

                                                '@keyframes rankingEnter':
                                                {
                                                    from: {
                                                        opacity: 0,
                                                        transform:
                                                            'translateX(-14px)',
                                                    },
                                                    to: {
                                                        opacity: 1,
                                                        transform:
                                                            'translateX(0)',
                                                    },
                                                },

                                                transition:
                                                    'background-color 0.15s ease, transform 0.15s ease',

                                                '&:hover':
                                                {
                                                    bgcolor:
                                                        'action.hover',
                                                },
                                            }}
                                        >
                                            {/* RANK */}
                                            <Box
                                                sx={{
                                                    width: 34,
                                                    flexShrink: 0,
                                                    display:
                                                        'flex',
                                                    justifyContent:
                                                        'center',
                                                }}
                                            >
                                                {rank <=
                                                    3 ? (
                                                    <EmojiEvents
                                                        sx={{
                                                            fontSize: 21,
                                                            color: rankColor,
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography
                                                        sx={{
                                                            fontWeight: 800,
                                                            fontSize: 13,
                                                            color: 'text.secondary',
                                                        }}
                                                    >
                                                        #
                                                        {
                                                            rank
                                                        }
                                                    </Typography>
                                                )}
                                            </Box>

                                            {/* AVATAR */}
                                            <Avatar
                                                sx={{
                                                    width: 38,
                                                    height: 38,
                                                    bgcolor:
                                                        rank ===
                                                            1
                                                            ? '#F5B301'
                                                            : 'action.selected',
                                                    color:
                                                        rank ===
                                                            1
                                                            ? '#111'
                                                            : 'text.primary',
                                                    fontSize: 13,
                                                    fontWeight: 800,
                                                    transition:
                                                        'transform 0.2s ease',
                                                    '.MuiBox-root:hover &':
                                                    {
                                                        transform:
                                                            'scale(1.05)',
                                                    },
                                                }}
                                            >
                                                {item.employeeName
                                                    .split(
                                                        ' '
                                                    )
                                                    .map(
                                                        (
                                                            part
                                                        ) =>
                                                            part[0]
                                                    )
                                                    .slice(
                                                        0,
                                                        2
                                                    )
                                                    .join(
                                                        ''
                                                    )
                                                    .toUpperCase()}
                                            </Avatar>

                                            {/* EMPLOYEE */}
                                            <Box
                                                sx={{
                                                    minWidth: 0,
                                                    flex: 1,
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontWeight: 700,
                                                        fontSize: 13.5,
                                                        overflow:
                                                            'hidden',
                                                        textOverflow:
                                                            'ellipsis',
                                                        whiteSpace:
                                                            'nowrap',
                                                    }}
                                                >
                                                    {
                                                        item.employeeName
                                                    }
                                                </Typography>

                                                <Typography
                                                    color="text.secondary"
                                                    sx={{
                                                        fontSize: 11.5,
                                                        mt: 0.2,
                                                        overflow:
                                                            'hidden',
                                                        textOverflow:
                                                            'ellipsis',
                                                        whiteSpace:
                                                            'nowrap',
                                                    }}
                                                >
                                                    {
                                                        item.jobPositionName
                                                    }
                                                </Typography>
                                            </Box>

                                            {/* SCORE */}
                                            <Box
                                                sx={{
                                                    textAlign:
                                                        'right',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontWeight: 850,
                                                        fontSize: 15,
                                                    }}
                                                >
                                                    {item.averageScore.toFixed(
                                                        2
                                                    )}
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            fontSize: 10,
                                                            color: 'text.secondary',
                                                            fontWeight: 600,
                                                            ml: 0.3,
                                                        }}
                                                    >
                                                        / 5
                                                    </Box>
                                                </Typography>

                                                <Typography
                                                    color="text.secondary"
                                                    sx={{
                                                        fontSize: 10,
                                                    }}
                                                >
                                                    {
                                                        item.evaluationCount
                                                    }{' '}
                                                    {isTurkish
                                                        ? 'değerlendirme'
                                                        : 'evaluations'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )
                                }
                            )}
                        </Box>
                    )}
                </Paper>

                {/* ============================================================== */}
                {/* PERIOD INSIGHT                                                 */}
                {/* ============================================================== */}

                <Paper
                    elevation={0}
                    sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 3,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection:
                            'column',

                        opacity: 0,
                        animation:
                            'periodEnter 650ms ease-out 550ms forwards',

                        '@keyframes periodEnter': {
                            from: {
                                opacity: 0,
                                transform:
                                    'translateX(14px)',
                            },
                            to: {
                                opacity: 1,
                                transform:
                                    'translateX(0)',
                            },
                        },
                    }}
                >
                    <Box
                        sx={{
                            px: 2.5,
                            py: 2,
                            borderBottom:
                                '1px solid',
                            borderColor:
                                'divider',
                        }}
                    >
                        <Typography
                            sx={{
                                fontWeight: 800,
                                fontSize: 16,
                            }}
                        >
                            {isTurkish
                                ? 'Dönem Özeti'
                                : 'Period Summary'}
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{
                                mt: 0.35,
                                fontSize: 12,
                            }}
                        >
                            {isTurkish
                                ? 'Seçili değerlendirme döneminin genel görünümü.'
                                : 'Overview of the selected evaluation period.'}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            p: 2.5,
                            flex: 1,
                            display: 'flex',
                            flexDirection:
                                'column',
                        }}
                    >
                        {/* SCORE */}
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 2.5,
                                bgcolor:
                                    'rgba(245,179,1,0.08)',
                                border: '1px solid',
                                borderColor:
                                    'rgba(245,179,1,0.20)',
                                mb: 2,

                                animation:
                                    'scoreReveal 700ms ease-out 750ms both',

                                '@keyframes scoreReveal':
                                {
                                    from: {
                                        opacity: 0,
                                        transform:
                                            'scale(0.97)',
                                    },
                                    to: {
                                        opacity: 1,
                                        transform:
                                            'scale(1)',
                                    },
                                },
                            }}
                        >
                            <Typography
                                color="text.secondary"
                                sx={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    textTransform:
                                        'uppercase',
                                    letterSpacing: 0.7,
                                }}
                            >
                                {isTurkish
                                    ? 'Genel Performans'
                                    : 'Overall Performance'}
                            </Typography>

                            <Box
                                sx={{
                                    display:
                                        'flex',
                                    alignItems:
                                        'baseline',
                                    gap: 0.5,
                                    mt: 0.5,
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: 38,
                                        fontWeight: 850,
                                        letterSpacing:
                                            '-1px',
                                        lineHeight: 1,
                                    }}
                                >
                                    {animatedAverage.toFixed(
                                        2
                                    )}
                                </Typography>

                                <Typography
                                    color="text.secondary"
                                    sx={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                    }}
                                >
                                    / 5
                                </Typography>
                            </Box>

                            <Typography
                                sx={{
                                    mt: 0.8,
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: '#C68E00',
                                }}
                            >
                                {getScoreLabel(
                                    dashboardStats.averageScore
                                )}
                            </Typography>
                        </Box>

                        <InfoRow
                            label={
                                isTurkish
                                    ? 'Değerlendirme Dönemi'
                                    : 'Evaluation Period'
                            }
                            value={
                                selectedPeriod
                                    ?.name ??
                                '-'
                            }
                        />

                        <InfoRow
                            label={
                                isTurkish
                                    ? 'Başlangıç'
                                    : 'Start Date'
                            }
                            value={
                                selectedPeriod
                                    ? formatDate(
                                        selectedPeriod.startDate
                                    )
                                    : '-'
                            }
                        />

                        <InfoRow
                            label={
                                isTurkish
                                    ? 'Bitiş'
                                    : 'End Date'
                            }
                            value={
                                selectedPeriod
                                    ? formatDate(
                                        selectedPeriod.endDate
                                    )
                                    : '-'
                            }
                        />

                        <InfoRow
                            label={
                                isTurkish
                                    ? 'Çalışan'
                                    : 'Employees'
                            }
                            value={`${animatedEmployeeCount}`}
                        />

                        <Box
                            sx={{
                                mt: 'auto',
                                pt: 2,
                            }}
                        >
                            <Button
                                component={
                                    RouterLink
                                }
                                to={`/evaluations?periodId=${selectedPeriodId}`}
                                fullWidth
                                variant="outlined"
                                endIcon={
                                    <ArrowForward />
                                }
                                sx={{
                                    minHeight: 42,
                                    borderRadius: 2,
                                    fontWeight: 700,
                                    borderColor:
                                        'divider',
                                    color: 'text.primary',
                                    transition:
                                        'all 0.2s ease',
                                    '&:hover': {
                                        borderColor:
                                            '#F5B301',
                                        bgcolor:
                                            'rgba(245,179,1,0.06)',
                                        transform:
                                            'translateY(-1px)',
                                    },
                                }}
                            >
                                {isTurkish
                                    ? 'Detaylı Performans Raporu'
                                    : 'Detailed Performance Report'}
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Box>
    )
}

/* ========================================================================== */
/* STAT CARD                                                                  */
/* ========================================================================== */

interface StatCardProps {
    icon: React.ReactNode
    title: string
    value: string | number
    suffix?: string
    description: string
    animationDelay?: number
}

function StatCard({
    icon,
    title,
    value,
    suffix,
    description,
    animationDelay = 0,
}: StatCardProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                position: 'relative',
                overflow: 'hidden',
                p: 2.25,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,

                opacity: 0,
                animation:
                    'statCardEnter 600ms ease-out forwards',
                animationDelay: `${animationDelay}ms`,

                '@keyframes statCardEnter': {
                    from: {
                        opacity: 0,
                        transform:
                            'translateY(16px) scale(0.98)',
                    },
                    to: {
                        opacity: 1,
                        transform:
                            'translateY(0) scale(1)',
                    },
                },

                transition:
                    'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',

                '&:hover': {
                    transform:
                        'translateY(-3px)',
                    borderColor:
                        'rgba(245,179,1,0.45)',
                    boxShadow:
                        '0 10px 30px rgba(0,0,0,0.06)',
                },
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    right: -22,
                    top: -22,
                    width: 90,
                    height: 90,
                    borderRadius: '50%',
                    bgcolor:
                        'rgba(245,179,1,0.06)',
                    transition:
                        'transform 0.3s ease',
                    '.MuiPaper-root:hover &': {
                        transform: 'scale(1.25)',
                    },
                }}
            />

            <Box
                sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor:
                        'rgba(245,179,1,0.11)',
                    color: '#C68E00',
                    mb: 1.7,
                    transition:
                        'transform 0.2s ease',
                }}
            >
                {icon}
            </Box>

            <Typography
                color="text.secondary"
                sx={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    lineHeight: 1.3,
                }}
            >
                {title}
            </Typography>

            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 0.5,
                    mt: 0.45,
                }}
            >
                <Typography
                    sx={{
                        fontSize: 26,
                        fontWeight: 850,
                        letterSpacing:
                            '-0.5px',
                        fontVariantNumeric:
                            'tabular-nums',
                    }}
                >
                    {value}
                </Typography>

                {suffix && (
                    <Typography
                        color="text.secondary"
                        sx={{
                            fontSize: 11,
                            fontWeight: 700,
                        }}
                    >
                        {suffix}
                    </Typography>
                )}
            </Box>

            <Typography
                color="text.secondary"
                sx={{
                    fontSize: 10.5,
                    mt: 0.35,
                }}
            >
                {description}
            </Typography>
        </Paper>
    )
}

/* ========================================================================== */
/* INFO ROW                                                                   */
/* ========================================================================== */

interface InfoRowProps {
    label: string
    value: string
}

function InfoRow({
    label,
    value,
}: InfoRowProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                    'space-between',
                gap: 2,
                py: 1.15,
                borderBottom: '1px solid',
                borderColor:
                    'rgba(0,0,0,0.06)',
            }}
        >
            <Typography
                color="text.secondary"
                sx={{
                    fontSize: 11.5,
                    flexShrink: 0,
                }}
            >
                {label}
            </Typography>

            <Typography
                sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    textAlign: 'right',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
            >
                {value}
            </Typography>
        </Box>
    )
}