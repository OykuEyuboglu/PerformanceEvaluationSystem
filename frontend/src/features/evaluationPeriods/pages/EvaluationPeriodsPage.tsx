import { useEffect, useState, useCallback } from 'react'
import { Box, Typography, Button, IconButton, Chip, Snackbar, Alert, LinearProgress } from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import {
    getEvaluationPeriods, createEvaluationPeriod, updateEvaluationPeriod, deleteEvaluationPeriod,
} from '../evaluationPeriodsApi'
import type { EvaluationPeriod } from '../types'
import EvaluationPeriodFormDialog, { type EvaluationPeriodFormValues } from '../components/EvaluationPeriodFormDialog'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'

const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })

const isCurrentPeriod = (period: EvaluationPeriod) => {
    const now = new Date()
    return new Date(period.startDate) <= now && now <= new Date(period.endDate)
}

export default function EvaluationPeriodsPage() {
    const [periods, setPeriods] = useState<EvaluationPeriod[]>([])
    const [loading, setLoading] = useState(true)

    const [dialogOpen, setDialogOpen] = useState(false)
    const [mode, setMode] = useState<'create' | 'edit'>('create')
    const [selected, setSelected] = useState<EvaluationPeriod | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const [deleteTarget, setDeleteTarget] = useState<EvaluationPeriod | null>(null)
    const [deleting, setDeleting] = useState(false)

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success',
    })

    const loadData = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getEvaluationPeriods()
            setPeriods(
                [...data].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
            )
        } catch {
            setSnackbar({ open: true, message: 'Dönemler yüklenirken hata oluştu.', severity: 'error' })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadData() }, [loadData])

    const showError = (err: any, fallback: string) =>
        setSnackbar({ open: true, message: err?.response?.data?.message ?? fallback, severity: 'error' })

    const handleSubmit = async (values: EvaluationPeriodFormValues) => {
        setSubmitting(true)
        try {
            if (mode === 'create') {
                await createEvaluationPeriod(values)
                setSnackbar({ open: true, message: 'Dönem oluşturuldu.', severity: 'success' })
            } else if (selected) {
                await updateEvaluationPeriod(selected.id, values)
                setSnackbar({ open: true, message: 'Dönem güncellendi.', severity: 'success' })
            }
            setDialogOpen(false)
            await loadData()
        } catch (err) {
            showError(err, 'İşlem sırasında hata oluştu.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            await deleteEvaluationPeriod(deleteTarget.id)
            setSnackbar({ open: true, message: 'Dönem silindi.', severity: 'success' })
            setDeleteTarget(null)
            await loadData()
        } catch (err) {
            showError(err, 'Bu döneme ait değerlendirmeler olduğu için silinemedi.')
        } finally {
            setDeleting(false)
        }
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>Değerlendirme Dönemleri</Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: 14.5 }}>
                        Performans değerlendirmelerinin yapılacağı dönemleri tanımla.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => { setMode('create'); setSelected(null); setDialogOpen(true) }}
                >
                    Yeni Dönem
                </Button>
            </Box>

            {loading ? (
                <LinearProgress />
            ) : periods.length === 0 ? (
                <Typography color="text.secondary">Henüz değerlendirme dönemi tanımlanmamış.</Typography>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {periods.map((period) => (
                        <Box
                            key={period.id}
                            sx={{
                                p: 2.5,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: 'background.paper',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 2,
                                flexWrap: 'wrap',
                            }}
                        >
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography sx={{ fontWeight: 700 }}>{period.name}</Typography>
                                    {isCurrentPeriod(period) && (
                                        <Chip size="small" label="Aktif Dönem" color="success" sx={{ fontWeight: 600 }} />
                                    )}
                                </Box>
                                <Typography color="text.secondary" sx={{ fontSize: 13, mt: 0.5 }}>
                                    {formatDate(period.startDate)} — {formatDate(period.endDate)}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <IconButton size="small" onClick={() => { setMode('edit'); setSelected(period); setDialogOpen(true) }}>
                                    <Edit fontSize="small" />
                                </IconButton>
                                <IconButton size="small" onClick={() => setDeleteTarget(period)}>
                                    <Delete fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}

            <EvaluationPeriodFormDialog
                open={dialogOpen}
                mode={mode}
                initialData={selected}
                submitting={submitting}
                onSubmit={handleSubmit}
                onClose={() => setDialogOpen(false)}
            />

            <ConfirmDialog
                open={!!deleteTarget}
                title="Dönemi Sil"
                description={`"${deleteTarget?.name}" dönemini silmek istediğine emin misin?`}
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}