import { useEffect, useState, useCallback, useMemo, type ReactNode } from 'react'
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
} from '@mui/material'
import {
    Search,
    AssessmentOutlined,
    CheckCircleOutlined,
    PendingActionsOutlined,
    TrendingUpOutlined,
    VisibilityOutlined,
} from '@mui/icons-material'
import {
    DataGrid,
    type GridColDef,
    type GridRenderCellParams,
} from '@mui/x-data-grid'
import { getAllEvaluations } from '../evaluationsApi'
import { getEvaluationPeriods } from '../../evaluationPeriods/evaluationPeriodsApi'
import type { EvaluationDto } from '../types'
import type { EvaluationPeriod } from '../../evaluationPeriods/types'
import EvaluationDetailDialog from '../components/EvaluationDetailDialog'

const STATUS_LABELS: Record<string, string> = {
    Draft: 'Taslak',
    Submitted: 'Gönderildi',
    Approved: 'Onaylandı',
}

const STATUS_COLORS: Record<string, 'default' | 'info' | 'success'> = {
    Draft: 'default',
    Submitted: 'info',
    Approved: 'success',
}

function getInitials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
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
                    boxShadow: '0 10px 26px rgba(0,0,0,0.06)',
                    borderColor: 'rgba(245,179,1,0.45)',
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
                            fontSize: { xs: 24, sm: 27 },
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
                        bgcolor: 'rgba(245,179,1,0.13)',
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
    const [evaluations, setEvaluations] = useState<EvaluationDto[]>([])
    const [periods, setPeriods] = useState<EvaluationPeriod[]>([])
    const [periodFilter, setPeriodFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] =
        useState<EvaluationDto | null>(null)

    const loadData = useCallback(async () => {
        setLoading(true)

        try {
            const [evalData, periodData] = await Promise.all([
                getAllEvaluations(),
                getEvaluationPeriods(),
            ])

            setEvaluations(evalData)
            setPeriods(periodData)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!periods.length) return

        const periodId = searchParams.get('periodId')

        if (!periodId) return

        const selectedPeriod = periods.find(
            (period) => period.id === Number(periodId)
        )

        if (selectedPeriod) {
            setPeriodFilter(selectedPeriod.name)
        }
    }, [periods, searchParams])

    useEffect(() => {
        loadData()
    }, [loadData])

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()

        return evaluations.filter((e) => {
            if (
                periodFilter !== 'all' &&
                e.evaluationPeriodName !== periodFilter
            ) {
                return false
            }

            if (!q) return true

            return (
                e.employeeName.toLowerCase().includes(q) ||
                e.evaluatorName.toLowerCase().includes(q) ||
                e.evaluationPeriodName.toLowerCase().includes(q)
            )
        })
    }, [evaluations, periodFilter, search])

    const stats = useMemo(() => {
        const total = filtered.length

        const average = total
            ? filtered.reduce(
                (sum, e) => sum + e.totalScore,
                0
            ) / total
            : 0

        const approved = filtered.filter(
            (e) => e.status === 'Approved'
        ).length

        const submitted = filtered.filter(
            (e) => e.status === 'Submitted'
        ).length

        const draft = filtered.filter(
            (e) => e.status === 'Draft'
        ).length

        return {
            total,
            average,
            approved,
            submitted,
            draft,
        }
    }, [filtered])

    const columns = useMemo<GridColDef<EvaluationDto>[]>(
        () => [
            {
                field: 'employeeName',
                headerName: 'Çalışan',
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
                                    'rgba(245,179,1,0.16)',
                                color: 'text.primary',
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                lineHeight: 1,
                                textAlign: 'center',
                            }}
                        >
                            {getInitials(params.value ?? '')}
                        </Avatar>

                        <Typography
                            sx={{
                                fontSize: 13.5,
                                fontWeight: 650,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {params.value}
                        </Typography>
                    </Box>
                ),
            },

            {
                field: 'evaluatorName',
                headerName: 'Değerlendiren',
                flex: 1.1,
                minWidth: 180,
            },

            {
                field: 'evaluationPeriodName',
                headerName: 'Dönem',
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
                headerName: 'Toplam Skor',
                flex: 0.8,
                minWidth: 125,
                renderCell: (params) => (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.8,
                        }}
                    >
                        <Box
                            sx={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                bgcolor: getScoreTone(
                                    Number(params.value)
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
                            {Number(params.value).toFixed(2)}
                        </Typography>

                        <Typography
                            sx={{
                                fontSize: 11.5,
                                color: 'text.secondary',
                            }}
                        >
                            / 5
                        </Typography>
                    </Box>
                ),
            },

            {
                field: 'status',
                headerName: 'Durum',
                flex: 0.85,
                minWidth: 125,
                renderCell: (params) => (
                    <Chip
                        size="small"
                        label={
                            STATUS_LABELS[params.value] ??
                            params.value
                        }
                        color={
                            STATUS_COLORS[params.value] ??
                            'default'
                        }
                        variant={
                            params.value === 'Approved'
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
                headerName: 'Tarih',
                flex: 0.85,
                minWidth: 115,
                valueFormatter: (value) =>
                    new Date(value).toLocaleDateString(
                        'tr-TR'
                    ),
            },

            {
                field: 'actions',
                headerName: '',
                width: 64,
                sortable: false,
                filterable: false,
                disableColumnMenu: true,
                renderCell: (params) => (
                    <Tooltip title="Detayları görüntüle">
                        <IconButton
                            size="small"
                            onClick={(event) => {
                                event.stopPropagation()
                                setSelected(params.row)
                            }}
                            sx={{
                                color: 'text.secondary',
                                '&:hover': {
                                    color: 'primary.main',
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
        []
    )

    return (
        <Box
            sx={{
                animation:
                    'evaluationsEnter 260ms ease-out',
                '@keyframes evaluationsEnter': {
                    from: {
                        opacity: 0,
                        transform: 'translateY(6px)',
                    },
                    to: {
                        opacity: 1,
                        transform: 'translateY(0)',
                    },
                },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
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
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
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
                                    letterSpacing: -0.35,
                                }}
                            >
                                Değerlendirmeler
                            </Typography>

                            <Typography
                                color="text.secondary"
                                sx={{
                                    mt: 0.25,
                                    fontSize: 13.5,
                                }}
                            >
                                Sistemdeki performans
                                değerlendirmelerini görüntüle
                                ve incele.
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <TextField
                    select
                    size="small"
                    label="Değerlendirme Dönemi"
                    value={periodFilter}
                    onChange={(e) =>
                        setPeriodFilter(e.target.value)
                    }
                    sx={{
                        minWidth: {
                            xs: '100%',
                            sm: 230,
                        },
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                        },
                    }}
                >
                    <MenuItem value="all">
                        Tüm Dönemler
                    </MenuItem>

                    {periods.map((p) => (
                        <MenuItem
                            key={p.id}
                            value={p.name}
                        >
                            {p.name}
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
                    label="Toplam Değerlendirme"
                    value={stats.total}
                    caption="Seçili filtre kapsamındaki kayıtlar"
                    icon={
                        <AssessmentOutlined fontSize="small" />
                    }
                />

                <KpiCard
                    label="Ortalama Skor"
                    value={`${stats.average.toFixed(2)} / 5`}
                    caption="Değerlendirmelerin genel ortalaması"
                    icon={
                        <TrendingUpOutlined fontSize="small" />
                    }
                />

                <KpiCard
                    label="Onaylanan"
                    value={stats.approved}
                    caption={`${stats.total
                            ? Math.round(
                                (stats.approved /
                                    stats.total) *
                                100
                            )
                            : 0
                        }% onay oranı`}
                    icon={
                        <CheckCircleOutlined fontSize="small" />
                    }
                />

                <KpiCard
                    label="Bekleyen"
                    value={
                        stats.submitted + stats.draft
                    }
                    caption={`${stats.submitted} gönderildi · ${stats.draft} taslak`}
                    icon={
                        <PendingActionsOutlined fontSize="small" />
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
                        alignItems: 'center',
                        justifyContent: 'space-between',
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
                            Değerlendirme Kayıtları
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{
                                fontSize: 11.5,
                                mt: 0.25,
                            }}
                        >
                            {filtered.length} kayıt listeleniyor
                        </Typography>
                    </Box>

                    <TextField
                        size="small"
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        placeholder="Çalışan, değerlendirici veya dönem ara..."
                        sx={{
                            width: {
                                xs: '100%',
                                sm: 330,
                            },
                            '& .MuiOutlinedInput-root': {
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
                                                color: 'text.secondary',
                                            }}
                                        />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                </Box>

                <DataGrid
                    rows={filtered}
                    columns={columns}
                    loading={loading}
                    getRowId={(row) => row.id}
                    autoHeight
                    disableRowSelectionOnClick
                    onRowClick={(params) =>
                        setSelected(params.row)
                    }
                    pageSizeOptions={[10, 25, 50]}
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
                        noRowsLabel: 'Gösterilecek değerlendirme bulunamadı.',
                        noResultsOverlayLabel: 'Sonuç bulunamadı.',

                        footerRowSelected: (count) =>
                            count !== 1
                                ? `${count.toLocaleString()} satır seçildi`
                                : `${count.toLocaleString()} satır seçildi`,
                        footerTotalRows: 'Toplam satır:',
                        footerTotalVisibleRows: (visibleCount, totalCount) =>
                            `${visibleCount.toLocaleString()} / ${totalCount.toLocaleString()}`,
                      

                        columnMenuLabel: 'Sütun menüsü',
                        columnMenuShowColumns: 'Sütunları göster',
                        columnMenuManageColumns: 'Sütunları yönet',
                        columnMenuFilter: 'Filtrele',
                        columnMenuHideColumn: 'Sütunu gizle',
                        columnMenuUnsort: 'Sıralamayı kaldır',
                        columnMenuSortAsc: 'Artan sırala',
                        columnMenuSortDesc: 'Azalan sırala',

                        filterPanelAddFilter: 'Filtre ekle',
                        filterPanelDeleteIconLabel: 'Sil',
                        filterPanelColumn: 'Sütun',
                        filterPanelInputLabel: 'Değer',
                        filterPanelInputPlaceholder: 'Filtre değeri',
                        filterOperatorContains: 'içeriyor',
                        filterOperatorEquals: 'eşittir',
                        filterOperatorStartsWith: 'ile başlar',
                        filterOperatorEndsWith: 'ile biter',
                        filterOperatorIs: 'eşittir',
                        filterOperatorNot: 'eşit değildir',
                        filterOperatorAfter: 'sonra',
                        filterOperatorOnOrAfter: 'sonra veya eşit',
                        filterOperatorBefore: 'önce',
                        filterOperatorOnOrBefore: 'önce veya eşit',
                        filterOperatorIsEmpty: 'boş',
                        filterOperatorIsNotEmpty: 'boş değil',
                        filterOperatorIsAnyOf: 'şunlardan biri',

                        columnHeaderSortIconLabel: 'Sıralamak için tıklayın',

                        checkboxSelectionHeaderName: 'Seç',
                        checkboxSelectionSelectAllRows: 'Tüm satırları seç',
                        checkboxSelectionUnselectAllRows: 'Tüm satırların seçimini kaldır',

                        toolbarExport: 'Dışa aktar',
                        toolbarExportCSV: 'CSV olarak dışa aktar',
                        toolbarExportPrint: 'Yazdır',

                        toolbarColumns: 'Sütunlar',
                        toolbarFilters: 'Filtreler',
                        toolbarDensity: 'Satır yoğunluğu',
                        toolbarDensityLabel: 'Satır yoğunluğu',
                        toolbarDensityCompact: 'Sıkışık',
                        toolbarDensityStandard: 'Standart',
                        toolbarDensityComfortable: 'Rahat',

                        filterPanelOperator: 'Operatör',
                        filterPanelLogicOperator: 'Mantıksal operatör',
                        filterPanelOperatorAnd: 'Ve',
                        filterPanelOperatorOr: 'Veya',
                    }}                    sx={{
                        border: 'none',

                        '& .MuiDataGrid-columnHeaders': {
                            bgcolor: 'background.default',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                        },

                        '& .MuiDataGrid-columnHeaderTitle': {
                            fontWeight: 750,
                            fontSize: 12,
                        },

                        '& .MuiDataGrid-cell': {
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                        },

                        '& .MuiDataGrid-row': {
                            transition:
                                'background-color 140ms ease',
                            cursor: 'pointer',
                        },

                        '& .MuiDataGrid-row:hover': {
                            bgcolor:
                                'rgba(245,179,1,0.045)',
                        },

                        '& .MuiDataGrid-footerContainer': {
                            borderTop: '1px solid',
                            borderColor: 'divider',
                        },
                    }}
                />
            </Paper>

            <EvaluationDetailDialog
                open={!!selected}
                evaluation={selected}
                onClose={() => setSelected(null)}
            />
        </Box>
    )
}