import { useEffect, useRef } from 'react'
import {
    useForm,
    Controller,
    useFieldArray,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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

import type {
    PerformanceCategoryDto,
    PerformanceCriterionDto,
} from '../types'

import type { JobPositionDto } from '../../../shared/types/jobPosition'

const schema = z.object({
    name: z
        .string()
        .min(
            2,
            'Kriter adı en az 2 karakter olmalı'
        ),

    performanceCategoryId: z
        .number()
        .min(
            1,
            'Ana kategori belirtilmelidir'
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
                        'Açıklama boş bırakılamaz'
                    ),
            })
        )
        .min(
            1,
            'En az bir iş pozisyonu seçmelisin'
        ),
})

export type CriterionFormValues =
    z.infer<typeof schema>

interface CriterionFormDialogProps {
    open: boolean
    mode: 'create' | 'edit'
    initialData?: PerformanceCriterionDto | null
    categories: PerformanceCategoryDto[]
    jobPositions: JobPositionDto[]
    categoryId?: number | null
    submitting: boolean
    onSubmit: (
        values: CriterionFormValues
    ) => void
    onClose: () => void
}

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
    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CriterionFormValues>({
        resolver: zodResolver(schema),

        defaultValues: {
            name: '',
            performanceCategoryId: 0,
            isActive: true,
            jobPositionDescriptions: [],
        },
    })

    const { fields } =
        useFieldArray({
            control,
            name: 'jobPositionDescriptions',
        })

    const descriptionCache =
        useRef<Record<number, string>>({})

    useEffect(() => {
        if (!open) {
            return
        }

        descriptionCache.current = {}

        if (mode === 'edit' && initialData) {
            initialData.jobPositionDescriptions.forEach(
                (item) => {
                    descriptionCache.current[
                        item.jobPositionId
                    ] = item.description
                }
            )

            reset({
                name: initialData.name,

                performanceCategoryId:
                    initialData.performanceCategoryId,

                isActive: initialData.isActive,

                jobPositionDescriptions:
                    initialData.jobPositionDescriptions.map(
                        (item) => ({
                            jobPositionId:
                                item.jobPositionId,

                            description:
                                item.description,
                        })
                    ),
            })

            return
        }

        reset({
            name: '',
            performanceCategoryId:
                categoryId ?? 0,
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

    const selectedIds =
        fields.map(
            (field) =>
                field.jobPositionId
        )

    const selectedPositions =
        jobPositions.filter((position) =>
            selectedIds.includes(position.id)
        )

    const selectedCategoryId =
        watch('performanceCategoryId')

    const selectedCategory =
        categories.find(
            (category) =>
                category.id ===
                selectedCategoryId
        )

    const handlePositionSelectionChange = (
        newSelected: JobPositionDto[]
    ) => {
        const newIds =
            newSelected.map(
                (position) => position.id
            )

        /*
         * Kaldırılan pozisyonların açıklamalarını
         * önbelleğe alıyoruz.
         */
        fields.forEach((field, index) => {
            if (
                !newIds.includes(
                    field.jobPositionId
                )
            ) {
                descriptionCache.current[
                    field.jobPositionId
                ] = watch(
                    `jobPositionDescriptions.${index}.description`
                )
            }
        })

        /*
         * Hâlihazırda seçili olan pozisyonların
         * açıklamalarını koruyoruz.
         */
        const keptDescriptions =
            fields
                .map((field, index) => ({
                    jobPositionId:
                        field.jobPositionId,

                    description: watch(
                        `jobPositionDescriptions.${index}.description`
                    ),
                }))
                .filter((item) =>
                    newIds.includes(
                        item.jobPositionId
                    )
                )

        /*
         * Yeni seçilen pozisyonları ekliyoruz.
         */
        const addedIds =
            newIds.filter(
                (id) =>
                    !selectedIds.includes(id)
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
            }
        )
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle
                sx={{
                    fontWeight: 700,
                }}
            >
                {mode === 'create'
                    ? 'Yeni Kriter'
                    : 'Kriteri Düzenle'}
            </DialogTitle>

            <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
            >
                <DialogContent>
                    <Stack
                        spacing={2.5}
                        sx={{ mt: 0.5 }}
                    >
                        {/* Kriter adı */}
                        <Controller
                            name="name"
                            control={control}
                            render={({
                                field,
                            }) => (
                                <TextField
                                    {...field}
                                    label="Kriter Adı"
                                    fullWidth
                                    error={
                                        !!errors.name
                                    }
                                    helperText={
                                        errors
                                            .name
                                            ?.message
                                    }
                                />
                            )}
                        />

                        {/* Ana kategori */}
                        <TextField
                            label="Ana Kategori"
                            value={
                                selectedCategory
                                    ?.name ?? ''
                            }
                            fullWidth
                            disabled
                            helperText="Kriter bu kategori altında oluşturulur."
                        />

                        {/* Aktif/Pasif */}
                        {mode === 'edit' && (
                            <Controller
                                name="isActive"
                                control={control}
                                render={({
                                    field,
                                }) => (
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={
                                                    field.value
                                                }
                                                onChange={
                                                    field.onChange
                                                }
                                            />
                                        }
                                        label="Aktif"
                                    />
                                )}
                            />
                        )}

                        <Divider />

                        {/* Pozisyon açıklamaları */}
                        <Box>
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    fontSize: 14,
                                }}
                            >
                                Bu Kriterin Uygulandığı
                                Pozisyonlar
                            </Typography>

                            <Typography
                                color="text.secondary"
                                sx={{
                                    fontSize: 12.5,
                                    mt: 0.25,
                                }}
                            >
                                Kriterin uygulanacağı
                                pozisyonları seç.
                                Seçtiğin her pozisyon
                                için açıklama girilmelidir.
                            </Typography>
                        </Box>

                        {/* Pozisyon seçimi */}
                        <Autocomplete
                            multiple
                            options={jobPositions}
                            getOptionLabel={(position) => position.name}
                            value={selectedPositions}
                            isOptionEqualToValue={(option, value) =>
                                option.id === value.id
                            }
                            getOptionDisabled={(option) =>
                                selectedIds.includes(option.id)
                            }
                            onChange={(_, newValue) =>
                                handlePositionSelectionChange(newValue)
                            }
                            renderValue={(value, getItemProps) =>
                                value.map((option, index) => {
                                    const {
                                        key,
                                        ...itemProps
                                    } = getItemProps({
                                        index,
                                    })

                                    return (
                                        <Chip
                                            key={key ?? option.id}
                                            label={option.name}
                                            size="small"
                                            {...itemProps}
                                        />
                                    )
                                })
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Pozisyon seç..."
                                    error={
                                        !!errors.jobPositionDescriptions
                                    }
                                    helperText={
                                        errors
                                            .jobPositionDescriptions
                                            ?.message
                                    }
                                />
                            )}
                        />

                        {/* Seçilen pozisyonların açıklamaları */}
                        {fields.map(
                            (
                                field,
                                index
                            ) => {
                                const position =
                                    jobPositions.find(
                                        (item) =>
                                            item.id ===
                                            field.jobPositionId
                                    )

                                return (
                                    <Controller
                                        key={
                                            field.id
                                        }
                                        name={`jobPositionDescriptions.${index}.description`}
                                        control={control}
                                        render={({
                                            field:
                                            descriptionField,
                                        }) => (
                                            <TextField
                                                {...descriptionField}
                                                label={`${position?.name ?? ''} için açıklama`}
                                                fullWidth
                                                multiline
                                                minRows={2}
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
                                            />
                                        )}
                                    />
                                )
                            }
                        )}
                    </Stack>
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        pb: 2.5,
                    }}
                >
                    <Button
                        onClick={onClose}
                        color="inherit"
                    >
                        Vazgeç
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={submitting}
                    >
                        {mode === 'create'
                            ? 'Oluştur'
                            : 'Kaydet'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    )
}