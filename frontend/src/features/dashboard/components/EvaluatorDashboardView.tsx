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
    Avatar,
    Divider,
} from '@mui/material'
import {
    EmojiEvents,
    ArrowForward,
    RateReview,
    Groups,
    AssignmentTurnedIn,
    TrendingUp,
    TrendingDown,
    Remove,
    Insights,
    Schedule,
} from '@mui/icons-material'
import { SparkLineChart } from '@mui/x-charts/SparkLineChart'
import { Link as RouterLink } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { getEvaluationPeriods } from '../../evaluationPeriods/evaluationPeriodsApi'
import { getTeamByEvaluator } from '../../evaluatorEmployees/evaluatorEmployeesApi'
import { getTeamRanking, type EmployeeRanking } from '../dashboardApi'
import { getDefaultPeriod } from '../../../shared/utils/period'
import type { EvaluationPeriod } from '../../evaluationPeriods/types'
import type { EvaluatorEmployeeDto } from '../../evaluatorEmployees/types'
import { useLanguage } from '../../../shared/i18n/LanguageContext'
import { translations } from '../../../shared/i18n/translations'

const RANK_COLORS: Record<number, string> = {
    1: '#F5B301',
    2: '#B0B0B0',
    3: '#B87333',
}

const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max)

const periodState = (period: EvaluationPeriod) => {
    const today = new Date()
    const start = new Date(period.startDate)
    const end = new Date(period.endDate)
    today.setHours(0, 0, 0, 0)
    start.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)
    if (today < start) return 'Başlamadı'
    if (today > end) return 'Tamamlandı'
    return 'Aktif'
}

type EvaluatorDashboardViewProps = {
    firstName?: string
}

