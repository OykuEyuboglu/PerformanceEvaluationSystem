import {
    useEffect,
    useState,
    useCallback,
    useMemo,
    type ReactNode,
} from 'react'
import { useSearchParams } from 'react-router-dom'

import {
    Box,
    Typography,
    Chip,
    TextField,
    MenuItem,
    Paper,
    Avatar,
    InputAdornment,
    IconButton,
    Tooltip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Snackbar,
    Alert,
    CircularProgress,
} from '@mui/material'

import {
    Search,
    AssessmentOutlined,
    CheckCircleOutlined,
    TrendingUpOutlined,
    VisibilityOutlined,
} from '@mui/icons-material'

import {
    DataGrid,
    type GridColDef,
    type GridRenderCellParams,
    type GridRowSelectionModel,
} from '@mui/x-data-grid'

import {
    getAllEvaluations,
    approveEvaluation,
    approveBulk,
    getEvaluationById,
} from '../evaluationsApi'

import { getEvaluationPeriods } from '../../evaluationPeriods/evaluationPeriodsApi'

import type { EvaluationDto } from '../types'
import type { EvaluationPeriod } from '../../evaluationPeriods/types'

import EvaluationDetailDialog from '../components/EvaluationDetailDialog'
import { useLanguage } from '../../../shared/i18n/LanguageContext'
import { translations } from '../../../shared/i18n/translations'

const STATUS_COLORS: Record<
    string,
    'info' | 'success'
> = {
    Submitted: 'info',
    Approved: 'success',
}

function getInitials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) =>
            part.charAt(0).toUpperCase()
        )
        .join('')
}

function getScoreTone(score: number) {
    if (score >= 4) return 'success.main'
    if (score >= 3) return 'primary.main'
    if (score >= 2) return 'warning.main'
    return 'error.main'
}

type KpiCardProps = {
    label: string
    value: string | number
    caption: string
    icon: ReactNode
}

function KpiCard({
    label,
    value,
    caption,
    icon,
}: KpiCardProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.25,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                minWidth: 0,
                height: '100%',
                transition:
                    'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow:
                        '0 10px 26px rgba(0,0,0,0.06)',
                    borderColor:
                        'rgba(245,179,1,0.45)',
                },
            }}
        >
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
                            fontSize: 12.5,
                            color: 'text.secondary',
                            fontWeight: 600,
                            mb: 0.8,
                        }}
                    >
                        {label}
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: {
                                xs: 24,
                                sm: 27,
                            },
                            lineHeight: 1,
                            fontWeight: 800,
                            letterSpacing: -0.5,
                        }}
                    >
                        {value}
                    </Typography>

                    <Typography
                        sx={{
                            mt: 0.8,
                            fontSize: 11.5,
                            color: 'text.secondary',
                        }}
                    >
                        {caption}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        flexShrink: 0,
                        borderRadius: 2,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor:
                            'rgba(245,179,1,0.13)',
                        color: 'primary.main',
                    }}
                >
                    {icon}
                </Box>
            </Box>
        </Paper>
    )
}

