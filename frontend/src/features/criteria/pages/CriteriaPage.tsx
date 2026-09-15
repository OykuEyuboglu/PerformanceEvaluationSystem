import { useEffect, useState, useCallback } from 'react'
import {
    Box,
    Typography,
    Button,
    Chip,
    IconButton,
    Snackbar,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    LinearProgress,
    Tooltip,
    Stack,
} from '@mui/material'
import { Add, Edit, Delete, ExpandMore } from '@mui/icons-material'
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCriteria,
    createCriterion,
    updateCriterion,
    deleteCriterion,
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
    const [snackbar, setSnackbar] = useState<{
        open: boolean
        message: string
        severity: 'success' | 'error'
    }>({
        open: false,
        message: '',
        severity: 'success',
    })

    const showError = (err: any, fallback: string) =>
        setSnackbar({
            open: true,
            message: err?.response?.data?.message ?? fallback,
            severity: 'error',
        })

    const loadData = useCallback(async () => {
        setLoading(true)
        try {
            const [cats, crits, positions] = await Promise.all([
                getCategories(),
                getCriteria(),
                getJobPositions(),
            ])
            setCategories(cats)
            setCriteria(crits)
            setJobPositions(positions)
        } catch {
            setSnackbar({
                open: true,
                message: 'Veriler yüklenirken hata oluştu.',
                severity: 'error',
            })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadData()
    }, [loadData])

    const totalWeight = categories
        .filter((c) => c.isActive)
        .reduce((sum, c) => sum + c.weight, 0)

    const activeCriteria = criteria.filter((c) => c.isActive)
    const categoriesAtTarget = totalWeight === 100

    const handleCategorySubmit = async (values: CategoryFormValues) => {
        setSubmitting(true)
        try {
            if (catMode === 'create') {
                await createCategory({
                    name: values.name,
                    weight: values.weight,
                })
                setSnackbar({
                    open: true,
                    message: 'Kategori oluşturuldu.',
                    severity: 'success',
                })
            } else if (selectedCategory) {
                await updateCategory(selectedCategory.id, values)
                setSnackbar({
                    open: true,
                    message: 'Kategori güncellendi.',
                    severity: 'success',
                })
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
            setSnackbar({
                open: true,
                message: 'Kategori silindi.',
                severity: 'success',
            })
            setCatDeleteTarget(null)
            await loadData()
        } catch (err) {
            showError(err, 'Kategori silinemedi. İçinde kriter olabilir.')
        }
    }

    const handleCriterionSubmit = async (values: CriterionFormValues) => {
        setSubmitting(true)
        try {
            if (critMode === 'create') {
                await createCriterion(values)
                setSnackbar({
                    open: true,
                    message: 'Kriter oluşturuldu.',
                    severity: 'success',
                })
            } else if (selectedCriterion) {
                await updateCriterion(selectedCriterion.id, {
                    name: values.name,
                    isActive: values.isActive,
                    jobPositionDescriptions: values.jobPositionDescriptions,
                })
                setSnackbar({
                    open: true,
                    message: 'Kriter güncellendi.',
                    severity: 'success',
                })
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
            setSnackbar({
                open: true,
                message: 'Kriter silindi.',
                severity: 'success',
            })
            setCritDeleteTarget(null)
            await loadData()
        } catch (err) {
            showError(err, 'Kriter silinemedi.')
        }
    }

    return (
        <Box
            sx={{
                width: '100%',
                animation: 'criteriaPageEnter 280ms ease-out',
                '@keyframes criteriaPageEnter': {
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
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1,
                    }}
                >
                    <Box
                        sx={{
                            width: 8,
                            height: 28,
                            borderRadius: 1,
                            bgcolor: 'primary.main',
                            flexShrink: 0,
                            mt: 0.35,
                        }}
                    />

                    <Box>
                        <Typography
                            sx={{
                                fontSize: {
                                    xs: 24,
                                    md: 28,
                                },
                                fontWeight: 850,
                                letterSpacing: '-0.6px',
                                lineHeight: 1.2,
                            }}
                        >
                            Kriter Yönetimi
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{
                                mt: 0.6,
                                fontSize: 13.5,
                                maxWidth: 680,
                                lineHeight: 1.5,
                            }}
                        >
                            Performans kategorilerini,
                            ağırlıklarını ve pozisyon bazlı
                            değerlendirme kriterlerini yönetin.
                        </Typography>
                    </Box>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => {
                        setCatMode('create')
                        setSelectedCategory(null)
                        setCatDialogOpen(true)
                    }}
                    sx={{
                        minHeight: 42,
                        px: 2,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        fontWeight: 800,
                        boxShadow: 'none',

                        '&:hover': {
                            bgcolor: 'primary.dark',
                            boxShadow:
                                '0 8px 22px rgba(245,179,1,0.18)',
                        },
                    }}
                >
                    Yeni Kategori
                </Button>
            </Box>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr 1fr',
                        md: 'repeat(4, 1fr)',
                    },
                    gap: 1.5,
                    mb: 2,
                }}
            >
                {[
                    ['Kategori', categories.length, 'Toplam kategori'],
                    ['Aktif Kriter', activeCriteria.length, 'Yayında olan kriter'],
                    ['Toplam Kriter', criteria.length, 'Tanımlı kriter'],
                    [
                        'Aktif Ağırlık',
                        `%${totalWeight}`,
                        categoriesAtTarget
                            ? 'Dağılım tamamlandı'
                            : 'Dağılım %100 olmalı',
                    ],
                ].map(([label, value, caption], index) => (
                    <Box
                        key={String(label)}
                        sx={{
                            p: 1.8,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2.5,
                            bgcolor: 'background.paper',
                            transition:
                                'transform 180ms ease, box-shadow 180ms ease',
                            animation: `criteriaCardEnter 360ms ease-out ${index * 45}ms both`,
                            '@keyframes criteriaCardEnter': {
                                from: {
                                    opacity: 0,
                                    transform: 'translateY(5px)',
                                },
                                to: {
                                    opacity: 1,
                                    transform: 'translateY(0)',
                                },
                            },
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                            },
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
                        <Typography
                            sx={{
                                mt: 0.4,
                                fontSize: 23,
                                fontWeight: 850,
                                letterSpacing: '-0.5px',
                            }}
                        >
                            {value}
                        </Typography>
                        <Typography
                            color="text.secondary"
                            sx={{
                                mt: 0.25,
                                fontSize: 10.5,
                            }}
                        >
                            {caption}
                        </Typography>
                    </Box>
                ))}
            </Box>

            <Box
                sx={{
                    mb: 2.5,
                    p: { xs: 1.8, md: 2.2 },
                    borderRadius: 2.5,
                    border: '1px solid',
                    borderColor: categoriesAtTarget
                        ? 'rgba(46,125,50,0.22)'
                        : 'rgba(245,179,1,0.28)',
                    bgcolor: categoriesAtTarget
                        ? 'rgba(46,125,50,0.035)'
                        : 'rgba(245,179,1,0.055)',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 2,
                        mb: 1,
                    }}
                >
                    <Box>
                        <Typography
                            sx={{
                                fontSize: 12.5,
                                fontWeight: 800,
                            }}
                        >
                            Kategori Ağırlık Dağılımı
                        </Typography>
                        <Typography
                            color="text.secondary"
                            sx={{
                                mt: 0.2,
                                fontSize: 11,
                            }}
                        >
                            Aktif kategorilerin toplam ağırlığı
                        </Typography>
                    </Box>

                    <Typography
                        sx={{
                            fontSize: 16,
                            fontWeight: 850,
                            color: categoriesAtTarget
                                ? 'success.main'
                                : 'warning.main',
                        }}
                    >
                        %{totalWeight}
                    </Typography>
                </Box>

                <LinearProgress
                    variant="determinate"
                    value={Math.min(Math.max(totalWeight, 0), 100)}
                    color={categoriesAtTarget ? 'success' : 'warning'}
                    sx={{
                        height: 7,
                        borderRadius: 5,
                        bgcolor: 'action.hover',
                    }}
                />

                <Typography
                    color="text.secondary"
                    sx={{
                        fontSize: 10.5,
                        mt: 0.7,
                    }}
                >
                    {categoriesAtTarget
                        ? 'Ağırlık dağılımı hazır.'
                        : 'Değerlendirme hesaplaması için toplam %100 olmalı.'}
                </Typography>
            </Box>

            {loading ? (
                <Box sx={{ py: 1 }}>
                    <LinearProgress sx={{ borderRadius: 2 }} />
                </Box>
            ) : categories.length === 0 ? (
                <Box
                    sx={{
                        p: 5,
                        textAlign: 'center',
                        border: '1px dashed',
                        borderColor: 'divider',
                        borderRadius: 3,
                        bgcolor: 'background.paper',
                    }}
                >
                    <Typography sx={{ fontWeight: 800 }}>
                        Henüz kategori eklenmemiş.
                    </Typography>
                    <Typography
                        color="text.secondary"
                        sx={{ mt: 0.5, fontSize: 13 }}
                    >
                        İlk performans kategorisini oluşturarak başlayabilirsiniz.
                    </Typography>
                </Box>
            ) : (
                <Stack spacing={1.25}>
                    {categories.map((category, index) => {
                        const categoryCriteria = criteria.filter(
                            (c) => c.performanceCategoryId === category.id,
                        )
                        const activeInCategory = categoryCriteria.filter(
                            (c) => c.isActive,
                        ).length

                        return (
                            <Accordion
                                key={category.id}
                                defaultExpanded
                                disableGutters
                                sx={{
                                    borderRadius: '12px !important',
                                    '&:before': { display: 'none' },
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: 'background.paper',
                                    overflow: 'hidden',
                                    animation: `criteriaAccordionEnter 300ms ease-out ${index * 35}ms both`,
                                    '@keyframes criteriaAccordionEnter': {
                                        from: {
                                            opacity: 0,
                                            transform: 'translateY(5px)',
                                        },
                                        to: {
                                            opacity: 1,
                                            transform: 'translateY(0)',
                                        },
                                    },
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMore />}
                                    sx={{
                                        px: { xs: 1.8, md: 2.2 },
                                        minHeight: 64,
                                        '&.Mui-expanded': {
                                            minHeight: 64,
                                        },
                                        '& .MuiAccordionSummary-content': {
                                            my: 1.1,
                                        },
                                        '& .MuiAccordionSummary-content.Mui-expanded': {
                                            my: 1.1,
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            width: '100%',
                                            gap: 1.25,
                                            minWidth: 0,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 1.8,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: 'rgba(245,179,1,0.12)',
                                                color: '#C68E00',
                                                fontSize: 12,
                                                fontWeight: 850,
                                                flexShrink: 0,
                                            }}
                                        >
                                            {String(index + 1).padStart(2, '0')}
                                        </Box>

                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography
                                                noWrap
                                                sx={{
                                                    fontWeight: 800,
                                                    fontSize: 14,
                                                }}
                                            >
                                                {category.name}
                                            </Typography>
                                            <Typography
                                                color="text.secondary"
                                                sx={{
                                                    fontSize: 10.5,
                                                    mt: 0.15,
                                                }}
                                            >
                                                {activeInCategory} aktif kriter · {categoryCriteria.length} toplam kriter
                                            </Typography>
                                        </Box>

                                        <Chip
                                            size="small"
                                            label={`%${category.weight}`}
                                            sx={{
                                                ml: 'auto',
                                                fontWeight: 800,
                                                bgcolor: 'rgba(245,179,1,0.10)',
                                                color: '#9A6D00',
                                            }}
                                        />

                                        {!category.isActive && (
                                            <Chip
                                                size="small"
                                                label="Pasif"
                                                sx={{ fontWeight: 700 }}
                                            />
                                        )}

                                        <Box
                                            sx={{
                                                display: 'flex',
                                                gap: 0.25,
                                                ml: 0.25,
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Tooltip title="Kategoriyi düzenle">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setCatMode('edit')
                                                        setSelectedCategory(category)
                                                        setCatDialogOpen(true)
                                                    }}
                                                    sx={{
                                                        '&:hover': {
                                                            bgcolor:
                                                                'rgba(245,179,1,0.10)',
                                                        },
                                                    }}
                                                >
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="Kategoriyi sil">
                                                <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                        setCatDeleteTarget(category)
                                                    }
                                                    sx={{
                                                        '&:hover': {
                                                            bgcolor:
                                                                'rgba(211,47,47,0.08)',
                                                            color: 'error.main',
                                                        },
                                                    }}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                </AccordionSummary>

                                <AccordionDetails
                                    sx={{
                                        px: { xs: 1.8, md: 2.2 },
                                        pt: 0,
                                        pb: 2,
                                        borderTop: '1px solid',
                                        borderColor: 'divider',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: 1,
                                            py: 1.5,
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        <Typography
                                            color="text.secondary"
                                            sx={{ fontSize: 11.5 }}
                                        >
                                            Bu kategori altında değerlendirilecek kriterleri yönetin.
                                        </Typography>

                                        <Button
                                            size="small"
                                            startIcon={<Add />}
                                            onClick={() => {
                                                setCritMode('create')
                                                setSelectedCriterion(null)
                                                setPrefillCategoryId(category.id)
                                                setCritDialogOpen(true)
                                            }}
                                            sx={{
                                                borderRadius: 1.8,
                                                fontWeight: 800,
                                                color: '#9A6D00',
                                                '&:hover': {
                                                    bgcolor:
                                                        'rgba(245,179,1,0.08)',
                                                },
                                            }}
                                        >
                                            Kriter Ekle
                                        </Button>
                                    </Box>

                                    {categoryCriteria.length === 0 ? (
                                        <Box
                                            sx={{
                                                py: 2.5,
                                                px: 2,
                                                border: '1px dashed',
                                                borderColor: 'divider',
                                                borderRadius: 2,
                                                textAlign: 'center',
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: 12.5,
                                                    fontWeight: 700,
                                                }}
                                            >
                                                Bu kategoride henüz kriter yok.
                                            </Typography>
                                            <Typography
                                                color="text.secondary"
                                                sx={{
                                                    fontSize: 11,
                                                    mt: 0.3,
                                                }}
                                            >
                                                Yukarıdaki “Kriter Ekle” butonunu kullanabilirsiniz.
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Stack spacing={1}>
                                            {categoryCriteria.map((criterion) => (
                                                <Box
                                                    key={criterion.id}
                                                    sx={{
                                                        p: 1.5,
                                                        borderRadius: 2,
                                                        border: '1px solid',
                                                        borderColor: 'divider',
                                                        bgcolor: 'background.default',
                                                        display: 'flex',
                                                        alignItems: {
                                                            xs: 'flex-start',
                                                            md: 'center',
                                                        },
                                                        justifyContent:
                                                            'space-between',
                                                        gap: 1.5,
                                                        transition:
                                                            'border-color 180ms ease, transform 180ms ease',
                                                        '&:hover': {
                                                            borderColor:
                                                                'rgba(245,179,1,0.45)',
                                                            transform:
                                                                'translateX(2px)',
                                                        },
                                                    }}
                                                >
                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems:
                                                                    'center',
                                                                gap: 0.8,
                                                                flexWrap:
                                                                    'wrap',
                                                            }}
                                                        >
                                                            <Typography
                                                                sx={{
                                                                    fontWeight: 750,
                                                                    fontSize: 13,
                                                                }}
                                                            >
                                                                {criterion.name}
                                                            </Typography>

                                                            {!criterion.isActive && (
                                                                <Chip
                                                                    size="small"
                                                                    label="Pasif"
                                                                />
                                                            )}
                                                        </Box>

                                                        <Typography
                                                            color="text.secondary"
                                                            sx={{
                                                                fontSize: 11,
                                                                mt: 0.45,
                                                            }}
                                                        >
                                                            {criterion.jobPositionDescriptions.length} pozisyon için açıklama tanımlı
                                                        </Typography>
                                                    </Box>

                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            gap: 0.25,
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        <Tooltip title="Kriteri düzenle">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => {
                                                                    setCritMode(
                                                                        'edit',
                                                                    )
                                                                    setSelectedCriterion(
                                                                        criterion,
                                                                    )
                                                                    setPrefillCategoryId(
                                                                        criterion.performanceCategoryId,
                                                                    )
                                                                    setCritDialogOpen(
                                                                        true,
                                                                    )
                                                                }}
                                                            >
                                                                <Edit fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>

                                                        <Tooltip title="Kriteri sil">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() =>
                                                                    setCritDeleteTarget(
                                                                        criterion,
                                                                    )
                                                                }
                                                            >
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Stack>
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        )
                    })}
                </Stack>
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
                onClose={() =>
                    setSnackbar((s) => ({ ...s, open: false }))
                }
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
            >
                <Alert
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ borderRadius: 2 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}
