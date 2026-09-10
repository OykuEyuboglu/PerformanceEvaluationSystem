import { useEffect, useMemo, useState } from 'react'
import {
    Box,
    Typography,
    Paper,
    Button,
    CircularProgress,
    Chip,
    LinearProgress,
    MenuItem,
    TextField,
    Popover,
    Avatar,
    Divider,
    Tooltip,
} from '@mui/material'

import {
    EmojiEvents,
    ArrowForward,
    AssignmentTurnedIn,
    TrendingUp,
    RateReview,
    Groups,
    KeyboardArrowRight,
} from '@mui/icons-material'

import { Link as RouterLink } from 'react-router-dom'

import { useAuthStore } from '../../../store/authStore'

import { getEvaluationPeriods } from '../../evaluationPeriods/evaluationPeriodsApi'

import { getTeamByEvaluator } from '../../evaluatorEmployees/evaluatorEmployeesApi'

import {
    getTeamRanking,
    type EmployeeRanking,
} from '../dashboardApi'

import { getDefaultPeriod } from '../../../shared/utils/period'

import type { EvaluationPeriod } from '../../evaluationPeriods/types'

import type { EvaluatorEmployeeDto } from '../../evaluatorEmployees/types'


const RANK_COLORS: Record<number, string> = {
    1: '#F5B301',
    2: '#B0B0B0',
    3: '#B87333',
}


type EvaluatorDashboardViewProps = {
    firstName?: string
}


