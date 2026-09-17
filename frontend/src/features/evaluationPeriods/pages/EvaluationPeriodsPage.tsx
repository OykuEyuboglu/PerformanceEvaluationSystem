import {
    useEffect,
    useState,
    useCallback,
    useMemo,
} from 'react'

import {
    Box,
    Typography,
    Button,
    IconButton,
    Chip,
    Snackbar,
    Alert,
    LinearProgress,
    Tooltip,
    Stack,
} from '@mui/material'

import {
    Add,
    Edit,
    Delete,
    CalendarMonthOutlined,
    EventAvailableOutlined,
    EventOutlined,
    HistoryOutlined,
} from '@mui/icons-material'

import {
    getEvaluationPeriods,
    createEvaluationPeriod,
    updateEvaluationPeriod,
    deleteEvaluationPeriod,
} from '../evaluationPeriodsApi'

import type { EvaluationPeriod } from '../types'

import EvaluationPeriodFormDialog, {
    type EvaluationPeriodFormValues,
} from '../components/EvaluationPeriodFormDialog'

import ConfirmDialog from '../../../shared/components/ConfirmDialog'

import { useLanguage } from '../../../shared/i18n/LanguageContext'
import { translations } from '../../../shared/i18n/translations'

const formatDate = (
    date: string,
    language: 'tr' | 'en',
) =>
    new Date(date).toLocaleDateString(
        language === 'tr'
            ? 'tr-TR'
            : 'en-US',
        {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        },
    )

const isCurrentPeriod = (
    period: EvaluationPeriod,
) => {
    const now = new Date()
    const start = new Date(period.startDate)
    const end = new Date(period.endDate)

    return start <= now && now <= end
}

const getPeriodStatus = (
    period: EvaluationPeriod,
) => {
    const now = new Date()
    const start = new Date(period.startDate)
    const end = new Date(period.endDate)

    if (start > now) return 'upcoming'
    if (end < now) return 'completed'

    return 'active'
}

