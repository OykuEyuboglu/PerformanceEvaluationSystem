import { useEffect, useState, useCallback, useMemo } from 'react'
import { Box, Typography, Chip, TextField, MenuItem } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
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

export default function EvaluationsPage() {
    const [evaluations, setEvaluations] = useState<EvaluationDto[]>([])
    const [periods, setPeriods] = useState<EvaluationPeriod[]>([])
    const [periodFilter, setPeriodFilter] = useState<string>('all')
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState<EvaluationDto | null>(null)

    const loadData = useCallback(async () => {
        setLoading(true)
        try {
            const [evalData, periodData] = await Promise.all([getAllEvaluations(), getEvaluationPeriods()])
            setEvaluations(evalData)
            setPeriods(periodData)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadData() }, [loadData])

    const filtered = useMemo(
        () =>
            periodFilter === 'all'
                ? evaluations
                : evaluations.filter((e) => e.evaluationPeriodName === periodFilter),
        [evaluations, periodFilter]
    )

    const columns: GridColDef<EvaluationDto>[] = [
        { field: 'employeeName', headerName: 'Çalışan', flex: 1.1 },
        { field: 'evaluatorName', headerName: 'Değerlendiren', flex: 1.1 },
        { field: 'evaluationPeriodName', headerName: 'Dönem', flex: 1.2 },
        {
            field: 'totalScore',
            headerName: 'Toplam Skor',
            flex: 0.8,
            renderCell: (params) => (
                <Typography sx={{ fontWeight: 700 }}>{params.value.toFixed(2)} / 5</Typography>
            ),
        },
        {
            field: 'status',
            headerName: 'Durum',
            flex: 0.8,
            renderCell: (params) => (
                <Chip
                    size="small"
                    label={STATUS_LABELS[params.value] ?? params.value}
                    color={STATUS_COLORS[params.value] ?? 'default'}
                    sx={{ fontWeight: 600 }}
                />
            ),
        },
        {
            field: 'createdAt',
            headerName: 'Tarih',
            flex: 0.9,
            valueFormatter: (value) => new Date(value).toLocaleDateString('tr-TR'),
        },
    ]

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>Değerlendirmeler</Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: 14.5 }}>
                        Sistemdeki tüm performans değerlendirmelerini görüntüle.
                    </Typography>
                </Box>
                <TextField
                    select
                    size="small"
                    label="Dönem"
                    value={periodFilter}
                    onChange={(e) => setPeriodFilter(e.target.value)}
                    sx={{ minWidth: 220 }}
                >
                    <MenuItem value="all">Tüm Dönemler</MenuItem>
                    {periods.map((p) => (
                        <MenuItem key={p.id} value={p.name}>{p.name}</MenuItem>
                    ))}
                </TextField>
            </Box>

            <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <DataGrid
                    rows={filtered}
                    columns={columns}
                    loading={loading}
                    getRowId={(row) => row.id}
                    autoHeight
                    disableRowSelectionOnClick
                    onRowClick={(params) => setSelected(params.row)}
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    sx={{ border: 'none', cursor: 'pointer' }}
                />
            </Box>

            <EvaluationDetailDialog
                open={!!selected}
                evaluation={selected}
                onClose={() => setSelected(null)}
            />
        </Box>
    )
}