export default function EvaluationsPage() {
    const [searchParams] = useSearchParams()
    const { language } = useLanguage()
    const t = translations[language]

    const [evaluations, setEvaluations] =
        useState<EvaluationDto[]>([])

    const [periods, setPeriods] =
        useState<EvaluationPeriod[]>([])

    const [periodFilter, setPeriodFilter] =
        useState('all')

    const [search, setSearch] = useState('')

    const [loading, setLoading] =
        useState(true)

    const [selected, setSelected] =
        useState<EvaluationDto | null>(null)

    const [approving, setApproving] =
        useState(false)

    const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({
        type: 'include',
        ids: new Set(),
    })
    const [bulkApproving, setBulkApproving] = useState(false)
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success',
    })
    const [bulkApproveDialogOpen, setBulkApproveDialogOpen] = useState(false)

    const loadData = useCallback(async (periodIdFilter?: number) => {
        setLoading(true)
        try {
            const [evalData, periodData] = await Promise.all([
                getAllEvaluations(periodIdFilter),
                getEvaluationPeriods(),
            ])
            setEvaluations(evalData)
            setPeriods(periodData)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadData()
    }, [loadData])

    useEffect(() => {
        if (!periods.length) return

        const periodId =
            searchParams.get('periodId')

        if (!periodId) return

        const selectedPeriod = periods.find(
            (period) =>
                period.id === Number(periodId)
        )

        if (selectedPeriod) {
            setPeriodFilter(
                selectedPeriod.name
            )
        }
    }, [periods, searchParams])

    const handleRowClick = async (params: any) => {
        try {
            const full = await getEvaluationById(params.row.id)
            setSelected(full)
        } catch {
            setSnackbar({
                open: true,
                message: t.evaluation.loadDetailError,
                severity: 'error',
            })
        }
    }

    const isRowSelected = (id: number) => {
        if (selectionModel.type === 'include') {
            return selectionModel.ids.has(id)
        }

        return !selectionModel.ids.has(id)
    }

    const selectedSubmittedCount = evaluations.filter(
        (evaluation) =>
            isRowSelected(evaluation.id) &&
            evaluation.status === 'Submitted'
    ).length

    const selectedEvaluationIds = evaluations
        .filter((evaluation) => isRowSelected(evaluation.id))
        .map((evaluation) => evaluation.id)

    const handleBulkApprove = async () => {
        if (!selectedEvaluationIds.length) return

        setBulkApproving(true)

        try {
            const { approvedCount } = await approveBulk(selectedEvaluationIds)

            setSnackbar({
                open: true,
                message: `${approvedCount} ${t.evaluation.approvedCountSuffix}`,
                severity: 'success',
            })

            setSelectionModel({
                type: 'include',
                ids: new Set(),
            })

            setBulkApproveDialogOpen(false)

            await loadData(
                periods.find((period) => period.name === periodFilter)?.id
            )
        } catch {
            setSnackbar({
                open: true,
                message: t.evaluation.bulkApproveError,
                severity: 'error',
            })
        } finally {
            setBulkApproving(false)
        }
    }

    const handleApprove = async (id: number) => {
        setApproving(true)

        try {
            const updated =
                await approveEvaluation(id)

            setEvaluations((prev) =>
                prev.map((evaluation) =>
                    evaluation.id === id
                        ? updated
                        : evaluation
                )
            )

            setSelected(updated)
        } catch (error) {
            console.error(
                t.evaluation.approveErrorConsole,
                error
            )
        } finally {
            setApproving(false)
        }
    }

    const filtered = useMemo(() => {
        const q = search
            .trim()
            .toLowerCase()

        return evaluations.filter((e) => {
            if (
                periodFilter !== 'all' &&
                e.evaluationPeriodName !==
                periodFilter
            ) {
                return false
            }

            if (!q) return true

            return (
                e.employeeName
                    .toLowerCase()
                    .includes(q) ||
                e.evaluatorName
                    .toLowerCase()
                    .includes(q) ||
                e.evaluationPeriodName
                    .toLowerCase()
                    .includes(q)
            )
        })
    }, [
        evaluations,
        periodFilter,
        search,
    ])

    const stats = useMemo(() => {
        const total = filtered.length

        const average = total
            ? filtered.reduce(
                (sum, e) =>
                    sum + e.totalScore,
                0
            ) / total
            : 0

        const approved =
            filtered.filter(
                (e) =>
                    e.status === 'Approved'
            ).length

        const submitted =
            filtered.filter(
                (e) =>
                    e.status === 'Submitted'
            ).length

        return {
            total,
            average,
            approved,
            submitted,
        }
    }, [filtered])

    const columns = useMemo<
        GridColDef<EvaluationDto>[]
    >(
        () => [
            {
                field: 'employeeName',
                headerName: t.evaluation.employee,
                flex: 1.15,
                minWidth: 190,
                renderCell: (
                    params: GridRenderCellParams<
                        EvaluationDto,
                        string
                    >
                ) => (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.25,
                            minWidth: 0,
                            width: '100%',
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 32,
                                height: 32,
                                fontSize: 11.5,
                                fontWeight: 800,
                                bgcolor:
                                    '#bdbdbd',
                                color: 'text.primary',
                                flexShrink: 0,
                            }}
                        >
                            {getInitials(
                                params.value ?? ''
                            )}
                        </Avatar>

                        <Typography
                            sx={{
                                fontSize: 13.5,
                                fontWeight: 650,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow:
                                    'ellipsis',
                            }}
                        >
                            {params.value}
                        </Typography>
                    </Box>
                ),
            },

            {
                field: 'evaluatorName',
                headerName: t.evaluation.evaluator,
                flex: 1.1,
                minWidth: 180,
            },

            {
                field: 'evaluationPeriodName',
                headerName: t.evaluation.periodShort,
                flex: 1.15,
                minWidth: 170,
                renderCell: (params) => (
                    <Typography
                        sx={{
                            fontSize: 13,
                            color: 'text.secondary',
                        }}
                    >
                        {params.value}
                    </Typography>
                ),
            },

            {
                field: 'totalScore',
                headerName: t.evaluation.totalScore,
                flex: 0.8,
                minWidth: 125,
                renderCell: (params) => {
                    const score =
                        Number(params.value)

                    return (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems:
                                    'center',
                                gap: 0.8,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 7,
                                    height: 7,
                                    borderRadius:
                                        '50%',
                                    bgcolor:
                                        getScoreTone(
                                            score
                                        ),
                                    flexShrink: 0,
                                }}
                            />

                            <Typography
                                sx={{
                                    fontWeight: 800,
                                    fontSize: 13.5,
                                }}
                            >
                                {score.toFixed(2)}
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: 11.5,
                                    color:
                                        'text.secondary',
                                }}
                            >
                                / 5
                            </Typography>
                        </Box>
                    )
                },
            },

            {
                field: 'status',
                headerName: t.evaluation.status,
                flex: 0.85,
                minWidth: 125,
                renderCell: (params) => (
                    <Chip
                        size="small"
                        label={
                            params.value === 'Submitted'
                                ? t.evaluation.submitted
                                : params.value === 'Approved'
                                    ? t.evaluation.approved
                                    : params.value
                        }
                        color={
                            STATUS_COLORS[
                            params.value
                            ] ?? 'default'
                        }
                        variant={
                            params.value ===
                                'Approved'
                                ? 'filled'
                                : 'outlined'
                        }
                        sx={{
                            fontWeight: 700,
                            borderRadius: 1.5,
                            fontSize: 11.5,
                        }}
                    />
                ),
            },

            {
                field: 'createdAt',
                headerName: t.evaluation.date,
                flex: 0.85,
                minWidth: 115,
                valueFormatter: (value) =>
                    value
                        ? new Date(
                            value
                        ).toLocaleDateString(
                            language === 'tr' ? 'tr-TR' : 'en-US'
                        )
                        : '-',
            },

            {
                field: 'actions',
                headerName: '',
                width: 64,
                sortable: false,
                filterable: false,
                disableColumnMenu: true,
                renderCell: (params) => (
                    <Tooltip title={t.evaluation.viewDetails}>
                        <IconButton
                            size="small"
                            onClick={(event) => {
                                event.stopPropagation()
                                void handleRowClick(params)
                            }}
                            sx={{
                                color:
                                    'text.secondary',
                                '&:hover': {
                                    color:
                                        'primary.main',
                                    bgcolor:
                                        'rgba(245,179,1,0.10)',
                                },
                            }}
                        >
                            <VisibilityOutlined fontSize="small" />
                        </IconButton>
                    </Tooltip>
                ),
            },
        ],
        [handleRowClick, language]
    )

    return (
        <Box
            sx={{
                animation:
                    'evaluationsEnter 260ms ease-out',
                '@keyframes evaluationsEnter': {
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
                            alignItems:
                                'center',
                            gap: 1.25,
                        }}
                    >
                        <Box
                            sx={{
                                width: 42,
                                height: 42,
                                borderRadius: 2.25,
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor:
                                    'primary.main',
                                color:
                                    'primary.contrastText',
                                boxShadow:
                                    '0 8px 20px rgba(245,179,1,0.20)',
                            }}
                        >
                            <AssessmentOutlined fontSize="small" />
                        </Box>

                        <Box>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 800,
                                    letterSpacing:
                                        -0.35,
                                }}
                            >
                                {t.evaluation.title}
                            </Typography>

                            <Typography
                                color="text.secondary"
                                sx={{
                                    mt: 0.25,
                                    fontSize: 13.5,
                                }}
                            >
                                {t.evaluation.description}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <TextField
                    select
                    size="small"
                    label={t.evaluation.period}
                    value={periodFilter}
                    onChange={(e) =>
                        setPeriodFilter(
                            e.target.value
                        )
                    }
                    sx={{
                        minWidth: {
                            xs: '100%',
                            sm: 230,
                        },
                        '& .MuiOutlinedInput-root':
                        {
                            borderRadius: 2,
                        },
                    }}
                >
                    <MenuItem value="all">
                        {t.evaluation.allPeriods}
                    </MenuItem>

                    {periods.map((period) => (
                        <MenuItem
                            key={period.id}
                            value={period.name}
                        >
                            {period.name}
                        </MenuItem>
                    ))}
                </TextField>
            </Box>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        lg: 'repeat(4, 1fr)',
                    },
                    gap: 1.75,
                    mb: 2.5,
                }}
            >
                <KpiCard
                    label={t.evaluation.totalEvaluations}
                    value={stats.total}
                    caption={t.evaluation.filteredRecords}
                    icon={
                        <AssessmentOutlined fontSize="small" />
                    }
                />

                <KpiCard
                    label={t.evaluation.averageScore}
                    value={`${stats.average.toFixed(
                        2
                    )} / 5`}
                    caption={t.evaluation.overallAverage}
                    icon={
                        <TrendingUpOutlined fontSize="small" />
                    }
                />

                <KpiCard
                    label={t.evaluation.approved}
                    value={stats.approved}
                    caption={`${stats.total
                        ? Math.round(
                            (stats.approved /
                                stats.total) *
                            100
                        )
                        : 0
                        }% ${t.evaluation.approvalRate}`
                    }
                    icon={
                        <CheckCircleOutlined fontSize="small" />
                    }
                />
            </Box>

            <Paper
                elevation={0}
                sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    overflow: 'hidden',
                }}
            >
                <Box
                    sx={{
                        px: {
                            xs: 1.5,
                            md: 2.25,
                        },
                        py: 1.75,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems:
                            'center',
                        justifyContent:
                            'space-between',
                        gap: 2,
                        flexWrap: 'wrap',
                    }}
                >
                    <Box>
                        <Typography
                            sx={{
                                fontWeight: 750,
                                fontSize: 14.5,
                            }}
                        >
                            {t.evaluation.recordsTitle}
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{
                                fontSize: 11.5,
                                mt: 0.25,
                            }}
                        >
                            {filtered.length}{' '}
                            {t.evaluation.recordsListed}
                        </Typography>
                    </Box>

                    <TextField
                        size="small"
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        placeholder={t.evaluation.searchPlaceholder}
                        sx={{
                            width: {
                                xs: '100%',
                                sm: 330,
                            },
                            '& .MuiOutlinedInput-root':
                            {
                                borderRadius: 2,
                                fontSize: 13,
                            },
                        }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search
                                            fontSize="small"
                                            sx={{
                                                color:
                                                    'text.secondary',
                                            }}
                                        />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    {selectedSubmittedCount > 0 && (
                        <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={
                                bulkApproving ? (
                                    <CircularProgress size={16} sx={{ color: '#fff' }} />
                                ) : (
                                    <CheckCircleOutlined />
                                )
                            }
                            disabled={bulkApproving}
                            onClick={() => setBulkApproveDialogOpen(true)}
                            sx={{ borderRadius: 2, flexShrink: 0 }}
                        >
                            {bulkApproving
                                ? t.evaluation.approving
                                : `${t.evaluation.approveSelected} (${selectedSubmittedCount})`}
                        </Button>
                    )}
                </Box>

                <DataGrid
                    rows={filtered}
                    columns={columns}
                    loading={loading}
                    getRowId={(row) => row.id}
                    autoHeight
                    checkboxSelection
                    disableRowSelectionOnClick
                    onRowClick={handleRowClick}
                    rowSelectionModel={selectionModel}
                    onRowSelectionModelChange={(newSelection) =>
                        setSelectionModel(newSelection)
                    }
                    pageSizeOptions={[
                        10,
                        25,
                        50,
                    ]}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 10,
                            },
                        },
                        sorting: {
                            sortModel: [
                                {
                                    field: 'createdAt',
                                    sort: 'desc',
                                },
                            ],
                        },
                    }}
                    localeText={{
                        noRowsLabel:
                            t.evaluation.gridNoRows,
                        noResultsOverlayLabel:
                            t.evaluation.gridNoResults,

                        footerRowSelected:
                            (count) =>
                                `${count.toLocaleString()} ${t.evaluation.gridRowSelected}`,

                        footerTotalRows:
                            t.evaluation.gridTotalRows,

                        footerTotalVisibleRows:
                            (
                                visibleCount,
                                totalCount
                            ) =>
                                `${visibleCount.toLocaleString()} / ${totalCount.toLocaleString()}`,

                        columnMenuLabel:
                            t.evaluation.gridColumnMenu,
                        columnMenuShowColumns:
                            t.evaluation.gridShowColumns,
                        columnMenuManageColumns:
                            t.evaluation.gridManageColumns,
                        columnMenuFilter:
                            t.evaluation.gridFilter,
                        columnMenuHideColumn:
                            t.evaluation.gridHideColumn,
                        columnMenuUnsort:
                            t.evaluation.gridUnsort,
                        columnMenuSortAsc:
                            t.evaluation.gridSortAsc,
                        columnMenuSortDesc:
                            t.evaluation.gridSortDesc,

                        filterPanelAddFilter:
                            t.evaluation.gridAddFilter,
                        filterPanelDeleteIconLabel:
                            t.evaluation.gridDelete,
                        filterPanelColumn:
                            t.evaluation.gridColumn,
                        filterPanelInputLabel:
                            t.evaluation.gridValue,
                        filterPanelInputPlaceholder:
                            t.evaluation.gridFilterValue,

                        filterOperatorContains:
                            t.evaluation.gridContains,
                        filterOperatorEquals:
                            t.evaluation.gridEquals,
                        filterOperatorStartsWith:
                            t.evaluation.gridStartsWith,
                        filterOperatorEndsWith:
                            t.evaluation.gridEndsWith,
                        filterOperatorIs:
                            t.evaluation.gridEquals,
                        filterOperatorNot:
                            t.evaluation.gridNotEqual,
                        filterOperatorAfter:
                            t.evaluation.gridAfter,
                        filterOperatorOnOrAfter:
                            t.evaluation.gridAfterOrEqual,
                        filterOperatorBefore:
                            t.evaluation.gridBefore,
                        filterOperatorOnOrBefore:
                            t.evaluation.gridBeforeOrEqual,
                        filterOperatorIsEmpty:
                            t.evaluation.gridEmpty,
                        filterOperatorIsNotEmpty:
                            t.evaluation.gridNotEmpty,
                        filterOperatorIsAnyOf:
                            t.evaluation.gridAnyOf,

                        columnHeaderSortIconLabel:
                            t.evaluation.gridSortHint,

                        checkboxSelectionHeaderName:
                            t.evaluation.gridSelect,
                        checkboxSelectionSelectAllRows:
                            t.evaluation.gridSelectAll,
                        checkboxSelectionUnselectAllRows:
                            t.evaluation.gridUnselectAll,

                        toolbarExport:
                            t.evaluation.gridExport,
                        toolbarExportCSV:
                            t.evaluation.gridExportCsv,
                        toolbarExportPrint:
                            t.evaluation.gridPrint,
                        toolbarColumns:
                            t.evaluation.gridColumns,
                        toolbarFilters:
                            t.evaluation.gridFilters,
                        toolbarDensity:
                            t.evaluation.gridDensity,
                        toolbarDensityLabel:
                            t.evaluation.gridDensity,
                        toolbarDensityCompact:
                            t.evaluation.gridCompact,
                        toolbarDensityStandard:
                            t.evaluation.gridStandard,
                        toolbarDensityComfortable:
                            t.evaluation.gridComfortable,

                        filterPanelOperator:
                            t.evaluation.gridOperator,
                        filterPanelLogicOperator:
                            t.evaluation.gridLogicOperator,
                        filterPanelOperatorAnd:
                            t.evaluation.gridAnd,
                        filterPanelOperatorOr:
                            t.evaluation.gridOr,
                    }}
                    sx={{
                        border: 'none',

                        '& .MuiDataGrid-columnHeaders':
                        {
                            bgcolor:
                                'background.default',
                            borderBottom:
                                '1px solid',
                            borderColor:
                                'divider',
                        },

                        '& .MuiDataGrid-columnHeaderTitle':
                        {
                            fontWeight: 750,
                            fontSize: 12,
                        },

                        '& .MuiDataGrid-cell':
                        {
                            borderColor:
                                'divider',
                            display: 'flex',
                            alignItems:
                                'center',
                        },

                        '& .MuiDataGrid-row':
                        {
                            transition:
                                'background-color 140ms ease',
                            cursor: 'pointer',
                        },

                        '& .MuiDataGrid-row:hover':
                        {
                            bgcolor:
                                'rgba(245,179,1,0.045)',
                        },

                        '& .MuiDataGrid-footerContainer':
                        {
                            borderTop:
                                '1px solid',
                            borderColor:
                                'divider',
                        },
                    }}
                />
            </Paper>

            <EvaluationDetailDialog
                open={!!selected}
                evaluation={selected}
                onClose={() =>
                    setSelected(null)
                }
                canApprove
                onApprove={handleApprove}
                approving={approving}
            />

            <Dialog
                open={bulkApproveDialogOpen}
                onClose={() => !bulkApproving && setBulkApproveDialogOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>{t.evaluation.bulkDialogTitle}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {
                            t.evaluation.bulkDialogDescription
                                .replace(
                                    '{count}',
                                    String(selectedSubmittedCount),
                                )
                        }
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setBulkApproveDialogOpen(false)}
                        disabled={bulkApproving}
                    >
                        {t.evaluation.cancel}
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleBulkApprove}
                        disabled={bulkApproving}
                        startIcon={
                            bulkApproving ? (
                                <CircularProgress size={16} sx={{ color: '#fff' }} />
                            ) : (
                                <CheckCircleOutlined />
                            )
                        }
                    >
                        {bulkApproving ? t.evaluation.approving : t.evaluation.approve}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3500}
                onClose={() =>
                    setSnackbar((prev) => ({ ...prev, open: false }))
                }
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    variant="filled"
                    onClose={() =>
                        setSnackbar((prev) => ({ ...prev, open: false }))
                    }
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}