export default function EvaluatorDashboardView({
    firstName,
}: EvaluatorDashboardViewProps) {

    const currentUser = useAuthStore(
        (s) => s.user
    )


    const [periods, setPeriods] =
        useState<EvaluationPeriod[]>([])

    const [selectedPeriodId, setSelectedPeriodId] =
        useState<number | ''>('')

    const [team, setTeam] =
        useState<EvaluatorEmployeeDto[]>([])

    const [ranking, setRanking] =
        useState<EmployeeRanking[]>([])


    const [loading, setLoading] =
        useState(true)

    const [loadingRanking, setLoadingRanking] =
        useState(false)

    const pendingCount = Math.max(
        0,
        team.length - ranking.length
    )

    const [animatedCount, setAnimatedCount] = useState(0)
    const [animatedProgress, setAnimatedProgress] = useState(0)
    const [animatedPending, setAnimatedPending] = useState(0)
    const [animatedAverage, setAnimatedAverage] = useState(0)

    const [teamAnchorEl, setTeamAnchorEl] =
        useState<HTMLElement | null>(null)

    useEffect(() => {

        if (!currentUser) return


        const loadInitial = async () => {

            try {

                const [
                    periodsData,
                    teamData,
                ] = await Promise.all([
                    getEvaluationPeriods(),
                    getTeamByEvaluator(currentUser.id),
                ])


                setPeriods(periodsData)

                setTeam(teamData)


                /*
                 * Öncelik:
                 * 1. Aktif dönem
                 * 2. Son tamamlanan dönem
                 */
                const defaultPeriod =
                    getDefaultPeriod(periodsData)


                if (defaultPeriod) {
                    setSelectedPeriodId(
                        defaultPeriod.id
                    )
                }

            } catch {

                setPeriods([])

                setTeam([])

            } finally {

                setLoading(false)

            }
        }


        loadInitial()

    }, [currentUser])


    /*
     * Seçilen döneme ait takım sıralaması
     */
    useEffect(() => {

        if (selectedPeriodId === '') return


        const loadRanking = async () => {

            setLoadingRanking(true)


            try {

                const data =
                    await getTeamRanking(
                        selectedPeriodId
                    )

                setRanking(data)

            } catch {

                setRanking([])

            } finally {

                setLoadingRanking(false)

            }
        }


        loadRanking()

    }, [selectedPeriodId])


    /*
     * Seçili dönem
     */
    const selectedPeriod = useMemo(
        () =>
            periods.find(
                (period) =>
                    period.id ===
                    selectedPeriodId
            ),
        [
            periods,
            selectedPeriodId,
        ]
    )

    const teamAverage = useMemo(() => {

        if (ranking.length === 0) {
            return 0
        }


        return (
            ranking.reduce(
                (sum, item) =>
                    sum + item.averageScore,
                0
            ) / ranking.length
        )

    }, [ranking])

    /*
     * Tamamlanma oranı
     */
    const completionPercentage = useMemo(() => {

        if (team.length === 0) {
            return 0
        }


        return Math.min(
            (ranking.length / team.length) * 100,
            100
        )

    }, [
        ranking.length,
        team.length,
    ])

    useEffect(() => {
        const target = ranking.length

        if (target === 0) {
            setAnimatedCount(0)
            setAnimatedProgress(0)
            return
        }

        const duration = 650
        const startTime = performance.now()

        let animationFrame: number

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)

            const easedProgress =
                1 - Math.pow(1 - progress, 3)

            const currentCount = Math.round(
                target * easedProgress
            )

            const currentPercentage =
                team.length > 0
                    ? (currentCount / team.length) * 100
                    : 0

            setAnimatedCount(currentCount)
            setAnimatedProgress(currentPercentage)

            if (progress < 1) {
                animationFrame =
                    requestAnimationFrame(animate)
            }
        }

        animationFrame =
            requestAnimationFrame(animate)

        return () => {
            cancelAnimationFrame(animationFrame)
        }
    }, [ranking.length, team.length])

    useEffect(() => {
        const duration = 650
        const startTime = performance.now()

        const targetPending = pendingCount
        const targetAverage = teamAverage

        let animationFrame: number

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)

            const easedProgress =
                1 - Math.pow(1 - progress, 3)

            setAnimatedPending(
                Math.min(
                    targetPending,
                    Math.max(
                        0,
                        Math.round(targetPending * easedProgress)
                    )
                )
            )

            setAnimatedAverage(
                targetAverage * easedProgress
            )

            if (progress < 1) {
                animationFrame =
                    requestAnimationFrame(animate)
            }
        }

        animationFrame =
            requestAnimationFrame(animate)

        return () => {
            cancelAnimationFrame(animationFrame)
        }
    }, [
        ranking.length,
        pendingCount,
        teamAverage,
    ])

    const topPerformers = useMemo(
        () =>
            [...ranking]
                .sort(
                    (a, b) =>
                        a.rank - b.rank
                )
                .slice(0, 3),
        [ranking]
    )

    const periodStatus = useMemo(() => {

        if (!selectedPeriod) {
            return null
        }


        const today = new Date()

        const start =
            new Date(
                selectedPeriod.startDate
            )

        const end =
            new Date(
                selectedPeriod.endDate
            )


        today.setHours(0, 0, 0, 0)

        start.setHours(0, 0, 0, 0)

        end.setHours(0, 0, 0, 0)


        if (today < start) {

            return {
                label: 'Başlamadı',
                color: 'default' as const,
            }

        }


        if (today > end) {

            return {
                label: 'Tamamlandı',
                color: 'default' as const,
            }

        }


        return {
            label: 'Aktif',
            color: 'success' as const,
        }

    }, [selectedPeriod])


    const handleTeamMouseLeave = () => {

        setTeamAnchorEl(null)

    }


    const teamPopoverOpen =
        Boolean(teamAnchorEl)


    return (
        <Box
            sx={{
                width: '100%',
                minWidth: 0,
            }}
        >

            {/* =====================================================
                PAGE HEADER
            ===================================================== */}

            <Box
                sx={{
                    display: 'flex',
                    justifyContent:
                        'space-between',
                    alignItems: 'flex-end',
                    gap: 3,
                    mb: 3.5,
                    flexWrap: 'wrap',
                    minWidth: 0,
                }}
            >

                <Box sx={{ minWidth: 0 }}>

                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 800,
                            letterSpacing:
                                '-0.3px',
                        }}
                    >
                        Hoş geldin,{' '}
                        {firstName ||
                            'Değerlendirici'}{' '}
                        👋
                    </Typography>


                    <Typography
                        color="text.secondary"
                        sx={{
                            mt: 0.6,
                            fontSize: 14.5,
                        }}
                    >
                        Ekibinin performansını
                        takip et ve
                        değerlendirmelerini
                        yönet.
                    </Typography>

                </Box>


                {!loading &&
                    periods.length > 0 && (

                        <Box
                            sx={{
                                display: 'flex',
                                alignItems:
                                    'flex-end',
                                gap: 1,
                                flexShrink: 0,
                            }}
                        >

                            <Box>

                                <Typography
                                    sx={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color:
                                            'text.secondary',
                                        mb: 0.5,
                                        letterSpacing:
                                            0.4,
                                    }}
                                >
                                    DEĞERLENDİRME DÖNEMİ
                                </Typography>


                                <TextField
                                    select
                                    size="small"
                                    value={
                                        selectedPeriodId
                                    }
                                    onChange={(e) =>
                                        setSelectedPeriodId(
                                            Number(
                                                e.target.value
                                            )
                                        )
                                    }
                                    sx={{
                                        width: {
                                            xs: 210,
                                            sm: 250,
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

                            </Box>


                            {periodStatus?.label ===
                                'Aktif' && (

                                    <Chip
                                        label="Aktif"
                                        size="small"
                                        sx={{
                                            mb: 0.4,
                                            height: 28,
                                            fontWeight: 700,
                                            fontSize: 11,
                                            bgcolor:
                                                'rgba(46,125,50,0.10)',
                                            color:
                                                'success.main',
                                            border:
                                                '1px solid',
                                            borderColor:
                                                'rgba(46,125,50,0.20)',
                                        }}
                                    />

                                )}

                        </Box>

                    )}

            </Box>


            {/* =====================================================
                LOADING
            ===================================================== */}

            {loading ? (

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent:
                            'center',
                        py: 10,
                    }}
                >
                    <CircularProgress />
                </Box>

            ) : periods.length === 0 ? (

                <Paper
                    elevation={0}
                    sx={{
                        border: '1px solid',
                        borderColor:
                            'divider',
                        borderRadius: 3,
                        p: 5,
                        textAlign: 'center',
                    }}
                >

                    <Typography
                        sx={{
                            fontWeight: 700,
                            mb: 0.5,
                        }}
                    >
                        Henüz değerlendirme
                        dönemi bulunmuyor.
                    </Typography>


                    <Typography
                        color="text.secondary"
                        sx={{
                            fontSize: 14,
                        }}
                    >
                        Değerlendirme dönemi
                        oluşturulduğunda ekip
                        performansını buradan
                        takip edebilirsin.
                    </Typography>

                </Paper>

            ) : (

                <>

                    {/* =================================================
                        KPI CARDS
                    ================================================= */}

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: 'minmax(0, 1fr)',
                                sm:
                                    'repeat(2, minmax(0, 1fr))',
                                lg:
                                    'repeat(3, minmax(0, 1fr))',
                            },
                            gap: 2,
                            mb: 2.5,
                            width: '100%',
                            minWidth: 0,
                        }}
                    >

                        {/* -------------------------------------------------
                            DEĞERLENDİRME İLERLEMESİ
                        ------------------------------------------------- */}

                        <Paper
                            elevation={0}
                            sx={{
                                minWidth: 0,
                                width: '100%',
                                boxSizing:
                                    'border-box',
                                border: '1px solid',
                                borderColor:
                                    'divider',
                                borderRadius: 3,
                                p: 2.5,
                            }}
                        >

                            <Box
                                sx={{
                                    display:
                                        'flex',
                                    justifyContent:
                                        'space-between',
                                    alignItems:
                                        'flex-start',
                                    gap: 2,
                                }}
                            >

                                <Box
                                    sx={{
                                        minWidth: 0,
                                    }}
                                >

                                    <Typography
                                        sx={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color:
                                                'text.secondary',
                                            letterSpacing:
                                                0.5,
                                        }}
                                    >
                                        DEĞERLENDİRME
                                        İLERLEMESİ
                                    </Typography>


                                    <Typography
                                        sx={{
                                            fontSize: 28,
                                            fontWeight: 800,
                                            mt: 0.5,
                                            lineHeight: 1.1,
                                        }}
                                    >
                                                {animatedCount}

                                        <Typography
                                            component="span"
                                            color="text.secondary"
                                            sx={{
                                                fontSize: 14,
                                                fontWeight: 600,
                                                ml: 0.5,
                                            }}
                                        >
                                            / {team.length}
                                        </Typography>
                                    </Typography>

                                </Box>


                                <AssignmentTurnedIn
                                    sx={{
                                        color:
                                            'primary.main',
                                        fontSize: 27,
                                        flexShrink: 0,
                                    }}
                                />

                            </Box>


                            <LinearProgress
                                variant="determinate"
                                value={
                                    completionPercentage
                                }
                                sx={{
                                    mt: 1.5,
                                    height: 6,
                                    borderRadius: 3,
                                    bgcolor:
                                        'action.hover',
                                    '& .MuiLinearProgress-bar':
                                    {
                                        borderRadius: 3,
                                    },
                                }}
                            />


                            <Typography
                                color="text.secondary"
                                sx={{
                                    fontSize: 12,
                                    mt: 1,
                                }}
                            >
                                %{Math.round(
                                    completionPercentage
                                )}{' '}
                                tamamlandı
                            </Typography>

                        </Paper>


                        {/* -------------------------------------------------
                            EKİP ORTALAMASI
                        ------------------------------------------------- */}

                        <Paper
                            elevation={0}
                            sx={{
                                minWidth: 0,
                                width: '100%',
                                boxSizing:
                                    'border-box',
                                border: '1px solid',
                                borderColor:
                                    'divider',
                                borderRadius: 3,
                                p: 2.5,
                            }}
                        >

                            <Box
                                sx={{
                                    display:
                                        'flex',
                                    justifyContent:
                                        'space-between',
                                    alignItems:
                                        'flex-start',
                                    gap: 2,
                                }}
                            >

                                <Box
                                    sx={{
                                        minWidth: 0,
                                    }}
                                >

                                    <Typography
                                        sx={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color:
                                                'text.secondary',
                                            letterSpacing:
                                                0.5,
                                        }}
                                    >
                                        EKİP ORTALAMASI
                                    </Typography>


                                    <Typography
                                        sx={{
                                            fontSize: 28,
                                            fontWeight: 800,
                                            mt: 0.5,
                                            lineHeight: 1.1,
                                        }}
                                    >
                                                {teamAverage > 0
                                                    ? animatedAverage.toFixed(2)
                                                    : '—'}

                                        {teamAverage >
                                            0 && (

                                                <Typography
                                                    component="span"
                                                    color="text.secondary"
                                                    sx={{
                                                        fontSize: 14,
                                                        fontWeight: 600,
                                                        ml: 0.5,
                                                    }}
                                                >
                                                    / 5
                                                </Typography>

                                            )}

                                    </Typography>


                                    <Typography
                                        color="text.secondary"
                                        sx={{
                                            fontSize: 12.5,
                                            mt: 0.2,
                                        }}
                                    >
                                        Değerlendirilen
                                        çalışanlar
                                    </Typography>

                                </Box>


                                <TrendingUp
                                    sx={{
                                        color:
                                            'primary.main',
                                        fontSize: 27,
                                        flexShrink: 0,
                                    }}
                                />

                            </Box>

                        </Paper>


                        {/* -------------------------------------------------
                            BEKLEYEN DEĞERLENDİRMELER
                        ------------------------------------------------- */}

                        <Paper
                            elevation={0}
                            sx={{
                                minWidth: 0,
                                width: '100%',
                                boxSizing:
                                    'border-box',
                                border: '1px solid',
                                borderColor:
                                    'divider',
                                borderRadius: 3,
                                p: 2.5,
                            }}
                        >

                            <Box
                                sx={{
                                    display:
                                        'flex',
                                    justifyContent:
                                        'space-between',
                                    alignItems:
                                        'flex-start',
                                    gap: 2,
                                }}
                            >

                                <Box
                                    sx={{
                                        minWidth: 0,
                                    }}
                                >

                                    <Typography
                                        sx={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color:
                                                'text.secondary',
                                            letterSpacing:
                                                0.5,
                                        }}
                                    >
                                        BEKLEYEN
                                        DEĞERLENDİRMELER
                                    </Typography>


                                    <Typography
                                        sx={{
                                            fontSize: 28,
                                            fontWeight: 800,
                                            mt: 0.5,
                                            lineHeight: 1.1,
                                        }}
                                    >
                                                {animatedPending}
                                            </Typography>


                                    <Typography
                                        color="text.secondary"
                                        sx={{
                                            fontSize: 12.5,
                                            mt: 0.2,
                                        }}
                                    >
                                        Çalışan değerlendirme
                                        bekliyor
                                    </Typography>

                                </Box>


                                <RateReview
                                    sx={{
                                        color:
                                            'primary.main',
                                        fontSize: 27,
                                        flexShrink: 0,
                                    }}
                                />

                            </Box>

                        </Paper>

                    </Box>


                    {/* =================================================
                        STATUS + QUICK ACTIONS
                    ================================================= */}

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs:
                                    'minmax(0, 1fr)',
                                md:
                                    'minmax(0, 1.6fr) minmax(0, 1fr)',
                            },
                            gap: 2,
                            mb: 2.5,
                            width: '100%',
                            minWidth: 0,
                        }}
                    >

                        {/* =================================================
                            DEĞERLENDİRME DURUMU
                        ================================================= */}

                        <Paper
                            elevation={0}
                            sx={{
                                minWidth: 0,
                                width: '100%',
                                boxSizing: 'border-box',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 3,
                                p: { xs: 2, sm: 2.5, md: 3 },
                                overflow: 'hidden',
                            }}
                        >
                            {/* HEADER */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    gap: 2,
                                }}
                            >
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                        sx={{
                                            fontWeight: 800,
                                            fontSize: 15,
                                            lineHeight: 1.2,
                                        }}
                                    >
                                        Değerlendirme Durumu
                                    </Typography>

                                    <Typography
                                        color="text.secondary"
                                        sx={{
                                            fontSize: 12,
                                            mt: 0.4,
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        Bu dönemdeki değerlendirme sürecinin durumu.
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        bgcolor: 'rgba(245,179,1,0.12)',
                                        color: 'primary.main',
                                    }}
                                >
                                    <AssignmentTurnedIn
                                        sx={{
                                            fontSize: 18,
                                        }}
                                    />
                                </Box>
                            </Box>

                            {/* MAIN CONTENT */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: { xs: 2, sm: 3 },
                                    mt: 2,
                                    minWidth: 0,
                                }}
                            >
                                        <Box
                                            sx={{
                                                position: 'relative',
                                                width: { xs: 150, sm: 170 },
                                                height: { xs: 150, sm: 170 },
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Box
                                                component="svg"
                                                viewBox="0 0 120 120"
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    transform: 'rotate(-90deg)',
                                                }}
                                            >
                                                {/* ARKA PLAN HALKASI */}
                                                <Box
                                                    component="circle"
                                                    cx="60"
                                                    cy="60"
                                                    r="50"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="7"
                                                    sx={{
                                                        color: 'action.hover',
                                                    }}
                                                />

                                                {/* SARI İLERLEME HALKASI */}
                                                <Box
                                                    component="circle"
                                                    cx="60"
                                                    cy="60"
                                                    r="50"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="7"
                                                    strokeLinecap="round"
                                                    strokeDasharray={314.16}
                                                    strokeDashoffset={
                                                        314.16 -
                                                        (314.16 * animatedProgress) / 100
                                                    }
                                                    sx={{
                                                        color: 'primary.main',
                                                        transition:
                                                            'stroke-dashoffset 0.65s ease-out',
                                                    }}
                                                />
                                            </Box>

                                            {/* MERKEZ */}
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontSize: 19,
                                                        fontWeight: 800,
                                                        lineHeight: 1,
                                                    }}
                                                >
                                                    {animatedCount} / {team.length}
                                                </Typography>

                                                <Typography
                                                    color="text.secondary"
                                                    sx={{
                                                        fontSize: 10,
                                                        fontWeight: 600,
                                                        mt: 0.7,
                                                    }}
                                                >
                                                    %{Math.round(animatedProgress)}
                                                </Typography>
                                            </Box>
                                        </Box>

                                {/* STATUS DETAILS */}
                                <Box
                                    sx={{
                                        flex: 1,
                                        minWidth: 0,
                                    }}
                                >
                                    {/* COMPLETED */}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            mb: 1,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 9,
                                                height: 9,
                                                borderRadius: '50%',
                                                bgcolor: 'primary.main',
                                                flexShrink: 0,
                                            }}
                                        />

                                        <Typography
                                            sx={{
                                                fontSize: 13,
                                                fontWeight: 600,
                                                lineHeight: 1.3,
                                            }}
                                        >
                                                    {animatedCount} çalışan değerlendirildi
                                                </Typography>
                                    </Box>

                                    {/* PENDING */}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            mb: 1.25,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 9,
                                                height: 9,
                                                borderRadius: '50%',
                                                bgcolor: 'action.disabled',
                                                flexShrink: 0,
                                            }}
                                        />

                                        <Typography
                                            sx={{
                                                fontSize: 13,
                                                color: 'text.secondary',
                                                lineHeight: 1.3,
                                            }}
                                        >
                                            {pendingCount} çalışan değerlendirme bekliyor
                                        </Typography>
                                    </Box>

                                    <Divider sx={{ mb: 1 }} />

                                    {/* TOTAL */}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                        }}
                                    >
                                        <Groups
                                            sx={{
                                                fontSize: 15,
                                                color: 'text.secondary',
                                            }}
                                        />

                                        <Typography
                                            sx={{
                                                fontSize: 12,
                                                color: 'text.secondary',
                                                fontWeight: 600,
                                            }}
                                        >
                                            Toplam {team.length} çalışan
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* BOTTOM INFO */}
                            <Box
                                sx={{
                                    mt: 2,
                                    px: 1.5,
                                    py: 1,
                                    borderRadius: 1.5,
                                    bgcolor: 'rgba(245,179,1,0.08)',
                                    border: '1px solid',
                                    borderColor: 'rgba(245,179,1,0.16)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    minWidth: 0,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: '50%',
                                        bgcolor: 'primary.main',
                                        color: '#111',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        fontSize: 10,
                                        fontWeight: 900,
                                    }}
                                >
                                    !
                                </Box>

                                <Typography
                                    color="text.secondary"
                                    sx={{
                                        fontSize: 11,
                                        lineHeight: 1.35,
                                        minWidth: 0,
                                    }}
                                >
                                    {pendingCount > 0
                                        ? 'Tüm ekip değerlendirmelerini tamamlamak için devam edebilirsin.'
                                        : 'Tüm ekip değerlendirmeleri tamamlandı.'}
                                </Typography>
                            </Box>
                        </Paper>

                        {/* -------------------------------------------------
                            HIZLI İŞLEMLER
                        ------------------------------------------------- */}

                                <Paper
                                    elevation={0}
                                    sx={{
                                        minWidth: 0,
                                        width: '100%',
                                        height: '100%',
                                        boxSizing: 'border-box',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 3,
                                        p: 3,

                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',

                                        transition: 'all 0.2s ease',

                                        '&:hover': {
                                            borderColor: 'primary.main',
                                            boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
                                        },
                                    }}
                                >
                                    {/* ICON + TITLE */}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            mb: 0.8,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 42,
                                                height: 42,
                                                borderRadius: 2,
                                                bgcolor: 'rgba(245,179,1,0.12)',
                                                color: 'primary.main',

                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',

                                                flexShrink: 0,
                                            }}
                                        >
                                            <RateReview sx={{ fontSize: 21 }} />
                                        </Box>

                                        <Box>
                                            <Typography
                                                sx={{
                                                    fontWeight: 800,
                                                    fontSize: 16,
                                                    lineHeight: 1.2,
                                                }}
                                            >
                                                Hızlı İşlemler
                                            </Typography>

                                            <Typography
                                                color="text.secondary"
                                                sx={{
                                                    fontSize: 12,
                                                    mt: 0.4,
                                                }}
                                            >
                                                Ekip değerlendirmelerini yönet.
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* ACTIONS */}
                                    <Box sx={{ mt: 2.5 }}>
                                        <Button
                                            component={RouterLink}
                                            to="/evaluations/new"
                                            variant="contained"
                                            fullWidth
                                            startIcon={<RateReview />}
                                            sx={{
                                                minHeight: 44,
                                                borderRadius: 2,
                                                fontWeight: 700,

                                                boxShadow: 'none',

                                                '&:hover': {
                                                    boxShadow: 'none',
                                                },
                                            }}
                                        >
                                            Değerlendirme Yap
                                        </Button>

                                        <Button
                                            component={RouterLink}
                                            to="/reports/team-ranking"
                                            variant="outlined"
                                            fullWidth
                                            endIcon={<ArrowForward />}
                                            sx={{
                                                mt: 1,
                                                minHeight: 40,
                                                borderRadius: 2,
                                                fontWeight: 700,
                                            }}
                                        >
                                            Ekip Sıralamasını Gör
                                        </Button>
                                    </Box>
                                </Paper>

                    </Box>


                    {/* =================================================
                        TOP PERFORMERS
                    ================================================= */}

                    <Paper
                        elevation={0}
                        sx={{
                            width: '100%',
                            minWidth: 0,
                            boxSizing:
                                'border-box',
                            border: '1px solid',
                            borderColor:
                                'divider',
                            borderRadius: 3,
                            overflow: 'hidden',
                        }}
                    >

                        {/* HEADER */}

                        <Box
                            sx={{
                                px: {
                                    xs: 2,
                                    md: 3,
                                },
                                py: 2.25,
                                display:
                                    'flex',
                                justifyContent:
                                    'space-between',
                                alignItems:
                                    'center',
                                gap: 2,
                                borderBottom:
                                    '1px solid',
                                borderColor:
                                    'divider',
                                minWidth: 0,
                            }}
                        >

                            <Box
                                sx={{
                                    minWidth: 0,
                                }}
                            >

                                <Typography
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: 16,
                                    }}
                                >
                                    En Yüksek
                                    Performanslar
                                </Typography>


                                <Typography
                                    color="text.secondary"
                                    sx={{
                                        fontSize: 13,
                                        mt: 0.35,
                                    }}
                                >
                                    Seçilen dönemde
                                    en yüksek
                                    performans
                                    skorlarına sahip
                                    çalışanlar.
                                </Typography>

                            </Box>


                            <Button
                                component={
                                    RouterLink
                                }
                                to="/reports/team-ranking"
                                size="small"
                                endIcon={
                                    <ArrowForward />
                                }
                                sx={{
                                    flexShrink: 0,
                                }}
                            >
                                Tümünü Gör
                            </Button>

                        </Box>


                        {/* CONTENT */}

                        {loadingRanking ? (

                            <Box
                                sx={{
                                    display:
                                        'flex',
                                    justifyContent:
                                        'center',
                                    py: 5,
                                }}
                            >
                                <CircularProgress
                                    size={26}
                                />
                            </Box>

                        ) : topPerformers.length ===
                            0 ? (

                            <Box sx={{ p: 4 }}>

                                <Typography
                                    color="text.secondary"
                                    sx={{
                                        fontSize: 14,
                                    }}
                                >
                                    Bu dönem için
                                    henüz
                                    değerlendirme
                                    sonucu
                                    bulunmuyor.
                                </Typography>

                            </Box>

                        ) : (

                            topPerformers.map(
                                (item) => (

                                    <Tooltip
                                        key={
                                            item.employeeId
                                        }
                                        arrow
                                        placement="left"
                                        enterDelay={300}
                                        title={
                                            <Box
                                                sx={{
                                                    py: 0.5,
                                                    minWidth: 210,
                                                    maxWidth: 260,
                                                }}
                                            >

                                                <Box
                                                    sx={{
                                                        display:
                                                            'flex',
                                                        alignItems:
                                                            'center',
                                                        gap: 1.25,
                                                    }}
                                                >

                                                    <Avatar
                                                        sx={{
                                                            width: 34,
                                                            height: 34,
                                                            fontSize: 13,
                                                            fontWeight: 700,
                                                            bgcolor:
                                                                'primary.main',
                                                            color:
                                                                '#111',
                                                        }}
                                                    >
                                                        {item.employeeName
                                                            .charAt(
                                                                0
                                                            )
                                                            .toUpperCase()}
                                                    </Avatar>


                                                    <Box
                                                        sx={{
                                                            minWidth: 0,
                                                        }}
                                                    >

                                                        <Typography
                                                            sx={{
                                                                fontSize: 13,
                                                                fontWeight: 700,
                                                                color: '#fff',
                                                            }}
                                                        >
                                                            {
                                                                item.employeeName
                                                            }
                                                        </Typography>


                                                        {item.jobPositionName && (

                                                            <Typography
                                                                sx={{
                                                                    fontSize: 11.5,
                                                                    color: 'rgba(255,255,255,0.70)',
                                                                    mt: 0.15,
                                                                }}
                                                            >
                                                                {
                                                                    item.jobPositionName
                                                                }
                                                            </Typography>

                                                        )}

                                                    </Box>

                                                </Box>


                                                <Divider
                                                    sx={{
                                                        my: 1,
                                                        borderColor:
                                                            'rgba(255,255,255,0.15)',
                                                    }}
                                                />


                                                {item.departmentName && (

                                                    <Box
                                                        sx={{
                                                            mb: 0.5,
                                                        }}
                                                    >

                                                        <Typography
                                                            sx={{
                                                                fontSize: 10,
                                                                fontWeight: 700,
                                                                color: 'rgba(255,255,255,0.55)',
                                                                textTransform: 'uppercase',
                                                            }}
                                                        >
                                                            Departman
                                                        </Typography>


                                                        <Typography
                                                            sx={{
                                                                fontSize: 12,
                                                                color: 'rgba(255,255,255,0.90)',
                                                            }}
                                                        >
                                                            {
                                                                item.departmentName
                                                            }
                                                        </Typography>

                                                    </Box>

                                                )}


                                                <Box
                                                    sx={{
                                                        display:
                                                            'flex',
                                                        justifyContent:
                                                            'space-between',
                                                        gap: 2,
                                                        mt: 0.75,
                                                    }}
                                                >

                                                    <Box>

                                                        <Typography
                                                            sx={{
                                                                fontSize: 10,
                                                                fontWeight: 700,
                                                                color: 'rgba(255,255,255,0.55)',
                                                                textTransform: 'uppercase',
                                                            }}
                                                        >
                                                            Ortalama
                                                        </Typography>


                                                        <Typography
                                                            sx={{
                                                                fontSize: 12,
                                                                color: 'rgba(255,255,255,0.90)',
                                                            }}
                                                        >
                                                            {item.averageScore.toFixed(
                                                                2
                                                            )}{' '}
                                                            / 5
                                                        </Typography>

                                                    </Box>


                                                    <Box>

                                                        <Typography
                                                            sx={{
                                                                fontSize: 10,
                                                                fontWeight: 700,
                                                                color: 'rgba(255,255,255,0.55)',
                                                                textTransform: 'uppercase',
                                                            }}
                                                        >
                                                            Değerlendirme
                                                        </Typography>


                                                        <Typography
                                                            sx={{
                                                                fontSize: 12,
                                                                color: 'rgba(255,255,255,0.90)',
                                                            }}
                                                        >
                                                            {
                                                                item.evaluationCount
                                                            }
                                                        </Typography>

                                                    </Box>

                                                </Box>

                                            </Box>
                                        }
                                    >

                                        <Box
                                            sx={{
                                                display:
                                                    'flex',
                                                alignItems:
                                                    'center',
                                                gap: 2,
                                                px: {
                                                    xs: 2,
                                                    md: 3,
                                                },
                                                py: 2,
                                                borderBottom:
                                                    '1px solid',
                                                borderColor:
                                                    'divider',
                                                cursor:
                                                    'default',
                                                minWidth: 0,
                                                transition:
                                                    'background-color 0.15s ease',
                                                '&:hover':
                                                {
                                                    bgcolor:
                                                        'action.hover',
                                                },
                                                '&:last-child':
                                                {
                                                    borderBottom:
                                                        'none',
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
                                                    alignItems:
                                                        'center',
                                                    justifyContent:
                                                        'center',
                                                }}
                                            >

                                                {item.rank <=
                                                    3 ? (

                                                    <EmojiEvents
                                                        sx={{
                                                            fontSize: 21,
                                                            color:
                                                                RANK_COLORS[
                                                                item.rank
                                                                ],
                                                        }}
                                                    />

                                                ) : (

                                                    <Typography
                                                        sx={{
                                                            fontWeight: 800,
                                                            color:
                                                                'text.secondary',
                                                        }}
                                                    >
                                                        #
                                                        {
                                                            item.rank
                                                        }
                                                    </Typography>

                                                )}

                                            </Box>


                                            {/* AVATAR */}

                                            <Avatar
                                                sx={{
                                                    width: 34,
                                                    height: 34,
                                                    flexShrink: 0,
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    bgcolor:
                                                        'secondary.main',
                                                    color:
                                                        '#fff',
                                                }}
                                            >
                                                {item.employeeName
                                                    .charAt(
                                                        0
                                                    )
                                                    .toUpperCase()}
                                            </Avatar>


                                            {/* EMPLOYEE */}

                                            <Box
                                                sx={{
                                                    flex: 1,
                                                    minWidth: 0,
                                                }}
                                            >

                                                <Typography
                                                    sx={{
                                                        fontWeight: 700,
                                                        fontSize: 14,
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


                                                {item.jobPositionName && (

                                                    <Typography
                                                        color="text.secondary"
                                                        sx={{
                                                            fontSize: 12.5,
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

                                                )}

                                            </Box>


                                            {/* SCORE */}

                                            <Chip
                                                size="small"
                                                label={`${item.averageScore.toFixed(
                                                    2
                                                )} / 5`}
                                                sx={{
                                                    fontWeight: 700,
                                                    borderRadius: 1.5,
                                                    flexShrink: 0,
                                                }}
                                            />

                                        </Box>

                                    </Tooltip>

                                )
                            )

                        )}

                    </Paper>


                    {/* =================================================
                        TEAM POPOVER
                    ================================================= */}

                    <Popover
                        open={
                            teamPopoverOpen
                        }
                        anchorEl={
                            teamAnchorEl
                        }
                        onClose={
                            handleTeamMouseLeave
                        }
                        disableRestoreFocus
                        disableScrollLock
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        slotProps={{
                            paper: {
                                onMouseEnter:
                                    () =>
                                        teamAnchorEl &&
                                        setTeamAnchorEl(
                                            teamAnchorEl
                                        ),
                                onMouseLeave:
                                    handleTeamMouseLeave,
                                sx: {
                                    mt: 1,
                                    width: 280,
                                    maxWidth:
                                        'calc(100vw - 32px)',
                                    borderRadius: 2.5,
                                    border:
                                        '1px solid',
                                    borderColor:
                                        'divider',
                                    boxShadow:
                                        '0 8px 30px rgba(0,0,0,0.12)',
                                },
                            },
                        }}
                    >

                        <Box
                            sx={{
                                px: 2,
                                py: 1.5,
                            }}
                        >

                            <Typography
                                sx={{
                                    fontWeight: 800,
                                    fontSize: 14,
                                }}
                            >
                                Ekip Üyeleri
                            </Typography>


                            <Typography
                                color="text.secondary"
                                sx={{
                                    fontSize: 11.5,
                                    mt: 0.25,
                                }}
                            >
                                {team.length} atanmış
                                çalışan
                            </Typography>

                        </Box>


                        <Divider />


                        <Box
                            sx={{
                                maxHeight: 300,
                                overflowY: 'auto',
                            }}
                        >

                            {team.map(
                                (member) => (

                                    <Box
                                        key={
                                            member.id
                                        }
                                        sx={{
                                            display:
                                                'flex',
                                            alignItems:
                                                'center',
                                            gap: 1.25,
                                            px: 2,
                                            py: 1,
                                            transition:
                                                'background-color 0.15s ease',
                                            '&:hover':
                                            {
                                                bgcolor:
                                                    'action.hover',
                                            },
                                        }}
                                    >

                                        <Avatar
                                            sx={{
                                                width: 30,
                                                height: 30,
                                                fontSize: 12,
                                                fontWeight: 700,
                                                bgcolor:
                                                    'secondary.main',
                                                color:
                                                    '#fff',
                                            }}
                                        >
                                            {member.employeeName
                                                .charAt(
                                                    0
                                                )
                                                .toUpperCase()}
                                        </Avatar>


                                        <Box
                                            sx={{
                                                minWidth: 0,
                                                flex: 1,
                                            }}
                                        >

                                            <Typography
                                                sx={{
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    overflow:
                                                        'hidden',
                                                    textOverflow:
                                                        'ellipsis',
                                                    whiteSpace:
                                                        'nowrap',
                                                }}
                                            >
                                                {
                                                    member.employeeName
                                                }
                                            </Typography>


                                            {member.employeeJobPositionName && (

                                                <Typography
                                                    color="text.secondary"
                                                    sx={{
                                                        fontSize: 11.5,
                                                        mt: 0.1,
                                                        overflow:
                                                            'hidden',
                                                        textOverflow:
                                                            'ellipsis',
                                                        whiteSpace:
                                                            'nowrap',
                                                    }}
                                                >
                                                    {
                                                        member.employeeJobPositionName
                                                    }
                                                </Typography>

                                            )}

                                        </Box>


                                        <KeyboardArrowRight
                                            sx={{
                                                fontSize: 18,
                                                color:
                                                    'text.disabled',
                                                flexShrink: 0,
                                            }}
                                        />

                                    </Box>

                                )
                            )}

                        </Box>

                    </Popover>

                </>

            )}

        </Box>
    )
}