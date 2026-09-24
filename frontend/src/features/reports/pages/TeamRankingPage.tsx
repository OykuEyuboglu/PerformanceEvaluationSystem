import { useEffect, useMemo, useState } from 'react'
import {
    Box,
    Typography,
    Paper,
    Button,
    CircularProgress,
    Chip,
    MenuItem,
    TextField,
    Avatar,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
} from '@mui/material'
import {
    ArrowBack,
    Download,
    Search,
    EmojiEvents,
    Insights,
} from '@mui/icons-material'
import { Link as RouterLink } from 'react-router-dom'
import { getEvaluationPeriods } from '../../evaluationPeriods/evaluationPeriodsApi'
import { getTeamRanking, exportTeamRankingExcel, type EmployeeRanking } from '../../dashboard/dashboardApi'
import type { EvaluationPeriod } from '../../evaluationPeriods/types'
import { getDefaultPeriod } from '../../../shared/utils/period'
import { useLanguage } from '../../../shared/i18n/LanguageContext'
import { translations } from '../../../shared/i18n/translations'

const isActivePeriod = (period: EvaluationPeriod) => {
    const today = new Date()
    const start = new Date(period.startDate)
    const end = new Date(period.endDate)
    today.setHours(0, 0, 0, 0)
    start.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)
    return today >= start && today <= end
}

type SortKey = 'rank' | 'employeeName' | 'averageScore' | 'evaluationCount'
type Order = 'asc' | 'desc'

const rankColor = (rank: number) =>
    rank === 1 ? '#F5B301' : rank === 2 ? '#B0B0B0' : rank === 3 ? '#B87333' : undefined