export default function EvaluationPeriodsPage() {
    const { language } = useLanguage()
    const t = translations[language]

    const [periods, setPeriods] =
        useState<EvaluationPeriod[]>([])

    const [loading, setLoading] =
        useState(true)

    const [dialogOpen, setDialogOpen] =
        useState(false)

    const [mode, setMode] =
        useState<'create' | 'edit'>('create')

    const [selected, setSelected] =
        useState<EvaluationPeriod | null>(null)

    const [submitting, setSubmitting] =
        useState(false)

    const [deleteTarget, setDeleteTarget] =
        useState<EvaluationPeriod | null>(null)

    const [deleting, setDeleting] =
        useState(false)

    const [snackbar, setSnackbar] = useState<{
        open: boolean
        message: string
        severity: 'success' | 'error'
    }>({
        open: false,
        message: '',
        severity: 'success',
    })

    const loadData = useCallback(async () => {
        setLoading(true)

        try {
            const data =
                await getEvaluationPeriods()

            setPeriods(
                [...data].sort(
                    (a, b) =>
                        new Date(
                            b.startDate,
                        ).getTime() -
                        new Date(
                            a.startDate,
                        ).getTime(),
                ),
            )
        } catch {
            setSnackbar({
                open: true,
                message:
                    t.evaluationPeriods
                        .loadError,
                severity: 'error',
            })
        } finally {
            setLoading(false)
        }
    }, [
        t.evaluationPeriods.loadError,
    ])

    useEffect(() => {
        loadData()
    }, [loadData])

    const showError = (
        err: any,
        fallback: string,
    ) =>
        setSnackbar({
            open: true,
            message:
                err?.response?.data?.message ??
                fallback,
            severity: 'error',
        })

    const handleSubmit = async (
        values: EvaluationPeriodFormValues,
    ) => {
        setSubmitting(true)

        try {
            if (mode === 'create') {
                await createEvaluationPeriod(
                    values,
                )

                setSnackbar({
                    open: true,
                    message:
                        t.evaluationPeriods
                            .periodCreated,
                    severity: 'success',
                })
            } else if (selected) {
                await updateEvaluationPeriod(
                    selected.id,
                    values,
                )

                setSnackbar({
                    open: true,
                    message:
                        t.evaluationPeriods
                            .periodUpdated,
                    severity: 'success',
                })
            }

            setDialogOpen(false)
            await loadData()
        } catch (err) {
            showError(
                err,
                t.evaluationPeriods
                    .operationError,
            )
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return

        setDeleting(true)

        try {
            await deleteEvaluationPeriod(
                deleteTarget.id,
            )

            setSnackbar({
                open: true,
                message:
                    t.evaluationPeriods
                        .periodDeleted,
                severity: 'success',
            })

            setDeleteTarget(null)
            await loadData()
        } catch (err) {
            showError(
                err,
                t.evaluationPeriods
                    .deleteError,
            )
        } finally {
            setDeleting(false)
        }
    }

    const activeCount = useMemo(
        () =>
            periods.filter(
                (period) =>
                    getPeriodStatus(period) ===
                    'active',
            ).length,
        [periods],
    )

    const upcomingCount = useMemo(
        () =>
            periods.filter(
                (period) =>
                    getPeriodStatus(period) ===
                    'upcoming',
            ).length,
        [periods],
    )

    const completedCount = useMemo(
        () =>
            periods.filter(
                (period) =>
                    getPeriodStatus(period) ===
                    'completed',
            ).length,
        [periods],
    )

    return (
        <Box
            sx={{
                width: '100%',
                animation:
                    'periodPageEnter 280ms ease-out',

                '@keyframes periodPageEnter': {
                    from: {
                        opacity: 0,
                        transform:
                            'translateY(6px)',
                    },
                    to: {
                        opacity: 1,
                        transform:
                            'translateY(0)',
                    },
                },
            }}
        >
            {/* PAGE HEADER */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent:
                        'space-between',
                    alignItems: {
                        xs: 'flex-start',
                        md: 'center',
                    },
                    gap: 2,
                    mb: 3,
                    flexWrap: 'wrap',
                }}
            >
                <Box>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        <CalendarMonthOutlined
                            sx={{
                                color: '#C68E00',
                                fontSize: 25,
                            }}
                        />

                        <Typography
                            sx={{
                                fontSize: {
                                    xs: 24,
                                    md: 28,
                                },
                                fontWeight: 850,
                                letterSpacing:
                                    '-0.6px',
                            }}
                        >
                            {
                                t.evaluationPeriods
                                    .title
                            }
                        </Typography>
                    </Box>

                    <Typography
                        color="text.secondary"
                        sx={{
                            mt: 0.6,
                            fontSize: 13.5,
                            maxWidth: 680,
                        }}
                    >
                        {
                            t.evaluationPeriods
                                .description
                        }
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => {
                        setMode('create')
                        setSelected(null)
                        setDialogOpen(true)
                    }}
                    sx={{
                        minHeight: 42,
                        px: 2,
                        borderRadius: 2,
                        bgcolor: '#F5B301',
                        color: '#111',
                        fontWeight: 800,
                        boxShadow: 'none',

                        '&:hover': {
                            bgcolor: '#E0A300',
                            boxShadow:
                                '0 8px 22px rgba(245,179,1,0.18)',
                        },
                    }}
                >
                    {
                        t.evaluationPeriods
                            .newPeriod
                    }
                </Button>
            </Box>

            {/* KPI CARDS */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr 1fr',
                        md: 'repeat(4, 1fr)',
                    },
                    gap: 1.5,
                    mb: 2.5,
                }}
            >
                {[
                    {
                        label:
                            t.evaluationPeriods
                                .totalPeriods,
                        value: periods.length,
                        Icon: HistoryOutlined,
                    },
                    {
                        label:
                            t.evaluationPeriods
                                .active,
                        value: activeCount,
                        Icon: EventAvailableOutlined,
                    },
                    {
                        label:
                            t.evaluationPeriods
                                .upcoming,
                        value: upcomingCount,
                        Icon: EventOutlined,
                    },
                    {
                        label:
                            t.evaluationPeriods
                                .completed,
                        value: completedCount,
                        Icon: CalendarMonthOutlined,
                    },
                ].map(
                    (
                        {
                            label,
                            value,
                            Icon,
                        },
                        index,
                    ) => (
                        <Box
                            key={String(label)}
                            sx={{
                                p: 1.8,
                                border: '1px solid',
                                borderColor:
                                    'divider',
                                borderRadius: 2.5,
                                bgcolor:
                                    'background.paper',
                                animation:
                                    `periodCardEnter 340ms ease-out ${index * 45}ms both`,
                                transition:
                                    'transform 180ms ease, box-shadow 180ms ease',

                                '@keyframes periodCardEnter':
                                {
                                    from: {
                                        opacity: 0,
                                        transform:
                                            'translateY(5px)',
                                    },
                                    to: {
                                        opacity: 1,
                                        transform:
                                            'translateY(0)',
                                    },
                                },

                                '&:hover': {
                                    transform:
                                        'translateY(-2px)',
                                    boxShadow:
                                        '0 8px 24px rgba(0,0,0,0.06)',
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems:
                                        'center',
                                    justifyContent:
                                        'space-between',
                                }}
                            >
                                <Typography
                                    color="text.secondary"
                                    sx={{
                                        fontSize: 11.5,
                                        fontWeight: 700,
                                    }}
                                >
                                    {label}
                                </Typography>

                                <Icon
                                    sx={{
                                        fontSize: 18,
                                        color: '#C68E00',
                                    }}
                                />
                            </Box>

                            <Typography
                                sx={{
                                    mt: 0.5,
                                    fontSize: 23,
                                    fontWeight: 850,
                                    letterSpacing:
                                        '-0.5px',
                                }}
                            >
                                {value}
                            </Typography>
                        </Box>
                    ),
                )}
            </Box>

            {/* CONTENT */}
            {loading ? (
                <Box sx={{ py: 1 }}>
                    <LinearProgress
                        sx={{ borderRadius: 2 }}
                    />
                </Box>
            ) : periods.length === 0 ? (
                <Box
                    sx={{
                        p: 5,
                        textAlign: 'center',
                        border: '1px dashed',
                        borderColor:
                            'divider',
                        borderRadius: 3,
                        bgcolor:
                            'background.paper',
                    }}
                >
                    <CalendarMonthOutlined
                        sx={{
                            fontSize: 34,
                            color: 'text.disabled',
                            mb: 1,
                        }}
                    />

                    <Typography
                        sx={{
                            fontWeight: 800,
                        }}
                    >
                        {
                            t.evaluationPeriods
                                .noPeriods
                        }
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{
                            mt: 0.5,
                            fontSize: 13,
                        }}
                    >
                        {
                            t.evaluationPeriods
                                .noPeriodsDescription
                        }
                    </Typography>
                </Box>
            ) : (
                <Stack spacing={1.25}>
                    {periods.map(
                        (
                            period,
                            index,
                        ) => {
                            const status =
                                getPeriodStatus(
                                    period,
                                )

                            const active =
                                isCurrentPeriod(
                                    period,
                                )

                            return (
                                <Box
                                    key={
                                        period.id
                                    }
                                    sx={{
                                        p: {
                                            xs: 1.7,
                                            md: 2,
                                        },
                                        borderRadius: 2.5,
                                        border: '1px solid',
                                        borderColor:
                                            active
                                                ? 'rgba(46,125,50,0.28)'
                                                : 'divider',
                                        bgcolor:
                                            'background.paper',
                                        display:
                                            'flex',
                                        alignItems:
                                            'center',
                                        justifyContent:
                                            'space-between',
                                        gap: 2,
                                        flexWrap:
                                            'wrap',
                                        animation:
                                            `periodRowEnter 300ms ease-out ${index * 35}ms both`,
                                        transition:
                                            'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',

                                        '@keyframes periodRowEnter':
                                        {
                                            from: {
                                                opacity: 0,
                                                transform:
                                                    'translateY(5px)',
                                            },
                                            to: {
                                                opacity: 1,
                                                transform:
                                                    'translateY(0)',
                                            },
                                        },

                                        '&:hover': {
                                            transform:
                                                'translateX(2px)',
                                            boxShadow:
                                                '0 8px 26px rgba(0,0,0,0.055)',
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display:
                                                'flex',
                                            alignItems:
                                                'center',
                                            gap: 1.5,
                                            minWidth: 0,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 42,
                                                height: 42,
                                                borderRadius: 2,
                                                display:
                                                    'flex',
                                                alignItems:
                                                    'center',
                                                justifyContent:
                                                    'center',
                                                flexShrink: 0,
                                                bgcolor:
                                                    active
                                                        ? 'rgba(46,125,50,0.10)'
                                                        : 'rgba(245,179,1,0.10)',
                                                color:
                                                    active
                                                        ? 'success.main'
                                                        : '#C68E00',
                                            }}
                                        >
                                            {active ? (
                                                <EventAvailableOutlined />
                                            ) : (
                                                <CalendarMonthOutlined />
                                            )}
                                        </Box>

                                        <Box
                                            sx={{
                                                minWidth: 0,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display:
                                                        'flex',
                                                    alignItems:
                                                        'center',
                                                    gap: 0.8,
                                                    flexWrap:
                                                        'wrap',
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontWeight: 800,
                                                        fontSize: 14,
                                                    }}
                                                >
                                                    {
                                                        period.name
                                                    }
                                                </Typography>

                                                <Chip
                                                    size="small"
                                                    label={
                                                        status ===
                                                            'active'
                                                            ? t
                                                                .evaluationPeriods
                                                                .active
                                                            : status ===
                                                                'upcoming'
                                                                ? t
                                                                    .evaluationPeriods
                                                                    .upcoming
                                                                : t
                                                                    .evaluationPeriods
                                                                    .completed
                                                    }
                                                    color={
                                                        status ===
                                                            'active'
                                                            ? 'success'
                                                            : 'default'
                                                    }
                                                    sx={{
                                                        height: 23,
                                                        fontSize: 10.5,
                                                        fontWeight: 750,
                                                    }}
                                                />
                                            </Box>

                                            <Typography
                                                color="text.secondary"
                                                sx={{
                                                    mt: 0.45,
                                                    fontSize: 11.5,
                                                }}
                                            >
                                                {formatDate(
                                                    period.startDate,
                                                    language,
                                                )}{' '}
                                                —{' '}
                                                {formatDate(
                                                    period.endDate,
                                                    language,
                                                )}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box
                                        sx={{
                                            display:
                                                'flex',
                                            gap: 0.3,
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Tooltip
                                            title={
                                                t
                                                    .evaluationPeriods
                                                    .editPeriod
                                            }
                                        >
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    setMode(
                                                        'edit',
                                                    )
                                                    setSelected(
                                                        period,
                                                    )
                                                    setDialogOpen(
                                                        true,
                                                    )
                                                }}
                                                sx={{
                                                    '&:hover':
                                                    {
                                                        bgcolor:
                                                            'rgba(245,179,1,0.10)',
                                                    },
                                                }}
                                            >
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip
                                            title={
                                                t
                                                    .evaluationPeriods
                                                    .deletePeriod
                                            }
                                        >
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    setDeleteTarget(
                                                        period,
                                                    )
                                                }
                                                sx={{
                                                    '&:hover':
                                                    {
                                                        bgcolor:
                                                            'rgba(211,47,47,0.08)',
                                                        color:
                                                            'error.main',
                                                    },
                                                }}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>
                            )
                        },
                    )}
                </Stack>
            )}

            {/* FORM DIALOG */}
            <EvaluationPeriodFormDialog
                open={dialogOpen}
                mode={mode}
                initialData={selected}
                submitting={submitting}
                onSubmit={handleSubmit}
                onClose={() =>
                    setDialogOpen(false)
                }
            />

            {/* DELETE DIALOG */}
            <ConfirmDialog
                open={!!deleteTarget}
                title={
                    t.evaluationPeriods
                        .deleteTitle
                }
                description={
                    language === 'tr'
                        ? `"${deleteTarget?.name}" dönemini silmek istediğine emin misin?`
                        : `Are you sure you want to delete the "${deleteTarget?.name}" period?`
                }
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() =>
                    setDeleteTarget(null)
                }
            />

            {/* SNACKBAR */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() =>
                    setSnackbar((s) => ({
                        ...s,
                        open: false,
                    }))
                }
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
            >
                <Alert
                    severity={
                        snackbar.severity
                    }
                    variant="filled"
                    sx={{
                        borderRadius: 2,
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}