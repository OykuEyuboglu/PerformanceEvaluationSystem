import { useEffect, useRef } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { useLanguage } from '../../../shared/i18n/LanguageContext'
import { translations } from '../../../shared/i18n/translations'

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    FormControlLabel,
    Switch,
    Box,
    Typography,
    Divider,
    Autocomplete,
    Chip,
} from '@mui/material'

import { BadgeOutlined } from '@mui/icons-material'

import type {
    PerformanceCategoryDto,
    PerformanceCriterionDto,
} from '../types'

import type { JobPositionDto } from '../../../shared/types/jobPosition'

interface CriterionFormDialogProps {
    open: boolean
    mode: 'create' | 'edit'
    initialData?: PerformanceCriterionDto | null
    categories: PerformanceCategoryDto[]
    jobPositions: JobPositionDto[]
    categoryId?: number | null
    submitting: boolean
    onSubmit: (values: CriterionFormValues) => void
    onClose: () => void
}

const getCriterionSchema = (language: 'tr' | 'en') =>
    z.object({
        name: z
            .string()
            .min(
                2,
                language === 'tr'
                    ? 'Kriter adı en az 2 karakter olmalı'
                    : 'Criterion name must be at least 2 characters',
            ),

        performanceCategoryId: z
            .number()
            .min(
                1,
                language === 'tr'
                    ? 'Ana kategori belirtilmelidir'
                    : 'Main category must be specified',
            ),

        isActive: z.boolean(),

        jobPositionDescriptions: z
            .array(
                z.object({
                    jobPositionId: z.number(),

                    description: z
                        .string()
                        .trim()
                        .min(
                            1,
                            language === 'tr'
                                ? 'Açıklama boş bırakılamaz'
                                : 'Description cannot be empty',
                        ),
                }),
            )
            .min(
                1,
                language === 'tr'
                    ? 'En az bir iş pozisyonu seçmelisin'
                    : 'You must select at least one job position',
            ),
    })

export type CriterionFormValues = z.infer<
    ReturnType<typeof getCriterionSchema>
>

