import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
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
    InputAdornment,
} from '@mui/material'
import type { PerformanceCategoryDto } from '../types'

const schema = z.object({
    name: z.string().min(2, 'Kategori adı en az 2 karakter olmalı'),
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
    open,
    mode,
    initialData,
    submitting,
    onSubmit,
    onClose,
}: CategoryFormDialogProps) {
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CategoryFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            weight: 0,
            isActive: true,
        },
    })

    useEffect(() => {
        if (!open) return

        reset(
            mode === 'edit' && initialData
                ? {
                    name: initialData.name,
                    weight: initialData.weight,
                    isActive: initialData.isActive,
                }
                : {
                    name: '',
                    weight: 0,
                    isActive: true,
                },
        )
    }, [open, mode, initialData, reset])

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 3,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0 24px 70px rgba(0,0,0,0.16)',
                        animation:
                            'categoryDialogEnter 240ms ease-out',
                        '@keyframes categoryDialogEnter': {
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
                    px: 3,
                    py: 2.2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Typography sx={{ fontWeight: 850, fontSize: 18 }}>
                    {mode === 'create'
                        ? 'Yeni Kategori'
                        : 'Kategoriyi Düzenle'}
                </Typography>
                <Typography
                    color="text.secondary"
                    sx={{ fontSize: 11.5, mt: 0.25 }}
                >
                    Performans değerlendirmesindeki ana kategori ve ağırlığını tanımlayın.
                </Typography>
            </DialogTitle>

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <DialogContent sx={{ px: 3, py: 2.5 }}>
                    <Stack spacing={2.1}>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Kategori Adı"
                                    fullWidth
                                    size="small"
                                    error={!!errors.name}
                                    helperText={errors.name?.message}
                                    sx={categoryFieldSx}
                                />
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
                                    size="small"
                                    onChange={(e) =>
                                        field.onChange(
                                            Number(e.target.value),
                                        )
                                    }
                                    error={!!errors.weight}
                                    helperText={
                                        errors.weight?.message
                                    }
                                    sx={categoryFieldSx}
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
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    p: 1.4,
                                    borderRadius: 2,
                                    bgcolor: 'action.hover',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: 12.5,
                                            fontWeight: 750,
                                        }}
                                    >
                                        Kategori Durumu
                                    </Typography>
                                    <Typography
                                        color="text.secondary"
                                        sx={{
                                            fontSize: 10.5,
                                            mt: 0.2,
                                        }}
                                    >
                                        Pasif kategoriler yeni değerlendirmelerde kullanılmaz.
                                    </Typography>
                                </Box>

                                <Controller
                                    name="isActive"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            sx={{ m: 0 }}
                                            control={
                                                <Switch
                                                    checked={field.value}
                                                    onChange={
                                                        field.onChange
                                                    }
                                                    size="small"
                                                />
                                            }
                                            label={
                                                field.value
                                                    ? 'Aktif'
                                                    : 'Pasif'
                                            }
                                        />
                                    )}
                                />
                            </Box>
                        )}
                    </Stack>
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        py: 2,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        gap: 1,
                    }}
                >
                    <Button
                        onClick={onClose}
                        color="inherit"
                        sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                        Vazgeç
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={submitting}
                        sx={{
                            minWidth: 105,
                            borderRadius: 2,
                            bgcolor: '#F5B301',
                            color: '#111',
                            fontWeight: 800,
                            boxShadow: 'none',
                            '&:hover': {
                                bgcolor: '#E0A300',
                            },
                        }}
                    >
                        {submitting
                            ? 'Kaydediliyor...'
                            : mode === 'create'
                                ? 'Oluştur'
                                : 'Kaydet'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    )
}

const categoryFieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        fontSize: 13,
    },
    '& .MuiInputLabel-root': {
        fontSize: 13,
    },
}
