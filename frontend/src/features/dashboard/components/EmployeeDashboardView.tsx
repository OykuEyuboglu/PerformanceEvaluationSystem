import { useEffect, useMemo, useState } from 'react'
import {
    Box,
    Typography,
    Paper,
    Button,
    CircularProgress,
    LinearProgress,
    Chip,
    Divider,
} from '@mui/material'
import {
    ArrowForward,
    TrendingUp,
    EmojiEvents,
    AssignmentTurnedIn,
    History,
    Insights,
} from '@mui/icons-material'
import { Link as RouterLink } from 'react-router-dom'

import { getMyEvaluations } from '../../evaluations/evaluationsApi'
import type { EvaluationDto } from '../../evaluations/types'

export default function EmployeeDashboardView({
    firstName,
}: {
    firstName?: string
}) {
    const [evaluations, setEvaluations] = useState<EvaluationDto[]>([])
    const [loading, setLoading] = useState(true)

    // Animated values
    const [animationProgress, setAnimationProgress] = useState(0)
    const [animatedScore, setAnimatedScore] = useState(0)
    const [animatedAverage, setAnimatedAverage] = useState(0)
    const [animatedCount, setAnimatedCount] = useState(0)

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getMyEvaluations()

                const sorted = [...data].sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                )

                setEvaluations(sorted)
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [])

    const latest = evaluations[0] ?? null
    const score = latest?.totalScore ?? 0

    const scorePercentage = Math.min(
        Math.max((score / 5) * 100, 0),
        100
    )

    const performanceLabel = useMemo(() => {
        if (score >= 4.5) return 'Mükemmel Performans'
        if (score >= 4) return 'Çok İyi Performans'
        if (score >= 3) return 'İyi Performans'
        if (score >= 2) return 'Gelişime Açık'
        return 'Gelişim Gerekiyor'
    }, [score])

    const performanceDescription = useMemo(() => {
        if (score >= 4.5) {
            return 'Performansın hedeflerin üzerinde. Başarılı çalışmalarını sürdürmeye devam et.'
        }

        if (score >= 4) {
            return 'Performansın oldukça güçlü. Başarılı sonuçlarını korumaya devam et.'
        }

        if (score >= 3) {
            return 'Performansın iyi seviyede. Gelişim alanlarına odaklanarak daha ileriye taşıyabilirsin.'
        }

        if (score >= 2) {
            return 'Performansını geliştirmek için belirlenen gelişim alanlarına odaklanabilirsin.'
        }

        return 'Performansını geliştirmek için gelişim alanlarına odaklanman faydalı olacaktır.'
    }, [score])

    const history = useMemo(() => {
        return [...evaluations].reverse().slice(-5)
    }, [evaluations])

    const historyAverage = useMemo(() => {
        if (evaluations.length === 0) return 0

        return (
            evaluations.reduce(
                (sum, evaluation) => sum + evaluation.totalScore,
                0
            ) / evaluations.length
        )
    }, [evaluations])

    // Dashboard animations
    useEffect(() => {
        if (!latest) {
            setAnimationProgress(0)
            setAnimatedScore(0)
            setAnimatedAverage(0)
            setAnimatedCount(0)
            return
        }

        const duration = 850
        const startTime = performance.now()

        let animationFrame: number

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)

            // Smooth ease-out
            const easedProgress =
                1 - Math.pow(1 - progress, 3)

            setAnimationProgress(easedProgress)
            setAnimatedScore(score * easedProgress)
            setAnimatedAverage(
                historyAverage * easedProgress
            )
            setAnimatedCount(
                Math.round(evaluations.length * easedProgress)
            )

            if (progress < 1) {
                animationFrame =
                    requestAnimationFrame(animate)
            }
        }

        animationFrame =
            requestAnimationFrame(animate)

        return () =>
            cancelAnimationFrame(animationFrame)
    }, [
        latest,
        score,
        historyAverage,
        evaluations.length,
    ])

    const trendDirection = useMemo(() => {
        if (history.length < 2) return 'Stabil'

        const first = history[0].totalScore
        const last =
            history[history.length - 1].totalScore

        if (last > first) return 'Yükselen trend'
        if (last < first) return 'Düşen trend'

        return 'Stabil'
    }, [history])

    return (
        <Box
            sx={{
                width: '100%',
                minWidth: 0,
            }}
        >
            {/* HEADER */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    gap: 2,
                    mb: 3.5,
                    flexWrap: 'wrap',
                }}
            >
                <Box>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 800,
                            letterSpacing: '-0.3px',
                        }}
                    >
                        Hoş geldin, {firstName || 'Çalışan'}
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{
                            mt: 0.6,
                            fontSize: 14.5,
                        }}
                    >
                        Performansını incele, gelişimini takip et.
                    </Typography>
                </Box>

                <Button
                    component={RouterLink}
                    to="/my-evaluations"
                    variant="outlined"
                    endIcon={<ArrowForward />}
                    sx={{
                        borderRadius: 2,
                        fontWeight: 700,
                        minHeight: 40,
                    }}
                >
                    Değerlendirmelerim
                </Button>
            </Box>

            {loading ? (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        py: 10,
                    }}
                >
                    <CircularProgress />
                </Box>
            ) : !latest ? (
                <Paper
                    elevation={0}
                    sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 3,
                        p: { xs: 4, md: 7 },
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            width: 240,
                            height: 240,
                            borderRadius: '50%',
                            bgcolor:
                                'rgba(245,179,1,0.08)',
                            top: -120,
                            right: -80,
                        }}
                    />

                    <Box
                        sx={{
                            width: 72,
                            height: 72,
                            borderRadius: 3,
                            bgcolor:
                                'rgba(245,179,1,0.12)',
                            color: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                        }}
                    >
                        <TrendingUp sx={{ fontSize: 34 }} />
                    </Box>

                    <Typography
                        sx={{
                            fontSize: 19,
                            fontWeight: 800,
                            mb: 0.8,
                        }}
                    >
                        Henüz değerlendirme bulunmuyor
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{
                            maxWidth: 500,
                            mx: 'auto',
                            fontSize: 14,
                            lineHeight: 1.6,
                        }}
                    >
                        Performans değerlendirmen tamamlandığında
                        sonuçların ve performans geçmişin burada
                        görüntülenecek.
                    </Typography>
                </Paper>
            ) : (
                <>
                    {/* MAIN PERFORMANCE */}
                    <Paper
                        elevation={0}
                        sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 3,
                            overflow: 'hidden',
                            mb: 2.5,
                        }}
                    >
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    md: '1.4fr 0.8fr',
                                },
                            }}
                        >
                            {/* SCORE */}
                            <Box
                                sx={{
                                    p: {
                                        xs: 2.5,
                                        sm: 3.5,
                                        md: 4,
                                    },
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        width: 180,
                                        height: 180,
                                        borderRadius: '50%',
                                        bgcolor:
                                            'rgba(245,179,1,0.055)',
                                        right: -70,
                                        top: -80,
                                        pointerEvents: 'none',
                                    }}
                                />

                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent:
                                            'space-between',
                                        alignItems: 'flex-start',
                                        gap: 2,
                                    }}
                                >
                                    <Box>
                                        <Typography
                                            sx={{
                                                fontSize: 11,
                                                fontWeight: 800,
                                                color:
                                                    'text.secondary',
                                                letterSpacing: 0.7,
                                            }}
                                        >
                                            SON PERFORMANS SONUCUN
                                        </Typography>

                                        <Typography
                                            sx={{
                                                fontSize: {
                                                    xs: 38,
                                                    sm: 46,
                                                },
                                                fontWeight: 800,
                                                mt: 0.7,
                                                lineHeight: 1,
                                                letterSpacing: '-1px',
                                            }}
                                        >
                                            {animatedScore.toFixed(2)}

                                            <Typography
                                                component="span"
                                                color="text.secondary"
                                                sx={{
                                                    fontSize: 18,
                                                    fontWeight: 600,
                                                    ml: 0.6,
                                                }}
                                            >
                                                / 5
                                            </Typography>
                                        </Typography>
                                    </Box>

                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 2,
                                            bgcolor:
                                                'rgba(245,179,1,0.12)',
                                            color: 'primary.main',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <EmojiEvents
                                            sx={{
                                                fontSize: 25,
                                            }}
                                        />
                                    </Box>
                                </Box>

                                <Chip
                                    label={performanceLabel}
                                    size="small"
                                    sx={{
                                        mt: 2,
                                        height: 28,
                                        fontWeight: 700,
                                        fontSize: 11,
                                        bgcolor:
                                            'rgba(245,179,1,0.12)',
                                        color: 'text.primary',
                                        borderRadius: 1.5,
                                    }}
                                />

                                <Typography
                                    color="text.secondary"
                                    sx={{
                                        fontSize: 13,
                                        lineHeight: 1.6,
                                        mt: 1.5,
                                        maxWidth: 600,
                                    }}
                                >
                                    {performanceDescription}
                                </Typography>

                                {/* PROGRESS */}
                                <Box sx={{ mt: 2.5 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent:
                                                'space-between',
                                            mb: 0.8,
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: 11,
                                                fontWeight: 700,
                                                color:
                                                    'text.secondary',
                                            }}
                                        >
                                            PERFORMANS SKORU
                                        </Typography>

                                        <Typography
                                            sx={{
                                                fontSize: 11,
                                                fontWeight: 800,
                                            }}
                                        >
                                            %{Math.round(
                                                scorePercentage *
                                                animationProgress
                                            )}
                                        </Typography>
                                    </Box>

                                    <LinearProgress
                                        variant="determinate"
                                        value={
                                            scorePercentage *
                                            animationProgress
                                        }
                                        sx={{
                                            height: 7,
                                            borderRadius: 4,
                                            bgcolor:
                                                'action.hover',
                                            '& .MuiLinearProgress-bar':
                                            {
                                                borderRadius: 4,
                                                transition:
                                                    'none',
                                            },
                                        }}
                                    />
                                </Box>
                            </Box>

                            {/* PERIOD */}
                            <Box
                                sx={{
                                    p: {
                                        xs: 2.5,
                                        sm: 3.5,
                                    },
                                    bgcolor: 'action.hover',
                                    borderLeft: {
                                        xs: 'none',
                                        md: '1px solid',
                                    },
                                    borderTop: {
                                        xs: '1px solid',
                                        md: 'none',
                                    },
                                    borderColor: 'divider',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: 10.5,
                                        fontWeight: 800,
                                        color:
                                            'text.secondary',
                                        letterSpacing: 0.6,
                                    }}
                                >
                                    DEĞERLENDİRME DÖNEMİ
                                </Typography>

                                <Typography
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: 17,
                                        mt: 0.7,
                                        lineHeight: 1.35,
                                    }}
                                >
                                    {latest.evaluationPeriodName}
                                </Typography>

                                <Divider sx={{ my: 2 }} />

                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.2,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 34,
                                            height: 34,
                                            borderRadius: 1.5,
                                            bgcolor:
                                                'rgba(245,179,1,0.12)',
                                            color:
                                                'primary.main',
                                            display: 'flex',
                                            alignItems:
                                                'center',
                                            justifyContent:
                                                'center',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <AssignmentTurnedIn
                                            sx={{
                                                fontSize: 18,
                                            }}
                                        />
                                    </Box>

                                    <Box>
                                        <Typography
                                            sx={{
                                                fontSize: 11,
                                                color:
                                                    'text.secondary',
                                            }}
                                        >
                                            Durum
                                        </Typography>

                                        <Typography
                                            sx={{
                                                fontSize: 13,
                                                fontWeight: 700,
                                            }}
                                        >
                                            Değerlendirme
                                            tamamlandı
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>

                    {/* STAT CARDS */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                sm: 'repeat(3, minmax(0, 1fr))',
                            },
                            gap: 2,
                            mb: 2.5,
                        }}
                    >
                        {/* AVERAGE */}
                        <Paper
                            elevation={0}
                            sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 3,
                                p: 2.5,
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: 2,
                                        bgcolor:
                                            'rgba(245,179,1,0.12)',
                                        color:
                                            'primary.main',
                                        display: 'flex',
                                        alignItems:
                                            'center',
                                        justifyContent:
                                            'center',
                                    }}
                                >
                                    <Insights
                                        sx={{
                                            fontSize: 21,
                                        }}
                                    />
                                </Box>

                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: 11,
                                            color:
                                                'text.secondary',
                                            fontWeight: 700,
                                        }}
                                    >
                                        GENEL ORTALAMA
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: 22,
                                            fontWeight: 800,
                                            mt: 0.2,
                                        }}
                                    >
                                        {animatedAverage.toFixed(2)}

                                        <Typography
                                            component="span"
                                            color="text.secondary"
                                            sx={{
                                                fontSize: 11,
                                                ml: 0.4,
                                            }}
                                        >
                                            / 5
                                        </Typography>
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>

                        {/* COUNT */}
                        <Paper
                            elevation={0}
                            sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 3,
                                p: 2.5,
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: 2,
                                        bgcolor:
                                            'rgba(245,179,1,0.12)',
                                        color:
                                            'primary.main',
                                        display: 'flex',
                                        alignItems:
                                            'center',
                                        justifyContent:
                                            'center',
                                    }}
                                >
                                    <History
                                        sx={{
                                            fontSize: 21,
                                        }}
                                    />
                                </Box>

                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: 11,
                                            color:
                                                'text.secondary',
                                            fontWeight: 700,
                                        }}
                                    >
                                        DEĞERLENDİRME
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: 22,
                                            fontWeight: 800,
                                            mt: 0.2,
                                        }}
                                    >
                                        {animatedCount}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>

                        {/* PERFORMANCE */}
                        <Paper
                            elevation={0}
                            sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 3,
                                p: 2.5,
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: 2,
                                        bgcolor:
                                            'rgba(245,179,1,0.12)',
                                        color:
                                            'primary.main',
                                        display: 'flex',
                                        alignItems:
                                            'center',
                                        justifyContent:
                                            'center',
                                    }}
                                >
                                    <EmojiEvents
                                        sx={{
                                            fontSize: 21,
                                        }}
                                    />
                                </Box>

                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: 11,
                                            color:
                                                'text.secondary',
                                            fontWeight: 700,
                                        }}
                                    >
                                        SONUÇ
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: 17,
                                            fontWeight: 800,
                                            mt: 0.45,
                                        }}
                                    >
                                        {performanceLabel}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>

                    {/* TREND + HISTORY */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                md: '1.5fr 1fr',
                            },
                            gap: 2,
                        }}
                    >
                        {/* PERFORMANCE TREND */}
                        <Paper
                            elevation={0}
                            sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 3,
                                p: {
                                    xs: 2.5,
                                    md: 3,
                                },
                                minWidth: 0,
                                overflow: 'hidden',
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent:
                                        'space-between',
                                    alignItems:
                                        'flex-start',
                                    gap: 2,
                                }}
                            >
                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: 16,
                                            fontWeight: 800,
                                        }}
                                    >
                                        Performans Trendi
                                    </Typography>

                                    <Typography
                                        color="text.secondary"
                                        sx={{
                                            fontSize: 12,
                                            mt: 0.35,
                                        }}
                                    >
                                        Son değerlendirmelerindeki
                                        performans değişimi.
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 2,
                                        bgcolor:
                                            'rgba(245,179,1,0.10)',
                                        color:
                                            'primary.main',
                                        display: 'flex',
                                        alignItems:
                                            'center',
                                        justifyContent:
                                            'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    <TrendingUp
                                        sx={{
                                            fontSize: 21,
                                        }}
                                    />
                                </Box>
                            </Box>

                            {history.length === 1 ? (
                                <Box
                                    sx={{
                                        mt: 4,
                                        mb: 2,
                                        textAlign: 'center',
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: 32,
                                            fontWeight: 800,
                                        }}
                                    >
                                        {(
                                            history[0]
                                                .totalScore *
                                            animationProgress
                                        ).toFixed(2)}

                                        <Typography
                                            component="span"
                                            color="text.secondary"
                                            sx={{
                                                fontSize: 14,
                                                ml: 0.4,
                                            }}
                                        >
                                            / 5
                                        </Typography>
                                    </Typography>

                                    <Typography
                                        color="text.secondary"
                                        sx={{
                                            fontSize: 11,
                                            mt: 0.5,
                                        }}
                                    >
                                        İlk performans değerlendirmen
                                    </Typography>
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        mt: 2.5,
                                        width: '100%',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <svg
                                        viewBox="0 0 760 260"
                                        width="100%"
                                        height="260"
                                        preserveAspectRatio="xMidYMid meet"
                                    >
                                        <defs>
                                            <linearGradient
                                                id="performanceArea"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor="#F5B301"
                                                    stopOpacity="0.28"
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor="#F5B301"
                                                    stopOpacity="0.02"
                                                />
                                            </linearGradient>

                                            <clipPath id="chartReveal">
                                                <rect
                                                    x="0"
                                                    y="0"
                                                    width={
                                                        760 *
                                                        animationProgress
                                                    }
                                                    height="260"
                                                />
                                            </clipPath>
                                        </defs>

                                        {/* GRID */}
                                        {[1, 2, 3, 4, 5].map(
                                            (value) => {
                                                const y =
                                                    220 -
                                                    (value / 5) *
                                                    170

                                                return (
                                                    <g
                                                        key={
                                                            value
                                                        }
                                                    >
                                                        <line
                                                            x1="55"
                                                            x2="735"
                                                            y1={y}
                                                            y2={y}
                                                            stroke="currentColor"
                                                            opacity="0.08"
                                                            strokeWidth="1"
                                                        />

                                                        <text
                                                            x="40"
                                                            y={
                                                                y +
                                                                4
                                                            }
                                                            textAnchor="end"
                                                            fontSize="10"
                                                            fill="currentColor"
                                                            opacity="0.45"
                                                        >
                                                            {
                                                                value
                                                            }
                                                        </text>
                                                    </g>
                                                )
                                            }
                                        )}

                                        {/* ANIMATED CHART */}
                                        <g clipPath="url(#chartReveal)">
                                            {/* AREA */}
                                            <polygon
                                                points={`
                                                    55,220
                                                    ${history
                                                        .map(
                                                            (
                                                                evaluation,
                                                                index
                                                            ) => {
                                                                const x =
                                                                    55 +
                                                                    (index /
                                                                        (history.length -
                                                                            1)) *
                                                                    680

                                                                const animatedValue =
                                                                    evaluation.totalScore *
                                                                    animationProgress

                                                                const y =
                                                                    220 -
                                                                    (animatedValue /
                                                                        5) *
                                                                    170

                                                                return `${x},${y}`
                                                            }
                                                        )
                                                        .join(
                                                            ' '
                                                        )}
                                                    735,220
                                                `}
                                                fill="url(#performanceArea)"
                                            />

                                            {/* LINE */}
                                            {history.map(
                                                (
                                                    evaluation,
                                                    index
                                                ) => {
                                                    if (
                                                        index ===
                                                        0
                                                    ) {
                                                        return null
                                                    }

                                                    const previous =
                                                        history[
                                                        index -
                                                        1
                                                        ]

                                                    const x1 =
                                                        55 +
                                                        ((index -
                                                            1) /
                                                            (history.length -
                                                                1)) *
                                                        680

                                                    const x2 =
                                                        55 +
                                                        (index /
                                                            (history.length -
                                                                1)) *
                                                        680

                                                    const previousScore =
                                                        previous.totalScore *
                                                        animationProgress

                                                    const currentScore =
                                                        evaluation.totalScore *
                                                        animationProgress

                                                    const y1 =
                                                        220 -
                                                        (previousScore /
                                                            5) *
                                                        170

                                                    const y2 =
                                                        220 -
                                                        (currentScore /
                                                            5) *
                                                        170

                                                    const controlX =
                                                        (x1 +
                                                            x2) /
                                                        2

                                                    return (
                                                        <path
                                                            key={
                                                                evaluation.id
                                                            }
                                                            d={`
                                                                M ${x1} ${y1}
                                                                C ${controlX} ${y1},
                                                                  ${controlX} ${y2},
                                                                  ${x2} ${y2}
                                                            `}
                                                            fill="none"
                                                            stroke="#F5B301"
                                                            strokeWidth="4"
                                                            strokeLinecap="round"
                                                            opacity="0.95"
                                                        />
                                                    )
                                                }
                                            )}

                                            {/* POINTS */}
                                            {history.map(
                                                (
                                                    evaluation,
                                                    index
                                                ) => {
                                                    const x =
                                                        55 +
                                                        (index /
                                                            (history.length -
                                                                1)) *
                                                        680

                                                    const animatedValue =
                                                        evaluation.totalScore *
                                                        animationProgress

                                                    const y =
                                                        220 -
                                                        (animatedValue /
                                                            5) *
                                                        170

                                                    return (
                                                        <g
                                                            key={
                                                                evaluation.id
                                                            }
                                                        >
                                                            <circle
                                                                cx={
                                                                    x
                                                                }
                                                                cy={
                                                                    y
                                                                }
                                                                r="10"
                                                                fill="#F5B301"
                                                                opacity="0.14"
                                                            />

                                                            <circle
                                                                cx={
                                                                    x
                                                                }
                                                                cy={
                                                                    y
                                                                }
                                                                r="5.5"
                                                                fill="#F5B301"
                                                            />

                                                            <text
                                                                x={
                                                                    x
                                                                }
                                                                y={
                                                                    y -
                                                                    17
                                                                }
                                                                textAnchor="middle"
                                                                fontSize="12"
                                                                fontWeight="800"
                                                                fill="currentColor"
                                                            >
                                                                {animatedValue.toFixed(
                                                                    2
                                                                )}
                                                            </text>
                                                        </g>
                                                    )
                                                }
                                            )}
                                        </g>

                                        {/* X AXIS */}
                                        {history.map(
                                            (
                                                evaluation,
                                                index
                                            ) => {
                                                const x =
                                                    55 +
                                                    (index /
                                                        (history.length -
                                                            1)) *
                                                    680

                                                const label =
                                                    evaluation
                                                        .evaluationPeriodName
                                                        .length >
                                                        18
                                                        ? `${evaluation.evaluationPeriodName.slice(
                                                            0,
                                                            18
                                                        )}...`
                                                        : evaluation.evaluationPeriodName

                                                return (
                                                    <text
                                                        key={`label-${evaluation.id}`}
                                                        x={
                                                            x
                                                        }
                                                        y="248"
                                                        textAnchor="middle"
                                                        fontSize="10"
                                                        fill="currentColor"
                                                        opacity="0.55"
                                                    >
                                                        {
                                                            label
                                                        }
                                                    </text>
                                                )
                                            }
                                        )}
                                    </svg>
                                </Box>
                            )}

                            {/* TREND FOOTER */}
                            {history.length > 1 && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems:
                                            'center',
                                        justifyContent:
                                            'space-between',
                                        gap: 2,
                                        mt: 0.5,
                                        pt: 1.5,
                                        borderTop:
                                            '1px solid',
                                        borderColor:
                                            'divider',
                                    }}
                                >
                                    <Typography
                                        color="text.secondary"
                                        sx={{
                                            fontSize: 11,
                                        }}
                                    >
                                        {history.length}{' '}
                                        değerlendirme
                                        üzerinden
                                        performans değişimi
                                    </Typography>

                                    <Chip
                                        size="small"
                                        label={
                                            trendDirection
                                        }
                                        sx={{
                                            height: 25,
                                            fontSize: 10,
                                            fontWeight: 700,
                                            bgcolor:
                                                'rgba(245,179,1,0.10)',
                                            color:
                                                'text.primary',
                                            borderRadius: 1.5,
                                        }}
                                    />
                                </Box>
                            )}
                        </Paper>

                        {/* HISTORY */}
                        <Paper
                            elevation={0}
                            sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 3,
                                p: 2.5,
                                minWidth: 0,
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems:
                                        'center',
                                    justifyContent:
                                        'space-between',
                                    mb: 2,
                                }}
                            >
                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: 16,
                                            fontWeight: 800,
                                        }}
                                    >
                                        Sonuçların
                                    </Typography>

                                    <Typography
                                        color="text.secondary"
                                        sx={{
                                            fontSize: 12,
                                            mt: 0.3,
                                        }}
                                    >
                                        Son değerlendirmelerin
                                    </Typography>
                                </Box>

                                <History
                                    sx={{
                                        color:
                                            'primary.main',
                                        fontSize: 23,
                                    }}
                                />
                            </Box>

                            {evaluations
                                .slice(0, 4)
                                .map((evaluation) => (
                                    <Box
                                        key={
                                            evaluation.id
                                        }
                                        sx={{
                                            display: 'flex',
                                            alignItems:
                                                'center',
                                            justifyContent:
                                                'space-between',
                                            gap: 1.5,
                                            py: 1.25,
                                            borderBottom:
                                                '1px solid',
                                            borderColor:
                                                'divider',
                                            '&:last-child': {
                                                borderBottom:
                                                    'none',
                                            },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                minWidth: 0,
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: 12.5,
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
                                                    evaluation.evaluationPeriodName
                                                }
                                            </Typography>

                                            <Typography
                                                color="text.secondary"
                                                sx={{
                                                    fontSize: 10.5,
                                                    mt: 0.2,
                                                }}
                                            >
                                                {new Date(
                                                    evaluation.createdAt
                                                ).toLocaleDateString(
                                                    'tr-TR'
                                                )}
                                            </Typography>
                                        </Box>

                                        <Typography
                                            sx={{
                                                fontWeight: 800,
                                                fontSize: 14,
                                                flexShrink: 0,
                                            }}
                                        >
                                            {evaluation.totalScore.toFixed(
                                                2
                                            )}

                                            <Typography
                                                component="span"
                                                color="text.secondary"
                                                sx={{
                                                    fontSize: 9,
                                                    ml: 0.2,
                                                }}
                                            >
                                                /5
                                            </Typography>
                                        </Typography>
                                    </Box>
                                ))}

                            <Button
                                component={
                                    RouterLink
                                }
                                to="/my-evaluations#history"
                                fullWidth
                                variant="outlined"
                                endIcon={
                                    <ArrowForward />
                                }
                                sx={{
                                    mt: 2,
                                    minHeight: 40,
                                    borderRadius: 2,
                                    fontWeight: 700,
                                }}
                            >
                                Tüm Geçmişimi Gör
                            </Button>
                        </Paper>
                    </Box>
                </>
            )}
        </Box>
    )
}