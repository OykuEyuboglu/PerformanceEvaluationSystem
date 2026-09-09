import { useEffect, useState, useCallback } from 'react'
import {
    Box, Typography, Button, Chip, IconButton, Snackbar, Alert,
    Accordion, AccordionSummary, AccordionDetails, LinearProgress, Tooltip,
} from '@mui/material'
import { Add, Edit, Delete, ExpandMore } from '@mui/icons-material'
import {
    getCategories, createCategory, updateCategory, deleteCategory,
    getCriteria, createCriterion, updateCriterion, deleteCriterion,
} from '../criteriaApi'
import { getJobPositions } from '../../../shared/api/jobPositionsApi'
import type { PerformanceCategoryDto, PerformanceCriterionDto } from '../types'
import type { JobPositionDto } from '../../../shared/types/jobPosition'
import CategoryFormDialog, { type CategoryFormValues } from '../components/CategoryFormDialog'
import CriterionFormDialog, { type CriterionFormValues } from '../components/CriterionFormDialog'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'

export default function CriteriaPage() {
    const [categories, setCategories] = useState<PerformanceCategoryDto[]>([])
    const [criteria, setCriteria] = useState<PerformanceCriterionDto[]>([])
    const [jobPositions, setJobPositions] = useState<JobPositionDto[]>([])
    const [loading, setLoading] = useState(true)

    const [catDialogOpen, setCatDialogOpen] = useState(false)
    const [catMode, setCatMode] = useState<'create' | 'edit'>('create')
    const [selectedCategory, setSelectedCategory] = useState<PerformanceCategoryDto | null>(null)
    const [catDeleteTarget, setCatDeleteTarget] = useState<PerformanceCategoryDto | null>(null)

    const [critDialogOpen, setCritDialogOpen] = useState(false)
    const [critMode, setCritMode] = useState<'create' | 'edit'>('create')
    const [selectedCriterion, setSelectedCriterion] = useState<PerformanceCriterionDto | null>(null)
    const [prefillCategoryId, setPrefillCategoryId] = useState<number | null>(null)
    const [critDeleteTarget, setCritDeleteTarget] = useState<PerformanceCriterionDto | null>(null)

    const [submitting, setSubmitting] = useState(false)
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success',
    })

    const showError = (err: any, fallback: string) =>
        setSnackbar({ open: true, message: err?.response?.data?.message ?? fallback, severity: 'error' })

    const loadData = useCallback(async () => {
        setLoading(true)
        try {
            const [cats, crits, positions] = await Promise.all([getCategories(), getCriteria(), getJobPositions()])
            setCategories(cats)
            setCriteria(crits)
            setJobPositions(positions)
        } catch {
            setSnackbar({ open: true, message: 'Veriler yüklenirken hata oluştu.', severity: 'error' })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadData() }, [loadData])

    const totalWeight = categories.filter((c) => c.isActive).reduce((sum, c) => sum + c.weight, 0)

    // --- Kategori işlemleri ---
    const handleCategorySubmit = async (values: CategoryFormValues) => {
        setSubmitting(true)
        try {
            if (catMode === 'create') {
                await createCategory({ name: values.name, weight: values.weight })
                setSnackbar({ open: true, message: 'Kategori oluşturuldu.', severity: 'success' })
            } else if (selectedCategory) {
                await updateCategory(selectedCategory.id, values)
                setSnackbar({ open: true, message: 'Kategori güncellendi.', severity: 'success' })
            }
            setCatDialogOpen(false)
            await loadData()
        } catch (err) {
            showError(err, 'İşlem sırasında hata oluştu.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteCategory = async () => {
        if (!catDeleteTarget) return
        try {
            await deleteCategory(catDeleteTarget.id)
            setSnackbar({ open: true, message: 'Kategori silindi.', severity: 'success' })
            setCatDeleteTarget(null)
            await loadData()
        } catch (err) {
            showError(err, 'Kategori silinemedi. İçinde kriter olabilir.')
        }
    }

    // --- Kriter işlemleri ---
    const handleCriterionSubmit = async (values: CriterionFormValues) => {
        setSubmitting(true)
        try {
            if (critMode === 'create') {
                await createCriterion(values)
                setSnackbar({ open: true, message: 'Kriter oluşturuldu.', severity: 'success' })
            } else if (selectedCriterion) {
                await updateCriterion(selectedCriterion.id, {
                    name: values.name,
                    isActive: values.isActive,
                    jobPositionDescriptions: values.jobPositionDescriptions,
                })
                setSnackbar({ open: true, message: 'Kriter güncellendi.', severity: 'success' })
            }
            setCritDialogOpen(false)
            await loadData()
        } catch (err) {
            showError(err, 'İşlem sırasında hata oluştu.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteCriterion = async () => {
        if (!critDeleteTarget) return
        try {
            await deleteCriterion(critDeleteTarget.id)
            setSnackbar({ open: true, message: 'Kriter silindi.', severity: 'success' })
            setCritDeleteTarget(null)
            await loadData()
        } catch (err) {
            showError(err, 'Kriter silinemedi.')
        }
    }

    return (
        <Box>
            {/* Başlık */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>Kriter Yönetimi</Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: 14.5 }}>
                        Ana kategorileri, ağırlıklarını ve rol bazlı kriterleri yönet.
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<Add />} onClick={() => { setCatMode('create'); setSelectedCategory(null); setCatDialogOpen(true) }}>
                    Yeni Kategori
                </Button>
            </Box>

            {/* Toplam ağırlık göstergesi */}
            <Box sx={{ mb: 3, p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Toplam Ağırlık (Aktif Kategoriler)</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: totalWeight === 100 ? 'success.main' : 'warning.main' }}>
                        %{totalWeight}
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={Math.min(totalWeight, 100)}
                    color={totalWeight === 100 ? 'success' : 'warning'}
                    sx={{ height: 8, borderRadius: 4 }}
                />
                {totalWeight !== 100 && (
                    <Typography sx={{ fontSize: 12, color: 'warning.main', mt: 0.75 }}>
                        Ağırlıklı puanlamanın doğru çalışması için toplam %100 olmalı.
                    </Typography>
                )}
            </Box>

            {loading ? (
                <LinearProgress />
            ) : categories.length === 0 ? (
                <Typography color="text.secondary">Henüz kategori eklenmemiş.</Typography>
            ) : (
                categories.map((category) => {
                    const categoryCriteria = criteria.filter((c) => c.performanceCategoryId === category.id)
                    return (
                        <Accordion key={category.id} defaultExpanded sx={{ mb: 1.5, borderRadius: 2, '&:before': { display: 'none' }, border: '1px solid', borderColor: 'divider' }}>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                                    <Typography sx={{ fontWeight: 700 }}>{category.name}</Typography>
                                    <Chip size="small" label={`%${category.weight}`} sx={{ fontWeight: 600 }} />
                                    {!category.isActive && <Chip size="small" label="Pasif" color="default" />}
                                    <Box sx={{ marginLeft: 'auto', display: 'flex', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
                                        <Tooltip title="Kategoriyi düzenle">
                                            <IconButton size="small" onClick={() => { setCatMode('edit'); setSelectedCategory(category); setCatDialogOpen(true) }}>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Kategoriyi sil">
                                            <IconButton size="small" onClick={() => setCatDeleteTarget(category)}>
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Button
                                    size="small"
                                    startIcon={<Add />}
                                    sx={{ mb: 1.5 }}
                                    onClick={() => {
                                        setCritMode('create')
                                        setSelectedCriterion(null)
                                        setPrefillCategoryId(category.id)
                                        setCritDialogOpen(true)
                                    }}
                                >
                                    Bu kategoriye kriter ekle
                                </Button>

                                {categoryCriteria.length === 0 ? (
                                    <Typography color="text.secondary" sx={{ fontSize: 13.5 }}>
                                        Bu kategoride henüz kriter yok.
                                    </Typography>
                                ) : (
                                    categoryCriteria.map((criterion) => (
                                        <Box
                                            key={criterion.id}
                                            sx={{ p: 1.5, mb: 1, borderRadius: 1.5, bgcolor: 'action.hover', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}
                                        >
                                            <Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{criterion.name}</Typography>
                                                    {!criterion.isActive && <Chip size="small" label="Pasif" />}
                                                </Box>
                                                <Typography color="text.secondary" sx={{ fontSize: 12.5, mt: 0.5 }}>
                                                    {criterion.jobPositionDescriptions.length} pozisyon için açıklama tanımlı
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <IconButton size="small" onClick={() => {
                                                    setCritMode('edit')
                                                    setSelectedCriterion(criterion)
                                                    setPrefillCategoryId(
                                                        criterion.performanceCategoryId
                                                    )
                                                    setCritDialogOpen(true)
                                                }}>
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => setCritDeleteTarget(criterion)}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    ))
                                )}
                            </AccordionDetails>
                        </Accordion>
                    )
                })
            )}

            <CategoryFormDialog
                open={catDialogOpen}
                mode={catMode}
                initialData={selectedCategory}
                submitting={submitting}
                onSubmit={handleCategorySubmit}
                onClose={() => setCatDialogOpen(false)}
            />

            <CriterionFormDialog
                open={critDialogOpen}
                mode={critMode}
                initialData={selectedCriterion}
                categories={categories}
                jobPositions={jobPositions}
                categoryId={prefillCategoryId}
                submitting={submitting}
                onSubmit={handleCriterionSubmit}
                onClose={() => setCritDialogOpen(false)}
            />

            <ConfirmDialog
                open={!!catDeleteTarget}
                title="Kategoriyi Sil"
                description={`"${catDeleteTarget?.name}" kategorisini silmek istediğine emin misin? İçindeki kriterler etkilenebilir.`}
                onConfirm={handleDeleteCategory}
                onCancel={() => setCatDeleteTarget(null)}
            />

            <ConfirmDialog
                open={!!critDeleteTarget}
                title="Kriteri Sil"
                description={`"${critDeleteTarget?.name}" kriterini silmek istediğine emin misin?`}
                onConfirm={handleDeleteCriterion}
                onCancel={() => setCritDeleteTarget(null)}
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