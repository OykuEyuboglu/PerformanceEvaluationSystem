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
        const query = search.trim().toLocaleLowerCase('tr-TR')
        const data = ranking.filter((item) =>
            !query ||
            item.employeeName.toLocaleLowerCase('tr-TR').includes(query) ||
            (item.jobPositionName || '').toLocaleLowerCase('tr-TR').includes(query)
        )

        return [...data].sort((a, b) => {
            let result = 0
            if (sortKey === 'employeeName') result = a.employeeName.localeCompare(b.employeeName, 'tr')
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
                        Dashboard
                    </Button>
                    <Typography variant="h5" sx={{ fontWeight: 850, letterSpacing: '-.35px' }}>
                        Ekip Sıralaması
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: .5, fontSize: 14 }}>
                        Seçilen dönemdeki ekip performansını karşılaştır ve sonuçları incele.
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <TextField
                        select
                        size="small"
                        label="Değerlendirme Dönemi"
                        value={selectedPeriodId}
                        onChange={(e) => setSelectedPeriodId(Number(e.target.value))}
                        sx={{ width: { xs: 220, sm: 450 } }}
                        slotProps={{ inputLabel: { shrink: true } }}
                    >
                        {periods.map((period) => (
                            <MenuItem key={period.id} value={period.id}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {period.name}
                                    {isActivePeriod(period) && <Chip label="Aktif" size="small" color="success" />}
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
                        {exporting ? 'Hazırlanıyor...' : 'Excel'}
                    </Button>
                </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
                <Paper elevation={0} sx={{ p: 2.2, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                    <Typography color="text.secondary" sx={{ fontSize: 10.5, fontWeight: 800 }}>DEĞERLENDİRİLEN</Typography>
                    <Typography sx={{ fontSize: 28, fontWeight: 900, mt: .5 }}>{ranking.length}</Typography>
                    <Typography color="text.secondary" sx={{ fontSize: 11.5 }}>çalışan</Typography>
                </Paper>
                <Paper elevation={0} sx={{ p: 2.2, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                    <Typography color="text.secondary" sx={{ fontSize: 10.5, fontWeight: 800 }}>EKİP ORTALAMASI</Typography>
                    <Typography sx={{ fontSize: 28, fontWeight: 900, mt: .5 }}>{average ? average.toFixed(2) : '—'}</Typography>
                    <Typography color="text.secondary" sx={{ fontSize: 11.5 }}>/ 5</Typography>
                </Paper>
                <Paper elevation={0} sx={{ p: 2.2, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                    <Typography color="text.secondary" sx={{ fontSize: 10.5, fontWeight: 800 }}>DÖNEM</Typography>
                    <Typography sx={{ fontSize: 18, fontWeight: 900, mt: .9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedPeriod?.name || '—'}
                    </Typography>
                    <Typography color="text.secondary" sx={{ fontSize: 11.5 }}>
                        {selectedPeriod ? `${new Date(selectedPeriod.startDate).toLocaleDateString('tr-TR')} – ${new Date(selectedPeriod.endDate).toLocaleDateString('tr-TR')}` : ''}
                    </Typography>
                </Paper>
            </Box>

            {topThree.length > 0 && (
                <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <EmojiEvents sx={{ color: 'primary.main' }} />
                        <Box>
                            <Typography sx={{ fontWeight: 800, fontSize: 16 }}>İlk 3</Typography>
                            <Typography color="text.secondary" sx={{ fontSize: 12 }}>Seçilen dönemin en yüksek skorları.</Typography>
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
                                    <Typography color="text.secondary" sx={{ fontSize: 11.5 }}>#{item.rank} · {item.jobPositionName || 'Pozisyon belirtilmemiş'}</Typography>
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
                            <Typography sx={{ fontWeight: 800, fontSize: 16 }}>Performans Sıralaması</Typography>
                            <Typography color="text.secondary" sx={{ fontSize: 12 }}>Detaylı sonuç tablosu.</Typography>
                        </Box>
                    </Box>
                    <TextField
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Çalışan veya pozisyon ara..."
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
                        <Typography sx={{ fontWeight: 800 }}>Sonuç bulunamadı.</Typography>
                        <Typography color="text.secondary" sx={{ fontSize: 13, mt: .5 }}>
                            Seçilen dönem veya arama kriteri için gösterilecek kayıt yok.
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 800 }}>
                                        <TableSortLabel active={sortKey === 'rank'} direction={sortKey === 'rank' ? order : 'asc'} onClick={() => requestSort('rank')}>
                                            Sıra
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>
                                        <TableSortLabel active={sortKey === 'employeeName'} direction={sortKey === 'employeeName' ? order : 'asc'} onClick={() => requestSort('employeeName')}>
                                            Çalışan
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>Pozisyon</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>
                                        <TableSortLabel active={sortKey === 'averageScore'} direction={sortKey === 'averageScore' ? order : 'desc'} onClick={() => requestSort('averageScore')}>
                                            Ortalama
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>
                                        <TableSortLabel active={sortKey === 'evaluationCount'} direction={sortKey === 'evaluationCount' ? order : 'desc'} onClick={() => requestSort('evaluationCount')}>
                                            Değerlendirme
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
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: 12, fontWeight: 800 }}>
                                                    {item.employeeName.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Typography sx={{ fontWeight: 750 }}>{item.employeeName}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell color="text.secondary">{item.jobPositionName || '—'}</TableCell>
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