export default function EvaluatorDashboardView({ firstName }: EvaluatorDashboardViewProps) {
    const { language } = useLanguage()
    const t = translations[language]
    const currentUser = useAuthStore((s) => s.user)

    const [periods, setPeriods] = useState<EvaluationPeriod[]>([])
    const [selectedPeriodId, setSelectedPeriodId] = useState<number | ''>('')
    const [team, setTeam] = useState<EvaluatorEmployeeDto[]>([])
    const [ranking, setRanking] = useState<EmployeeRanking[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingRanking, setLoadingRanking] = useState(false)

    useEffect(() => {
        if (!currentUser) return

        const load = async () => {
            try {
                const [periodsData, teamData] = await Promise.all([
                    getEvaluationPeriods(),
                    getTeamByEvaluator(currentUser.id),
                ])

                const sorted = [...periodsData].sort(
                    (a, b) => Number(periodState(b) === 'Aktif') - Number(periodState(a) === 'Aktif')
                )

                setPeriods(sorted)
                setTeam(teamData)

                const defaultPeriod = getDefaultPeriod(sorted)
                if (defaultPeriod) setSelectedPeriodId(defaultPeriod.id)
            } catch {
                setPeriods([])
                setTeam([])
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [currentUser])

    useEffect(() => {
        if (selectedPeriodId === '') return

        const loadRanking = async () => {
            setLoadingRanking(true)
            try {
                setRanking(await getTeamRanking(selectedPeriodId))
            } catch {
                setRanking([])
            } finally {
                setLoadingRanking(false)
            }
        }

        loadRanking()
    }, [selectedPeriodId])

    const selectedPeriod = useMemo(
        () => periods.find((p) => p.id === selectedPeriodId),
        [periods, selectedPeriodId]
    )

    const stats = useMemo(() => {
        const evaluated = ranking.length
        const total = team.length
        const pending = Math.max(total - evaluated, 0)
        const completion = total ? clamp((evaluated / total) * 100, 0, 100) : 0
        const average = evaluated
            ? ranking.reduce((sum, item) => sum + item.averageScore, 0) / evaluated
            : 0

        const sorted = [...ranking].sort((a, b) => b.averageScore - a.averageScore)
        const highest = sorted[0]?.averageScore ?? 0
        const lowest = sorted[sorted.length - 1]?.averageScore ?? 0
        const gap = evaluated > 1 ? highest - lowest : 0

        const distribution = [
            { label: '4.0 – 5.0', count: ranking.filter((x) => x.averageScore >= 4).length },
            { label: '3.0 – 3.9', count: ranking.filter((x) => x.averageScore >= 3 && x.averageScore < 4).length },
            { label: '2.0 – 2.9', count: ranking.filter((x) => x.averageScore >= 2 && x.averageScore < 3).length },
            { label: '0 – 1.9', count: ranking.filter((x) => x.averageScore < 2).length },
        ]

        const top = sorted.slice(0, 5)
        const bottom = [...sorted].reverse().slice(0, 3)

        return { evaluated, total, pending, completion, average, highest, lowest, gap, distribution, top, bottom }
    }, [ranking, team.length])

    const [animated, setAnimated] = useState({ count: 0, progress: 0, average: 0, pending: 0 })

    useEffect(() => {
        const duration = 700
        const started = performance.now()
        let frame = 0

        const animate = (now: number) => {
            const progress = clamp((now - started) / duration, 0, 1)
            const eased = 1 - Math.pow(1 - progress, 3)

            setAnimated({
                count: Math.round(stats.evaluated * eased),
                progress: stats.completion * eased,
                average: stats.average * eased,
                pending: Math.round(stats.pending * eased),
            })

            if (progress < 1) frame = requestAnimationFrame(animate)
        }

        frame = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(frame)
    }, [stats.evaluated, stats.completion, stats.average, stats.pending])

    const trend = useMemo(() => {
        const values = ranking
            .slice()
            .sort((a, b) => a.rank - b.rank)
            .map((x) => x.averageScore)

        if (values.length < 2) return { values, direction: 'stable' as const }
        const first = values[0]
        const last = values[values.length - 1]
        return {
            values,
            direction: last > first + 0.05 ? 'up' as const : last < first - 0.05 ? 'down' as const : 'stable' as const,
        }
    }, [ranking])

    const status = selectedPeriod ? periodState(selectedPeriod) : null

    const getPeriodStatusLabel = (value: string | null) =>
        value === 'Aktif'
            ? t.evaluatorDashboard.active
            : value === 'Başlamadı'
                ? t.evaluatorDashboard.notStarted
                : value === 'Tamamlandı'
                    ? t.evaluatorDashboard.completed
                    : '—'

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
                <CircularProgress />
            </Box>
        )
    }

    if (!currentUser) return null

    return (
        <Box sx={{ width: '100%', minWidth: 0 }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    gap: 2,
                    mb: 3,
                    flexWrap: 'wrap',
                }}
            >
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.3px' }}>
                        {t.evaluatorDashboard.welcome}, {firstName || t.evaluatorDashboard.evaluator}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: 14 }}>
                        {t.evaluatorDashboard.description}
                    </Typography>
                </Box>

                {periods.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                            select
                            size="small"
                            label={t.evaluatorDashboard.evaluationPeriod}
                            value={selectedPeriodId}
                            onChange={(e) => setSelectedPeriodId(Number(e.target.value))}
                            sx={{ width: { xs: 220, sm: 450 } }}
                            slotProps={{ inputLabel: { shrink: true } }}
                        >
                            {periods.map((period) => (
                                <MenuItem key={period.id} value={period.id}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {period.name}
                                        {periodState(period) === 'Aktif' && (
                                            <Chip label={t.evaluatorDashboard.active} size="small" color="success" />
                                        )}
                                    </Box>
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                )}
            </Box>

            {periods.length === 0 ? (
                <Paper
                    elevation={0}
                    sx={{ p: 6, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}
                >
                    <Typography sx={{ fontWeight: 800 }}>{t.evaluatorDashboard.noPeriods}</Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: 14 }}>
                        {t.evaluatorDashboard.noPeriodsDescription}
                    </Typography>
                </Paper>
            ) : (
                <>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
                            gap: 2,
                            mb: 2,
                        }}
                    >
                        {[
                            {
                                title: t.evaluatorDashboard.progress,
                                value: `${animated.count} / ${stats.total}`,
                                subtitle: `%${Math.round(animated.progress)} ${t.evaluatorDashboard.completedSuffix}`,
                                icon: <AssignmentTurnedIn />,
                            },
                            {
                                title: t.evaluatorDashboard.teamAverage,
                                value: stats.average ? `${animated.average.toFixed(2)} / 5` : '—',
                                subtitle: t.evaluatorDashboard.evaluatedEmployees,
                                icon: <Insights />,
                            },
                            {
                                title: t.evaluatorDashboard.pending,
                                value: animated.pending,
                                subtitle: t.evaluatorDashboard.pendingEmployees,
                                icon: <Schedule />,
                            },
                            {
                                title: t.evaluatorDashboard.performanceRange,
                                value: stats.evaluated ? `${stats.lowest.toFixed(2)} – ${stats.highest.toFixed(2)}` : '—',
                                subtitle: stats.evaluated > 1 ? `${t.evaluatorDashboard.gap}: ${stats.gap.toFixed(2)} ${t.evaluatorDashboard.points}` : t.evaluatorDashboard.insufficientData,
                                icon: <TrendingUp />,
                            },
                        ].map((item) => (
                            <Paper
                                key={item.title}
                                elevation={0}
                                sx={{
                                    p: 2.4,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 3,
                                    transition: 'transform .2s ease, box-shadow .2s ease, border-color .2s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        borderColor: 'primary.main',
                                        boxShadow: '0 10px 28px rgba(0,0,0,.07)',
                                    },
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: 'text.secondary', letterSpacing: '.5px' }}>
                                            {item.title.toUpperCase()}
                                        </Typography>
                                        <Typography sx={{ fontSize: 27, fontWeight: 800, mt: .7 }}>
                                            {item.value}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: 'rgba(245,179,1,.12)', color: 'primary.main' }}>
                                        {item.icon}
                                    </Box>
                                </Box>
                                <Typography color="text.secondary" sx={{ fontSize: 11.5, mt: 1 }}>
                                    {item.subtitle}
                                </Typography>
                                {item.title === t.evaluatorDashboard.progress && (
                                    <LinearProgress variant="determinate" value={animated.progress} sx={{ mt: 1.5, height: 5, borderRadius: 5 }} />
                                )}
                            </Paper>
                        ))}
                    </Box>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', lg: '1.45fr .9fr' },
                            gap: 2,
                            mb: 2,
                        }}
                    >
                        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'flex-start', mb: 2 }}>
                                <Box>
                                    <Typography sx={{ fontWeight: 800, fontSize: 16 }}>{t.evaluatorDashboard.performanceAnalysis}</Typography>
                                    <Typography color="text.secondary" sx={{ fontSize: 12.5, mt: .3 }}>
                                        {t.evaluatorDashboard.performanceAnalysisDescription}
                                    </Typography>
                                </Box>
                                <Chip label={`${stats.evaluated} ${t.evaluatorDashboard.results}`} size="small" variant="outlined" />
                            </Box>

                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.25fr .8fr' }, gap: 3, alignItems: 'center' }}>
                                <Box sx={{ minWidth: 0 }}>
                                    {stats.distribution.map((item) => {
                                        const percentage = stats.evaluated ? (item.count / stats.evaluated) * 100 : 0
                                        return (
                                            <Box key={item.label} sx={{ mb: 1.8 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: .55 }}>
                                                    <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>{item.label}</Typography>
                                                    <Typography color="text.secondary" sx={{ fontSize: 11.5 }}>{item.count} {t.evaluatorDashboard.people}</Typography>
                                                </Box>
                                                <LinearProgress variant="determinate" value={percentage} sx={{ height: 7, borderRadius: 7 }} />
                                            </Box>
                                        )
                                    })}
                                </Box>

                                <Box sx={{ textAlign: 'center', p: 2, borderRadius: 3, bgcolor: 'action.hover' }}>
                                    <Typography color="text.secondary" sx={{ fontSize: 11, fontWeight: 800 }}>{t.evaluatorDashboard.teamScore}</Typography>
                                    <Typography sx={{ fontSize: 38, fontWeight: 900, lineHeight: 1.1, mt: .5 }}>
                                        {stats.average ? stats.average.toFixed(2) : '—'}
                                    </Typography>
                                    <Typography color="text.secondary" sx={{ fontSize: 12 }}>/ 5</Typography>
                                    <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'center' }}>
                                        <SparkLineChart
                                            data={trend.values.length ? trend.values : [0]}
                                            height={42}
                                            width={150}
                                            color="#F5B301"
                                            showTooltip
                                            showHighlight
                                            curve="monotoneX"
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>

                        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                            <Typography sx={{ fontWeight: 800, fontSize: 16 }}>{t.evaluatorDashboard.processHealth}</Typography>
                            <Typography color="text.secondary" sx={{ fontSize: 12.5, mt: .3 }}>
                                {t.evaluatorDashboard.processHealthDescription}
                            </Typography>

                            <Box sx={{ display: 'grid', placeItems: 'center', my: 2.5 }}>
                                <Box sx={{ position: 'relative', width: 155, height: 155 }}>
                                    <Box
                                        component="svg"
                                        viewBox="0 0 120 120"
                                        sx={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
                                    >
                                        <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="8" style={{ color: 'rgba(127,127,127,.14)' }} />
                                        <circle
                                            cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
                                            strokeDasharray={314.16}
                                            strokeDashoffset={314.16 - (314.16 * animated.progress) / 100}
                                            style={{ color: 'var(--mui-palette-primary-main)', transition: 'stroke-dashoffset .2s ease' }}
                                        />
                                    </Box>
                                    <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography sx={{ fontSize: 26, fontWeight: 900 }}>{Math.round(animated.progress)}%</Typography>
                                            <Typography color="text.secondary" sx={{ fontSize: 10 }}>{t.evaluatorDashboard.completedUpper}</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: .5 }}>
                                <Box>
                                    <Typography color="text.secondary" sx={{ fontSize: 10 }}>{t.evaluatorDashboard.status}</Typography>
                                    <Typography sx={{ fontSize: 13, fontWeight: 800 }}>{getPeriodStatusLabel(status)}</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography color="text.secondary" sx={{ fontSize: 10 }}>{t.evaluatorDashboard.pendingUpper}</Typography>
                                    <Typography sx={{ fontSize: 13, fontWeight: 800 }}>{stats.pending}</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', lg: '1.35fr .9fr' },
                            gap: 2,
                            mb: 2,
                        }}
                    >
                        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
                            <Box sx={{ p: { xs: 2, md: 2.5 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Box>
                                    <Typography sx={{ fontWeight: 800, fontSize: 16 }}>{t.evaluatorDashboard.topPerformances}</Typography>
                                    <Typography color="text.secondary" sx={{ fontSize: 12.5, mt: .3 }}>{t.evaluatorDashboard.topPerformancesDescription}</Typography>
                                </Box>
                                <Button component={RouterLink} to="/reports/team-ranking" size="small" endIcon={<ArrowForward />}>
                                    {t.evaluatorDashboard.viewAll}
                                </Button>
                            </Box>

                            {loadingRanking ? (
                                <Box sx={{ display: 'grid', placeItems: 'center', py: 5 }}><CircularProgress size={26} /></Box>
                            ) : stats.top.length === 0 ? (
                                <Box sx={{ p: 4 }}><Typography color="text.secondary" sx={{ fontSize: 14 }}>{t.evaluatorDashboard.noResults}</Typography></Box>
                            ) : (
                                stats.top.map((item) => (
                                    <Box
                                        key={item.employeeId}
                                        sx={{
                                            display: 'flex', alignItems: 'center', gap: 1.5, px: { xs: 2, md: 2.5 }, py: 1.55,
                                            borderBottom: '1px solid', borderColor: 'divider',
                                            '&:last-child': { borderBottom: 0 },
                                        }}
                                    >
                                        <Box sx={{ width: 25, textAlign: 'center', flexShrink: 0 }}>
                                            {item.rank <= 3 ? <EmojiEvents sx={{ fontSize: 19, color: RANK_COLORS[item.rank] }} /> : <Typography sx={{ fontSize: 12, fontWeight: 800 }}>#{item.rank}</Typography>}
                                        </Box>
                                        <Avatar sx={{
                                            width: 34, height: 34, bgcolor: (theme) =>
                                                theme.palette.mode === 'dark'
                                                    ? theme.palette.avatar.dark
                                                    : theme.palette.avatar.light, fontSize: 12, fontWeight: 800
                                        }}>
                                            {item.employeeName.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography sx={{ fontSize: 13.5, fontWeight: 750, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {item.employeeName}
                                            </Typography>
                                            {item.jobPositionName && (
                                                <Typography color="text.secondary" sx={{ fontSize: 11.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {item.jobPositionName}
                                                </Typography>
                                            )}
                                        </Box>
                                        <Chip label={`${item.averageScore.toFixed(2)} / 5`} size="small" sx={{ fontWeight: 800 }} />
                                    </Box>
                                ))
                            )}
                        </Paper>

                        <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                            <Typography sx={{ fontWeight: 800, fontSize: 16 }}>{t.evaluatorDashboard.analystSummary}</Typography>
                            <Typography color="text.secondary" sx={{ fontSize: 12.5, mt: .3 }}>{t.evaluatorDashboard.analystSummaryDescription}</Typography>

                            <Box sx={{ mt: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, py: 1.3 }}>
                                    {trend.direction === 'up' ? <TrendingUp color="success" /> : trend.direction === 'down' ? <TrendingDown color="error" /> : <Remove color="disabled" />}
                                    <Box>
                                        <Typography sx={{ fontSize: 12, fontWeight: 800 }}>{t.evaluatorDashboard.rankingView}</Typography>
                                        <Typography color="text.secondary" sx={{ fontSize: 11.5 }}>
                                            {trend.direction === 'up' ? t.evaluatorDashboard.trendUp : trend.direction === 'down' ? t.evaluatorDashboard.trendDown : t.evaluatorDashboard.trendStable}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Divider />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, py: 1.3 }}>
                                    <Groups sx={{ color: 'primary.main' }} />
                                    <Box>
                                        <Typography sx={{ fontSize: 12, fontWeight: 800 }}>{t.evaluatorDashboard.teamSize}</Typography>
                                        <Typography color="text.secondary" sx={{ fontSize: 11.5 }}>{stats.total} {t.evaluatorDashboard.assignedEmployees}</Typography>
                                    </Box>
                                </Box>
                                <Divider />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, py: 1.3 }}>
                                    <Schedule sx={{ color: 'primary.main' }} />
                                    <Box>
                                        <Typography sx={{ fontSize: 12, fontWeight: 800 }}>{t.evaluatorDashboard.priority}</Typography>
                                        <Typography color="text.secondary" sx={{ fontSize: 11.5 }}>
                                            {stats.pending > 0 ? `${stats.pending} ${t.evaluatorDashboard.waitingSuffix}` : t.evaluatorDashboard.allCompleted}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Button component={RouterLink} to="/evaluations/new" variant="contained" fullWidth startIcon={<RateReview />} sx={{ mt: 1.5, minHeight: 44, borderRadius: 2, fontWeight: 800, boxShadow: 'none' }}>
                                {t.evaluatorDashboard.evaluate}
                            </Button>
                        </Paper>
                    </Box>

                    <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <Box>
                                <Typography sx={{ fontWeight: 800, fontSize: 16 }}>{t.evaluatorDashboard.periodInfo}</Typography>
                                <Typography color="text.secondary" sx={{ fontSize: 12.5, mt: .3 }}>
                                    {selectedPeriod?.name} · {selectedPeriod ? `${new Date(selectedPeriod.startDate).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')} – ${new Date(selectedPeriod.endDate).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}` : ''}
                                </Typography>
                            </Box>
                            <Chip label={getPeriodStatusLabel(status)} color={status === 'Aktif' ? 'success' : 'default'} size="small" sx={{ fontWeight: 800 }} />
                        </Box>
                    </Paper>
                </>
            )}
        </Box>
    )
}
