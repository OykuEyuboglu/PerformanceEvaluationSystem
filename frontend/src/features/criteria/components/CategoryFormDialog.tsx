import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Stack, FormControlLabel, Switch, Box, InputAdornment,
} from '@mui/material'
import type { PerformanceCategoryDto } from '../types/criteria'

const schema = z.object({
    name: z
        .string()
        .min(2, 'Kategori adı en az 2 karakter olmalı'),

    weight: z
        .number()
        .min(0.01, 'Ağırlık 0’dan büyük olmalı')
        .max(100, 'Ağırlık 100’ü geçemez'),

    isActive: z.boolean(),
})

export type CategoryFormValues = z.infer<typeof schema>

interface CategoryFormDialogProps {
    open: boolean
    mode: 'create' | 'edit'
    initialData?: PerformanceCategoryDto | null
    submitting: boolean
    onSubmit: (values: CategoryFormValues) => void
    onClose: () => void
}

export default function CategoryFormDialog({
    open, mode, initialData, submitting, onSubmit, onClose,
}: CategoryFormDialogProps) {
    const { control, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormValues>({
        resolver: zodResolver(schema),
        defaultValues: { name: '', weight: 0, isActive: true },
    })

    useEffect(() => {
        if (open) {
            reset(
                mode === 'edit' && initialData
                    ? { name: initialData.name, weight: initialData.weight, isActive: initialData.isActive }
                    : { name: '', weight: 0, isActive: true }
            )
        }
    }, [open, mode, initialData, reset])

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>
                {mode === 'create' ? 'Yeni Kategori' : 'Kategoriyi Düzenle'}
            </DialogTitle>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ mt: 0.5 }}>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Kategori Adı" fullWidth
                                    error={!!errors.name} helperText={errors.name?.message} />
                            )}
                        />
                        <Controller
                            name="weight"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    type="number"
                                    label="Ağırlık"
                                    fullWidth
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    error={!!errors.weight}
                                    helperText={errors.weight?.message}
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    %
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
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