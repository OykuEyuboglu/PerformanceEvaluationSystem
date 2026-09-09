import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, Box } from '@mui/material'
import type { EvaluationPeriod } from '../types'

const schema = z
    .object({
        name: z.string().min(2, 'Dönem adı en az 2 karakter olmalı'),
        startDate: z.string().min(1, 'Başlangıç tarihi gerekli'),
        endDate: z.string().min(1, 'Bitiş tarihi gerekli'),
    })
    .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
        message: 'Bitiş tarihi başlangıçtan önce olamaz',
        path: ['endDate'],
    })

export type EvaluationPeriodFormValues = z.infer<typeof schema>

interface EvaluationPeriodFormDialogProps {
    open: boolean
    mode: 'create' | 'edit'
    initialData?: EvaluationPeriod | null
    submitting: boolean
    onSubmit: (values: EvaluationPeriodFormValues) => void
    onClose: () => void
}

const toInputDate = (iso: string) => iso.split('T')[0]

export default function EvaluationPeriodFormDialog({
    open, mode, initialData, submitting, onSubmit, onClose,
}: EvaluationPeriodFormDialogProps) {
    const { control, handleSubmit, reset, formState: { errors } } = useForm<EvaluationPeriodFormValues>({
        resolver: zodResolver(schema),
        defaultValues: { name: '', startDate: '', endDate: '' },
    })

    useEffect(() => {
        if (open) {
            reset(
                mode === 'edit' && initialData
                    ? {
                        name: initialData.name,
                        startDate: toInputDate(initialData.startDate),
                        endDate: toInputDate(initialData.endDate),
                    }
                    : { name: '', startDate: '', endDate: '' }
            )
        }
    }, [open, mode, initialData, reset])

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>
                {mode === 'create' ? 'Yeni Değerlendirme Dönemi' : 'Dönemi Düzenle'}
            </DialogTitle>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ mt: 0.5 }}>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Dönem Adı" placeholder="Örn. 2025 Yıl Sonu Performans Değerlendirmesi"
                                    fullWidth error={!!errors.name} helperText={errors.name?.message}/>
                            )}
                        />
                        <Controller
                            name="startDate"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    type="date"
                                    label="Başlangıç Tarihi"
                                    fullWidth
                                    slotProps={{
                                        inputLabel: {
                                            shrink: true,
                                        },
                                    }}
                                    error={!!errors.startDate}
                                    helperText={errors.startDate?.message}
                                />
                            )}
                        />
                        <Controller
                            name="endDate"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    type="date"
                                    label="Bitiş Tarihi"
                                    fullWidth
                                    slotProps={{
                                        inputLabel: {
                                            shrink: true,
                                        },
                                    }}
                                    error={!!errors.endDate}
                                    helperText={errors.endDate?.message}
                                />
                            )}
                        />
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