export default function CriterionFormDialog({
    open,
    mode,
    initialData,
    categories,
    jobPositions,
    categoryId,
    submitting,
    onSubmit,
    onClose,
}: CriterionFormDialogProps) {
    const { language } = useLanguage()
    const t = translations[language]

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CriterionFormValues>({
        resolver: zodResolver(getCriterionSchema(language)),
        defaultValues: {
            name: '',
            performanceCategoryId: 0,
            isActive: true,
            jobPositionDescriptions: [],
        },
    })

    const { fields } = useFieldArray({
        control,
        name: 'jobPositionDescriptions',
    })

    const descriptionCache = useRef<Record<number, string>>({})

    useEffect(() => {
        if (!open) return

        descriptionCache.current = {}

        if (mode === 'edit' && initialData) {
            initialData.jobPositionDescriptions.forEach((item) => {
                descriptionCache.current[item.jobPositionId] =
                    item.description
            })

            reset({
                name: initialData.name,
                performanceCategoryId:
                    initialData.performanceCategoryId,
                isActive: initialData.isActive,
                jobPositionDescriptions:
                    initialData.jobPositionDescriptions.map(
                        (item) => ({
                            jobPositionId: item.jobPositionId,
                            description: item.description,
                        }),
                    ),
            })

            return
        }

        reset({
            name: '',
            performanceCategoryId: categoryId ?? 0,
            isActive: true,
            jobPositionDescriptions: [],
        })
    }, [
        open,
        mode,
        initialData,
        categoryId,
        reset,
    ])

    const selectedIds = fields.map(
        (field) => field.jobPositionId,
    )

    const selectedPositions = jobPositions.filter(
        (position) =>
            selectedIds.includes(position.id),
    )

    const selectedCategoryId = watch(
        'performanceCategoryId',
    )

    const selectedCategory = categories.find(
        (category) =>
            category.id === selectedCategoryId,
    )

    const handlePositionSelectionChange = (
        newSelected: JobPositionDto[],
    ) => {
        const newIds = newSelected.map(
            (position) => position.id,
        )

        fields.forEach((field, index) => {
            if (!newIds.includes(field.jobPositionId)) {
                descriptionCache.current[
                    field.jobPositionId
                ] = watch(
                    `jobPositionDescriptions.${index}.description`,
                )
            }
        })

        const keptDescriptions = fields
            .map((field, index) => ({
                jobPositionId:
                    field.jobPositionId,

                description: watch(
                    `jobPositionDescriptions.${index}.description`,
                ),
            }))
            .filter((item) =>
                newIds.includes(
                    item.jobPositionId,
                ),
            )

        const addedIds = newIds.filter(
            (id) => !selectedIds.includes(id),
        )

        setValue(
            'jobPositionDescriptions',
            [
                ...keptDescriptions,

                ...addedIds.map((id) => ({
                    jobPositionId: id,
                    description:
                        descriptionCache.current[
                        id
                        ] ?? '',
                })),
            ],
            {
                shouldValidate: true,
                shouldDirty: true,
            },
        )
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 3,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow:
                            '0 24px 70px rgba(0,0,0,0.16)',
                        animation:
                            'criterionDialogEnter 240ms ease-out',

                        '@keyframes criterionDialogEnter': {
                            from: {
                                opacity: 0,
                                transform:
                                    'translateY(8px) scale(0.985)',
                            },
                            to: {
                                opacity: 1,
                                transform:
                                    'translateY(0) scale(1)',
                            },
                        },
                    },
                },
            }}
        >
            <DialogTitle
                sx={{
                    px: { xs: 2.5, sm: 3 },
                    py: 2.2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.3,
                    }}
                >
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor:
                                'rgba(245,179,1,0.12)',
                            color: '#C68E00',
                        }}
                    >
                        <BadgeOutlined />
                    </Box>

                    <Box>
                        <Typography
                            sx={{
                                fontWeight: 850,
                                fontSize: 18,
                            }}
                        >
                            {mode === 'create'
                                ? t.criteriaForm.createTitle
                                : t.criteriaForm.editTitle}
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{
                                fontSize: 11.5,
                                mt: 0.2,
                            }}
                        >
                            {t.criteriaForm.description}
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
            >
                <DialogContent
                    sx={{
                        px: { xs: 2.5, sm: 3 },
                        py: 2.5,
                    }}
                >
                    <Stack spacing={2.2}>
                        {/* KRİTER ADI */}
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label={
                                        t.criteriaForm
                                            .criterionName
                                    }
                                    fullWidth
                                    size="small"
                                    error={!!errors.name}
                                    helperText={
                                        errors.name
                                            ?.message
                                    }
                                    sx={dialogFieldSx}
                                />
                            )}
                        />

                        {/* ANA KATEGORİ */}
                        <TextField
                            label={
                                t.criteriaForm
                                    .mainCategory
                            }
                            value={
                                selectedCategory?.name ??
                                ''
                            }
                            fullWidth
                            disabled
                            error={
                                !!errors.performanceCategoryId
                            }
                            helperText={
                                errors
                                    .performanceCategoryId
                                    ?.message ??
                                t.criteriaForm
                                    .categoryDescription
                            }
                        />

                        {/* DURUM */}
                        {mode === 'edit' && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent:
                                        'space-between',
                                    p: 1.4,
                                    borderRadius: 2,
                                    bgcolor:
                                        'action.hover',
                                    border: '1px solid',
                                    borderColor:
                                        'divider',
                                }}
                            >
                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: 12.5,
                                            fontWeight: 750,
                                        }}
                                    >
                                        {
                                            t.criteriaForm
                                                .criterionStatus
                                        }
                                    </Typography>

                                    <Typography
                                        color="text.secondary"
                                        sx={{
                                            fontSize: 10.5,
                                            mt: 0.2,
                                        }}
                                    >
                                        {
                                            t.criteriaForm
                                                .statusDescription
                                        }
                                    </Typography>
                                </Box>

                                <Controller
                                    name="isActive"
                                    control={control}
                                    render={({
                                        field,
                                    }) => (
                                        <FormControlLabel
                                            sx={{ m: 0 }}
                                            control={
                                                <Switch
                                                    checked={
                                                        field.value
                                                    }
                                                    onChange={
                                                        field.onChange
                                                    }
                                                    size="small"
                                                />
                                            }
                                            label={
                                                field.value
                                                    ? t
                                                        .criteriaForm
                                                        .active
                                                    : t
                                                        .criteriaForm
                                                        .inactive
                                            }
                                        />
                                    )}
                                />
                            </Box>
                        )}

                        <Divider />

                        {/* UYGULAMA POZİSYONLARI */}
                        <Box>
                            <Typography
                                sx={{
                                    fontWeight: 800,
                                    fontSize: 13.5,
                                }}
                            >
                                {
                                    t.criteriaForm
                                        .applicationPositions
                                }
                            </Typography>

                            <Typography
                                color="text.secondary"
                                sx={{
                                    fontSize: 11.5,
                                    mt: 0.25,
                                }}
                            >
                                {
                                    t.criteriaForm
                                        .applicationPositionsDescription
                                }
                            </Typography>
                        </Box>

                        {/* POZİSYON SEÇİMİ */}
                        <Autocomplete
                            multiple
                            options={jobPositions}
                            getOptionLabel={(
                                position,
                            ) => position.name}
                            value={selectedPositions}
                            isOptionEqualToValue={(
                                option,
                                value,
                            ) =>
                                option.id ===
                                value.id
                            }
                            getOptionDisabled={(
                                option,
                            ) =>
                                selectedIds.includes(
                                    option.id,
                                )
                            }
                            onChange={(
                                _,
                                newValue,
                            ) =>
                                handlePositionSelectionChange(
                                    newValue,
                                )
                            }
                            renderValue={(
                                value,
                                getItemProps,
                            ) =>
                                value.map(
                                    (
                                        option,
                                        index,
                                    ) => {
                                        const {
                                            key,
                                            ...itemProps
                                        } =
                                            getItemProps(
                                                {
                                                    index,
                                                },
                                            )

                                        return (
                                            <Chip
                                                key={
                                                    key ??
                                                    option.id
                                                }
                                                label={
                                                    option.name
                                                }
                                                size="small"
                                                {...itemProps}
                                            />
                                        )
                                    },
                                )
                            }
                            renderInput={(
                                params,
                            ) => (
                                <TextField
                                    {...params}
                                    label={
                                        t.criteriaForm
                                            .positions
                                    }
                                    placeholder={
                                        t.criteriaForm
                                            .selectPosition
                                    }
                                    size="small"
                                    error={
                                        !!errors
                                            .jobPositionDescriptions
                                    }
                                    helperText={
                                        errors
                                            .jobPositionDescriptions
                                            ?.message
                                    }
                                    sx={dialogFieldSx}
                                />
                            )}
                        />

                        {/* POZİSYON AÇIKLAMALARI */}
                        {fields.map(
                            (field, index) => {
                                const position =
                                    jobPositions.find(
                                        (item) =>
                                            item.id ===
                                            field.jobPositionId,
                                    )

                                return (
                                    <Controller
                                        key={field.id}
                                        name={`jobPositionDescriptions.${index}.description`}
                                        control={control}
                                        render={({
                                            field: descriptionField,
                                        }) => (
                                            <TextField
                                                {...descriptionField}
                                                label={`${position?.name ?? ''} ${t.criteriaForm.descriptionForPosition}`}
                                                fullWidth
                                                multiline
                                                minRows={2}
                                                size="small"
                                                error={
                                                    !!errors
                                                        .jobPositionDescriptions?.[
                                                        index
                                                    ]
                                                        ?.description
                                                }
                                                helperText={
                                                    errors
                                                        .jobPositionDescriptions?.[
                                                        index
                                                    ]
                                                        ?.description
                                                        ?.message
                                                }
                                                sx={
                                                    dialogFieldSx
                                                }
                                            />
                                        )}
                                    />
                                )
                            },
                        )}
                    </Stack>
                </DialogContent>

                {/* BUTONLAR */}
                <DialogActions
                    sx={{
                        px: {
                            xs: 2.5,
                            sm: 3,
                        },
                        py: 2,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        gap: 1,
                    }}
                >
                    <Button
                        onClick={onClose}
                        color="inherit"
                        sx={{
                            borderRadius: 2,
                            fontWeight: 700,
                        }}
                    >
                        {t.criteriaForm.cancel}
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={submitting}
                        sx={{
                            minWidth: 110,
                            borderRadius: 2,
                            bgcolor: '#F5B301',
                            color: '#111',
                            fontWeight: 800,
                            boxShadow: 'none',

                            '&:hover': {
                                bgcolor: '#E0A300',
                                boxShadow:
                                    '0 6px 18px rgba(245,179,1,0.18)',
                            },
                        }}
                    >
                        {submitting
                            ? t.criteriaForm.saving
                            : mode === 'create'
                                ? t.criteriaForm.create
                                : t.criteriaForm.save}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    )
}

const dialogFieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        fontSize: 13,
    },

    '& .MuiInputLabel-root': {
        fontSize: 13,
    },
}