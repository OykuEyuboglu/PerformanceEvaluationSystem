import { useEffect } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, Stack, FormControlLabel, Switch, Box, Typography, Divider,
} from '@mui/material'
import type { PerformanceCategoryDto, PerformanceCriterionDto } from '../types/criteria'
import type { JobPositionDto } from '../../../shared/types/jobPosition'

const schema = z.object({
    name: z
        .string()
        .min(2, 'Kriter adı en az 2 karakter olmalı'),

    performanceCategoryId: z
        .number()
        .min(1, 'Kategori seçin'),

    isActive: z.boolean(),

    jobPositionDescriptions: z.array(
        z.object({
            jobPositionId: z.number(),
            description: z
                .string()
                .min(1, 'Açıklama boş bırakılamaz'),
        })
    ),
})

export type CriterionFormValues = z.infer<typeof schema>

interface CriterionFormDialogProps {
    open: boolean
    mode: 'create' | 'edit'
    initialData?: PerformanceCriterionDto | null
    categories: PerformanceCategoryDto[]
    jobPositions: JobPositionDto[]
    submitting: boolean
    onSubmit: (values: CriterionFormValues) => void
    onClose: () => void
}

export default function CriterionFormDialog({
    open, mode, initialData, categories, jobPositions, submitting, onSubmit, onClose,
}: CriterionFormDialogProps) {
    const { control, handleSubmit, reset, formState: { errors } } = useForm<CriterionFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '', performanceCategoryId: undefined as any, isActive: true,
            jobPositionDescriptions: jobPositions.map((p) => ({ jobPositionId: p.id, description: '' })),
        },
    })

    const { fields } = useFieldArray({ control, name: 'jobPositionDescriptions' })

    useEffect(() => {
        if (!open) return

        if (mode === 'edit' && initialData) {
            reset({
                name: initialData.name,
                performanceCategoryId: initialData.performanceCategoryId,
                isActive: initialData.isActive,
                jobPositionDescriptions: jobPositions.map((p) => ({
                    jobPositionId: p.id,
                    description:
                        initialData.jobPositionDescriptions.find((d) => d.jobPositionId === p.id)?.description ?? '',
                })),
            })
        } else {
            reset({
                name: '',
                performanceCategoryId: undefined as any,
                isActive: true,
                jobPositionDescriptions: jobPositions.map((p) => ({ jobPositionId: p.id, description: '' })),
            })
        }
    }, [open, mode, initialData, jobPositions, reset])

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>
                {mode === 'create' ? 'Yeni Kriter' : 'Kriteri Düzenle'}
            </DialogTitle>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ mt: 0.5 }}>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Kriter Adı" fullWidth
                                    error={!!errors.name} helperText={errors.name?.message} />
                            )}
                        />

                        <Controller
                            name="performanceCategoryId"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    select
                                    label="Ana Kategori"
                                    fullWidth
                                    error={!!errors.performanceCategoryId}
                                    helperText={errors.performanceCategoryId?.message}
                                >
                                    {categories.map((c) => (
                                        <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />

                        {mode === 'edit' && (
                            <Controller
                                name="isActive"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={<Switch checked={field.value} onChange={field.onChange} />}
                                        label="Aktif"
                                    />
                                )}
                            />
                        )}

                        <Divider />

                        <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                            Rol Bazlı Açıklamalar
                        </Typography>
                        <Typography color="text.secondary" sx={{ fontSize: 12.5, mt: -1.5 }}>
                            Bu kriterin her iş pozisyonu için ne anlama geldiğini ayrı ayrı açıkla.
                        </Typography>

                        {fields.map((field, index) => (
                            <Controller
                                key={field.id}
                                name={`jobPositionDescriptions.${index}.description`}
                                control={control}
                                render={({ field: descField }) => (
                                    <TextField
                                        {...descField}
                                        label={jobPositions[index]?.name}
                                        fullWidth
                                        multiline
                                        minRows={2}
                                        error={!!errors.jobPositionDescriptions?.[index]?.description}
                                        helperText={errors.jobPositionDescriptions?.[index]?.description?.message}
                                    />
                                )}
                            />
                        ))}

                        {jobPositions.length === 0 && (
                            <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                                Önce Kullanıcı Yönetimi'nde iş pozisyonu tanımlı olmalı.
                            </Typography>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={onClose} color="inherit">Vazgeç</Button>
                    <Button type="submit" variant="contained" disabled={submitting}>
                        {mode === 'create' ? 'Oluştur' : 'Kaydet'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    )
}