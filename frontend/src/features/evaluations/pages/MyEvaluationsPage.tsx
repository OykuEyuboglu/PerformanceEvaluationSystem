import { useEffect, useMemo, useState } from 'react'
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Chip,
    InputAdornment,
    Pagination,
    TextField,
} from '@mui/material'
import { LineChart } from '@mui/x-charts/LineChart'
import { getMyEvaluations } from '../evaluationsApi'
import type { EvaluationDto } from '../types'
import EvaluationDetailDialog from '../components/EvaluationDetailDialog'
import { useLanguage } from '../../../shared/i18n/LanguageContext'
import { translations } from '../../../shared/i18n/translations'

import {
    Search,
    TrendingUp,
} from '@mui/icons-material'

const STATUS_COLORS: Record<
    string,
    'info' | 'success'
> = {
    Submitted: 'info',
    Approved: 'success',
}

export default function MyEvaluationsPage() {
    const { language } = useLanguage()
    const t = translations[language]
    const [evaluations, setEvaluations] = useState<EvaluationDto[]>([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] =
        useState<EvaluationDto | null>(null)

    const [historySearch, setHistorySearch] = useState('')
    const [historyPage, setHistoryPage] = useState(1)

    const historyRowsPerPage = 5

    const filteredHistory = useMemo(() => {
        const search = historySearch.trim().toLocaleLowerCase(language === 'tr' ? 'tr-TR' : 'en-US')

        return [...evaluations]
            .sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            )
            .filter((evaluation) => {
                if (!search) return true

                return (
                    evaluation.evaluationPeriodName
                        .toLocaleLowerCase('tr-TR')
                        .includes(search) ||
                    evaluation.evaluatorName
                        .toLocaleLowerCase('tr-TR')
                        .includes(search)
                )
            })
    }, [evaluations, historySearch])

    const historyPageCount = Math.ceil(
        filteredHistory.length / historyRowsPerPage
    )

    const paginatedHistory = filteredHistory.slice(
        (historyPage - 1) * historyRowsPerPage,
        historyPage * historyRowsPerPage
    )

    useEffect(() => {
        setHistoryPage(1)
    }, [historySearch])

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getMyEvaluations()

                const sorted = [...data].sort(
                    (a, b) =>
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()
                )

                setEvaluations(sorted)
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [])

    useEffect(() => {
        if (window.location.hash !== '#history') return

        const timer = setTimeout(() => {
            const element =
                document.getElementById('history')

            element?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            })
        }, 300)

        return () => clearTimeout(timer)
    }, [])

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    py: 6,
                }}
            >
                <CircularProgress />
            </Box>
        )
    }

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <TrendingUp
                        sx={{
                            fontSize: 28,
                            color: 'primary.main',
                        }}
                    />

                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 800,
                            letterSpacing: '-0.3px',
                        }}
                    >
                        {t.myEvaluations.title}
                    </Typography>
                </Box>

                <Typography
                    color="text.secondary"
                    sx={{
                        mt: 0.5,
                        fontSize: 14.5,
                    }}
                >
                    {t.myEvaluations.description}
                </Typography>
            </Box>

            {evaluations.length === 0 ? (
                <Paper
                    elevation={0}
                    sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 3,
                        p: { xs: 4, md: 6 },
                        textAlign: 'center',
                    }}
                >
                    <Typography
                        color="text.secondary"
                        sx={{ fontSize: 14 }}
                    >
                        {t.myEvaluations.noEvaluations}
                    </Typography>
                </Paper>
            ) : (
                <>
                    {/* PERFORMANCE CHART */}
                    <Paper
                        elevation={0}
                        sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 3,
                            p: {
                                xs: 2,
                                sm: 2.5,
                                md: 3,
                            },
                            mb: 3,
                            overflow: 'hidden',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent:
                                    'space-between',
                                gap: 2,
                                mb: 1,
                            }}
                        >
                            <Box>
                                <Typography
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: 16,
                                    }}
                                >
                                    {t.myEvaluations.scoreProgress}
                                </Typography>

                                <Typography
                                    color="text.secondary"
                                    sx={{
                                        fontSize: 12,
                                        mt: 0.35,
                                    }}
                                >
                                    {t.myEvaluations.scoreProgressDescription}
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: 2,
                                    bgcolor:
                                        'rgba(245,179,1,0.10)',
                                    color: 'primary.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent:
                                        'center',
                                    flexShrink: 0,
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: 18,
                                        fontWeight: 900,
                                    }}
                                >
                                    ↗
                                </Typography>
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                width: '100%',
                                minWidth: 0,
                                mt: 1,
                            }}
                        >
                            <LineChart
                                height={300}
                                margin={{
                                    top: 25,
                                    right: 25,
                                    bottom: 55,
                                    left: 45,
                                }}
                                xAxis={[
                                    {
                                        scaleType: 'point',
                                        data: evaluations.map(
                                            (evaluation) =>
                                                evaluation.evaluationPeriodName
                                        ),
                                        tickLabelStyle: {
                                            fontSize: 10,
                                        },
                                    },
                                ]}
                                yAxis={[
                                    {
                                        min: 0,
                                        max: 5,
                                        tickNumber: 5,
                                        tickLabelStyle: {
                                            fontSize: 10,
                                        },
                                    },
                                ]}
                                series={[
                                    {
                                        data: evaluations.map(
                                            (evaluation) =>
                                                evaluation.totalScore
                                        ),
                                        label: t.myEvaluations.totalScore,
                                        color: '#F5B301',
                                        curve: 'monotoneX',
                                        showMark: true,
                                    },
                                ]}
                                grid={{
                                    horizontal: true,
                                }}
                                skipAnimation={false}
                                sx={{
                                    '& .MuiChartsAxis-line': {
                                        stroke: 'currentColor',
                                        opacity: 0.12,
                                    },

                                    '& .MuiChartsAxis-tick': {
                                        stroke: 'currentColor',
                                        opacity: 0.12,
                                    },

                                    '& .MuiChartsGrid-line': {
                                        stroke: 'currentColor',
                                        opacity: 0.08,
                                    },

                                    '& .MuiLineElement-root': {
                                        strokeWidth: 3,
                                    },

                                    '& .MuiMarkElement-root': {
                                        stroke: '#F5B301',
                                        strokeWidth: 2,
                                        fill: '#ffffff',
                                    },

                                    '& .MuiChartsLegend-root': {
                                        fontSize: 11,
                                    },
                                }}
                            />
                        </Box>
                    </Paper>

                    {/* EVALUATION HISTORY */}
                    <Paper
                        id="history"
                        elevation={0}
                        sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 3,
                            overflow: 'hidden',
                            scrollMarginTop: 90,
                        }}
                    >
                        {/* HEADER */}
                        <Box
                            sx={{
                                px: { xs: 2, md: 3 },
                                py: 2,
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                display: 'flex',
                                alignItems: { xs: 'flex-start', sm: 'center' },
                                justifyContent: 'space-between',
                                gap: 2,
                            }}
                        >
                            <Box sx={{ minWidth: 0 }}>
                                <Typography
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: 16,
                                    }}
                                >
                                    {t.myEvaluations.historyTitle}
                                </Typography>

                                <Typography
                                    color="text.secondary"
                                    sx={{
                                        fontSize: 12,
                                        mt: 0.3,
                                    }}
                                >
                                    {t.myEvaluations.historyDescription}
                                </Typography>
                            </Box>

                            <Chip
                                size="small"
                                label={`${filteredHistory.length} / ${evaluations.length}`}
                                sx={{
                                    height: 26,
                                    fontSize: 10,
                                    fontWeight: 700,
                                    bgcolor: 'rgba(245,179,1,0.10)',
                                    color: 'text.primary',
                                    borderRadius: 1.5,
                                    flexShrink: 0,
                                }}
                            />
                        </Box>

                        {/* SEARCH */}
                        <Box
                            sx={{
                                px: { xs: 2, md: 3 },
                                py: 1.5,
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <TextField
                                fullWidth
                                size="small"
                                value={historySearch}
                                onChange={(event) =>
                                    setHistorySearch(event.target.value)
                                }
                                placeholder={t.myEvaluations.searchPlaceholder}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search
                                                    fontSize="small"
                                                    sx={{
                                                        color: 'text.secondary',
                                                    }}
                                                />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        fontSize: 13,
                                    },
                                }}
                            />
                        </Box>

                        {/* RESULTS */}
                        {paginatedHistory.length > 0 ? (
                            paginatedHistory.map((evaluation) => (
                                <Box
                                    key={evaluation.id}
                                    onClick={() => setSelected(evaluation)}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: 2,
                                        px: { xs: 2, md: 3 },
                                        py: 2,
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                        cursor: 'pointer',
                                        transition:
                                            'background-color 0.15s ease, transform 0.15s ease',
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                        },
                                        '&:last-child': {
                                            borderBottom: 'none',
                                        },
                                    }}
                                >
                                    {/* LEFT */}
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: 14,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {evaluation.evaluationPeriodName}
                                        </Typography>

                                        <Typography
                                            color="text.secondary"
                                            sx={{
                                                fontSize: 12,
                                                mt: 0.35,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {t.myEvaluations.evaluator}:{' '}
                                            {evaluation.evaluatorName}
                                            {' · '}
                                            {new Date(
                                                evaluation.createdAt
                                            ).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
                                        </Typography>
                                    </Box>

                                    {/* RIGHT */}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: {
                                                xs: 1,
                                                sm: 1.5,
                                            },
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Chip
                                            size="small"
                                            label={
                                                evaluation.status === 'Submitted'
                                                    ? t.myEvaluations.submitted
                                                    : evaluation.status === 'Approved'
                                                        ? t.myEvaluations.approved
                                                        : evaluation.status
                                            }
                                            color={
                                                STATUS_COLORS[
                                                evaluation.status
                                                ] ?? 'default'
                                            }
                                            sx={{
                                                fontWeight: 600,
                                                display: {
                                                    xs: 'none',
                                                    sm: 'flex',
                                                },
                                            }}
                                        />

                                        <Typography
                                            sx={{
                                                fontWeight: 800,
                                                fontSize: 14,
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {evaluation.totalScore.toFixed(2)} / 5
                                        </Typography>
                                    </Box>
                                </Box>
                            ))
                        ) : (
                            /* EMPTY SEARCH RESULT */
                            <Box
                                sx={{
                                    px: 3,
                                    py: 6,
                                    textAlign: 'center',
                                }}
                            >
                                <Search
                                    sx={{
                                        fontSize: 34,
                                        color: 'text.disabled',
                                        mb: 1,
                                    }}
                                />

                                <Typography
                                    sx={{
                                        fontWeight: 700,
                                        fontSize: 14,
                                    }}
                                >
                                    {t.myEvaluations.noSearchResults}
                                </Typography>

                                <Typography
                                    color="text.secondary"
                                    sx={{
                                        fontSize: 12,
                                        mt: 0.5,
                                    }}
                                >
                                    {t.myEvaluations.noSearchResultsDescription}
                                </Typography>
                            </Box>
                        )}

                        {/* PAGINATION */}
                        {historyPageCount > 1 && (
                            <Box
                                sx={{
                                    px: { xs: 2, md: 3 },
                                    py: 1.5,
                                    borderTop: '1px solid',
                                    borderColor: 'divider',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 2,
                                }}
                            >
                                <Typography
                                    color="text.secondary"
                                    sx={{
                                        fontSize: 11,
                                        display: {
                                            xs: 'none',
                                            sm: 'block',
                                        },
                                    }}
                                >
                                    {filteredHistory.length} {t.myEvaluations.evaluations}
                                </Typography>

                                <Pagination
                                    page={historyPage}
                                    count={historyPageCount}
                                    onChange={(_, page) =>
                                        setHistoryPage(page)
                                    }
                                    size="small"
                                    shape="rounded"
                                    sx={{
                                        ml: 'auto',
                                        '& .MuiPaginationItem-root': {
                                            fontSize: 12,
                                            fontWeight: 600,
                                        },
                                        '& .Mui-selected': {
                                            bgcolor: '#F5B301 !important',
                                            color: '#111',
                                        },
                                    }}
                                />
                            </Box>
                        )}
                    </Paper>
                </>
            )}

            <EvaluationDetailDialog
                open={!!selected}
                evaluation={selected}
                onClose={() => setSelected(null)}
            />
        </Box>
    )
}