export default function TeamRankingPage() {
    const { language } = useLanguage()
    const t = translations[language]
    const [periods, setPeriods] = useState<EvaluationPeriod[]>([])
    const [selectedPeriodId, setSelectedPeriodId] = useState<number | ''>('')
    const [ranking, setRanking] = useState<EmployeeRanking[]>([])
    const [search, setSearch] = useState('')
    const [sortKey, setSortKey] = useState<SortKey>('rank')
    const [order, setOrder] = useState<Order>('asc')
    const [loading, setLoading] = useState(true)
    const [loadingRanking, setLoadingRanking] = useState(false)
    const [exporting, setExporting] = useState(false)

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getEvaluationPeriods()
                const sorted = [...data].sort(
                    (a, b) => Number(isActivePeriod(b)) - Number(isActivePeriod(a))
                )
                setPeriods(sorted)
                const defaultPeriod = getDefaultPeriod(sorted)
                setSelectedPeriodId(defaultPeriod?.id ?? sorted[0]?.id ?? '')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    useEffect(() => {
        if (selectedPeriodId === '') return
        const load = async () => {
            setLoadingRanking(true)
            try {
                setRanking(await getTeamRanking(selectedPeriodId))
            } catch {
                setRanking([])
            } finally {
                setLoadingRanking(false)
            }
        }
        load()
    }, [selectedPeriodId])

    const selectedPeriod = periods.find((p) => p.id === selectedPeriodId)

    const filteredRanking = useMemo(() => {
        const query = search.trim().toLocaleLowerCase(language === 'tr' ? 'tr-TR' : 'en-US')
        const data = ranking.filter((item) =>
            !query ||
            item.employeeName.toLocaleLowerCase(language === 'tr' ? 'tr-TR' : 'en-US').includes(query) ||
            (item.jobPositionName || '').toLocaleLowerCase(language === 'tr' ? 'tr-TR' : 'en-US').includes(query)
        )

        return [...data].sort((a, b) => {
            let result = 0
            if (sortKey === 'employeeName') result = a.employeeName.localeCompare(b.employeeName, language === 'tr' ? 'tr' : 'en')
            else if (sortKey === 'averageScore') result = a.averageScore - b.averageScore
            else if (sortKey === 'evaluationCount') result = a.evaluationCount - b.evaluationCount
            else result = a.rank - b.rank
            return order === 'asc' ? result : -result
        })
    }, [ranking, search, sortKey, order])

    const topThree = useMemo(
        () => [...ranking].sort((a, b) => a.rank - b.rank).slice(0, 3),
        [ranking]
    )

    const average = ranking.length
        ? ranking.reduce((sum, item) => sum + item.averageScore, 0) / ranking.length
        : 0

    const requestSort = (key: SortKey) => {
        if (sortKey === key) setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
        else {
            setSortKey(key)
            setOrder(key === 'employeeName' ? 'asc' : 'desc')
        }
    }

    const handleExport = async () => {
        if (selectedPeriodId === '') return
        setExporting(true)
        try {
            await exportTeamRankingExcel(selectedPeriodId)
        } finally {
            setExporting(false)
        }
    }

    if (loading) {
        return <Box sx={{ display: 'grid', placeItems: 'center', py: 12 }}><CircularProgress /></Box>
    }

    return (
        <Box sx={{ width: '100%', minWidth: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Box>
                    <Button component={RouterLink} to="/dashboard" startIcon={<ArrowBack />} size="small" sx={{ mb: 1 }}>
                        {t.teamRanking.dashboard}
                    </Button>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        <EmojiEvents
                            sx={{
                                fontSize: 28,
                                color: 'primary.main',
                            }}
                        />

                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 850,
                                letterSpacing: '-.35px',
                            }}
                        >
                            {t.teamRanking.title}
                        </Typography>
                    </Box>
                    <Typography color="text.secondary" sx={{ mt: .5, fontSize: 14 }}>
                        {t.teamRanking.description}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <TextField
                        select
                        size="small"
                        label={t.teamRanking.evaluationPeriod}
                        value={selectedPeriodId}
                        onChange={(e) => setSelectedPeriodId(Number(e.target.value))}
                        sx={{
                            width: { xs: '100%', sm: 450 },
                            maxWidth: { xs: '100%', sm: 450 },
                            minWidth: 0,
                            '& .MuiSelect-select': {
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            },
                        }}
                        slotProps={{ inputLabel: { shrink: true } }}
                    >
                        {periods.map((period) => (
                            <MenuItem
                                key={period.id}
                                value={period.id}
                                sx={{
                                    width: 'min(450px, calc(100vw - 32px))',
                                    maxWidth: 'calc(100vw - 32px)',
                                    minWidth: 0,
                                    boxSizing: 'border-box',
                                    whiteSpace: 'normal',
                                    py: { xs: 1.2, sm: 1 },
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        minWidth: 0,
                                        width: '100%',
                                    }}
                                >
                                    <Typography
                                        component="span"
                                        sx={{
                                            minWidth: 0,
                                            flex: 1,
                                            overflowWrap: 'anywhere',
                                            wordBreak: 'break-word',
                                            whiteSpace: 'normal',
                                            lineHeight: 1.35,
                                        }}
                                    >
                                        {period.name}
                                    </Typography>
                                    {isActivePeriod(period) && (
                                        <Chip
                                            label={t.teamRanking.active}
                                            size="small"
                                            color="success"
                                            sx={{ flexShrink: 0 }}
                                        />
                                    )}
                                </Box>
                            </MenuItem>
                        ))}
                    </TextField>

                    <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={handleExport}
                        disabled={exporting || selectedPeriodId === ''}
                        sx={{ minHeight: 40, borderRadius: 2, fontWeight: 750 }}
                    >
                        {exporting ? t.teamRanking.preparing : t.teamRanking.excel}
                    </Button>
                </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))' }, gap: { xs: 1.25, sm: 2 }, mb: 2 }}>
                <Paper elevation={0} sx={{
                    p: { xs: 1.5, sm: 2.2 },
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: { xs: 2.5, sm: 3 },
                    minWidth: 0,
                    aspectRatio: { xs: '1 / 1', sm: 'auto' },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}>
                    <Typography color="text.secondary" sx={{ fontSize: 10.5, fontWeight: 800 }}>{t.teamRanking.evaluated}</Typography>
                    <Typography sx={{ fontSize: { xs: 23, sm: 28 }, fontWeight: 900, mt: .5 }}>{ranking.length}</Typography>
                    <Typography color="text.secondary" sx={{ fontSize: { xs: 10, sm: 11.5 }, lineHeight: 1.35 }}>{t.teamRanking.employee}</Typography>
                </Paper>
                <Paper elevation={0} sx={{
                    p: { xs: 1.5, sm: 2.2 },
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: { xs: 2.5, sm: 3 },
                    minWidth: 0,
                    aspectRatio: { xs: '1 / 1', sm: 'auto' },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}>
                    <Typography color="text.secondary" sx={{ fontSize: 10.5, fontWeight: 800 }}>{t.teamRanking.teamAverage}</Typography>
                    <Typography sx={{ fontSize: { xs: 23, sm: 28 }, fontWeight: 900, mt: .5 }}>{average ? average.toFixed(2) : '—'}</Typography>
                    <Typography color="text.secondary" sx={{ fontSize: { xs: 10, sm: 11.5 }, lineHeight: 1.35 }}>/ 5</Typography>
                </Paper>
                <Paper elevation={0} sx={{
                    p: { xs: 1.5, sm: 2.2 },
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: { xs: 2.5, sm: 3 },
                    minWidth: 0,
                    aspectRatio: { xs: '1 / 1', sm: 'auto' },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}>
                    <Typography color="text.secondary" sx={{ fontSize: 10.5, fontWeight: 800 }}>{t.teamRanking.period}</Typography>
                    <Typography sx={{ fontSize: { xs: 15, sm: 18 }, fontWeight: 900, mt: .9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedPeriod?.name || '—'}
                    </Typography>
                    <Typography color="text.secondary" sx={{ fontSize: { xs: 10, sm: 11.5 }, lineHeight: 1.35 }}>
                        {selectedPeriod ? `${new Date(selectedPeriod.startDate).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')} – ${new Date(selectedPeriod.endDate).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}` : ''}
                    </Typography>
                </Paper>
            </Box>

            {topThree.length > 0 && (
                <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <EmojiEvents sx={{ color: 'primary.main' }} />
                        <Box>
                            <Typography sx={{ fontWeight: 800, fontSize: 16 }}>{t.teamRanking.topThree}</Typography>
                            <Typography color="text.secondary" sx={{ fontSize: 12 }}>{t.teamRanking.topThreeDescription}</Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 1.5 }}>
                        {topThree.map((item) => (
                            <Box
                                key={item.employeeId}
                                sx={{
                                    p: 1.8,
                                    borderRadius: 2.5,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.4,
                                    transition: 'transform .2s ease, box-shadow .2s ease',
                                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 22px rgba(0,0,0,.06)' },
                                }}
                            >
                                <Avatar sx={{ bgcolor: rankColor(item.rank) || 'secondary.main', color: item.rank <= 3 ? '#111' : undefined, fontWeight: 900 }}>
                                    {item.employeeName.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography sx={{ fontWeight: 800, fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {item.employeeName}
                                    </Typography>
                                    <Typography color="text.secondary" sx={{ fontSize: 11.5 }}>#{item.rank} · {item.jobPositionName || '{t.teamRanking.positionNotSpecified}'}</Typography>
                                </Box>
                                <Typography sx={{ fontWeight: 900, fontSize: 17 }}>{item.averageScore.toFixed(2)}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Paper>
            )}

            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ p: { xs: 2, md: 2.5 }, display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Insights sx={{ color: 'primary.main' }} />
                        <Box>
                            <Typography sx={{ fontWeight: 800, fontSize: 16 }}>{t.teamRanking.performanceRanking}</Typography>
                            <Typography color="text.secondary" sx={{ fontSize: 12 }}>{t.teamRanking.detailedResults}</Typography>
                        </Box>
                    </Box>
                    <TextField
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t.teamRanking.searchPlaceholder}
                        sx={{ width: { xs: '100%', sm: 280 } }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>
                                ),
                            },
                        }}
                    />
                </Box>

                {loadingRanking ? (
                    <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}><CircularProgress /></Box>
                ) : filteredRanking.length === 0 ? (
                    <Box sx={{ p: 5, textAlign: 'center' }}>
                        <Typography sx={{ fontWeight: 800 }}>{t.teamRanking.noResults}</Typography>
                        <Typography color="text.secondary" sx={{ fontSize: 13, mt: .5 }}>
                            {t.teamRanking.noResultsDescription}
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 800 }}>
                                        <TableSortLabel active={sortKey === 'rank'} direction={sortKey === 'rank' ? order : 'asc'} onClick={() => requestSort('rank')}>
                                            {t.teamRanking.rank}
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>
                                        <TableSortLabel active={sortKey === 'employeeName'} direction={sortKey === 'employeeName' ? order : 'asc'} onClick={() => requestSort('employeeName')}>
                                            {t.teamRanking.employee}
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>{t.teamRanking.position}</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>
                                        <TableSortLabel active={sortKey === 'averageScore'} direction={sortKey === 'averageScore' ? order : 'desc'} onClick={() => requestSort('averageScore')}>
                                            {t.teamRanking.average}
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>
                                        <TableSortLabel active={sortKey === 'evaluationCount'} direction={sortKey === 'evaluationCount' ? order : 'desc'} onClick={() => requestSort('evaluationCount')}>
                                            {t.teamRanking.evaluation}
                                        </TableSortLabel>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredRanking.map((item) => (
                                    <TableRow key={item.employeeId} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: .7 }}>
                                                {item.rank <= 3 && <EmojiEvents sx={{ fontSize: 18, color: rankColor(item.rank) }} />}
                                                <Typography sx={{ fontWeight: 800 }}>#{item.rank}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                                <Avatar sx={{
                                                    width: 32, height: 32, bgcolor: (theme) =>
                                                        theme.palette.mode === 'dark'
                                                            ? theme.palette.avatar.dark
                                                            : theme.palette.avatar.light, fontSize: 12, fontWeight: 800
                                                }}>
                                                    {item.employeeName.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Typography sx={{ fontWeight: 750 }}>{item.employeeName}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell color="text.secondary">{item.jobPositionName || t.teamRanking.positionNotSpecified}</TableCell>
                                        <TableCell>
                                            <Chip label={`${item.averageScore.toFixed(2)} / 5`} size="small" sx={{ fontWeight: 800 }} />
                                        </TableCell>
                                        <TableCell>{item.evaluationCount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Box>
    )
}
