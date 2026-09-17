import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
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
    Box,
    Typography,
    Divider,
} from '@mui/material'

import {
    CalendarMonthOutlined,
} from '@mui/icons-material'

import type { EvaluationPeriod } from '../types'

interface EvaluationPeriodFormDialogProps {
    open: boolean
    mode: 'create' | 'edit'
    initialData?: EvaluationPeriod | null
    submitting: boolean
    onSubmit: (values: EvaluationPeriodFormValues) => void
    onClose: () => void
}

const getEvaluationPeriodSchema = (
    language: 'tr' | 'en',
) =>
    z
        .object({
            name: z.string().min(
                2,
                language === 'tr'
                    ? 'Dönem adı en az 2 karakter olmalı'
                    : 'Period name must be at least 2 characters',
            ),

            startDate: z.string().min(
                1,
                language === 'tr'
                    ? 'Başlangıç tarihi gerekli'
                    : 'Start date is required',
            ),

            endDate: z.string().min(
                1,
                language === 'tr'
                    ? 'Bitiş tarihi gerekli'
                    : 'End date is required',
            ),
        })
        .refine(
            (data) =>
                new Date(data.endDate) >=
                new Date(data.startDate),
            {
                message:
                    language === 'tr'
                        ? 'Bitiş tarihi başlangıçtan önce olamaz'
                        : 'End date cannot be before the start date',
                path: ['endDate'],
            },
        )

export type EvaluationPeriodFormValues = z.infer<
    ReturnType<typeof getEvaluationPeriodSchema>
>

const toInputDate = (iso: string) =>
    iso.split('T')[0]

export default function EvaluationPeriodFormDialog({
    open,
    mode,
    initialData,
    submitting,
    onSubmit,
    onClose,
}: EvaluationPeriodFormDialogProps) {
    const { language } = useLanguage()
    const t = translations[language]

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<EvaluationPeriodFormValues>({
        resolver: zodResolver(
            getEvaluationPeriodSchema(language),
        ),
        defaultValues: {
            name: '',
            startDate: '',
            endDate: '',
        },
    })

    useEffect(() => {
        if (!open) return

        reset(
            mode === 'edit' && initialData
                ? {
                    name: initialData.name,
                    startDate: toInputDate(
                        initialData.startDate,
                    ),
                    endDate: toInputDate(
                        initialData.endDate,
                    ),
                }
                : {
                    name: '',
                    startDate: '',
                    endDate: '',
                },
        )
    }, [
        open,
        mode,
        initialData,
        reset,
    ])

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
                        boxShadow:
                            '0 24px 70px rgba(0,0,0,0.16)',
                        animation:
                            'periodDialogEnter 240ms ease-out',

                        '@keyframes periodDialogEnter': {
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
                        <CalendarMonthOutlined />
                    </Box>

                    <Box>
                        <Typography
                            sx={{
                                fontWeight: 850,
                                fontSize: 18,
                            }}
                        >
                            {mode === 'create'
                                ? t.evaluationPeriodForm
                                    .createTitle
                                : t.evaluationPeriodForm
                                    .editTitle}
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{
                                fontSize: 11.5,
                                mt: 0.2,
                            }}
                        >
                            {
                                t.evaluationPeriodForm
                                    .description
                            }
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
                        px: 3,
                        py: 2.5,
                    }}
                >
                    <Stack spacing={2.1}>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label={
                                        t.evaluationPeriodForm
                                            .periodName
                                    }
                                    placeholder={
                                        t.evaluationPeriodForm
                                            .periodNamePlaceholder
                                    }
                                    fullWidth
                                    size="small"
                                    error={!!errors.name}
                                    helperText={
                                        errors.name?.message
                                    }
                                    sx={fieldSx}
                                />
                            )}
                        />

                        <Divider />

                        <Box>
                            <Typography
                                sx={{
                                    fontWeight: 800,
                                    fontSize: 13,
                                }}
                            >
                                {
                                    t.evaluationPeriodForm
                                        .dateRange
                                }
                            </Typography>

                            <Typography
                                color="text.secondary"
                                sx={{
                                    fontSize: 11,
                                    mt: 0.25,
                                }}
                            >
                                {
                                    t.evaluationPeriodForm
                                        .dateRangeDescription
                                }
                            </Typography>
                        </Box>

                        <Controller
                            name="startDate"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    type="date"
                                    label={
                                        t.evaluationPeriodForm
                                            .startDate
                                    }
                                    fullWidth
                                    size="small"
                                    slotProps={{
                                        inputLabel: {
                                            shrink: true,
                                        },
                                    }}
                                    error={
                                        !!errors.startDate
                                    }
                                    helperText={
                                        errors.startDate
                                            ?.message
                                    }
                                    sx={fieldSx}
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
                                    label={
                                        t.evaluationPeriodForm
                                            .endDate
                                    }
                                    fullWidth
                                    size="small"
                                    slotProps={{
                                        inputLabel: {
                                            shrink: true,
                                        },
                                    }}
                                    error={
                                        !!errors.endDate
                                    }
                                    helperText={
                                        errors.endDate
                                            ?.message
                                    }
                                    sx={fieldSx}
                                />
                            )}
                        />
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
                        sx={{
                            borderRadius: 2,
                            fontWeight: 700,
                        }}
                    >
                        {
                            t.evaluationPeriodForm
                                .cancel
                        }
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
                                boxShadow:
                                    '0 6px 18px rgba(245,179,1,0.18)',
                            },
                        }}
                    >
                        {submitting
                            ? t.evaluationPeriodForm
                                .saving
                            : mode === 'create'
                                ? t.evaluationPeriodForm
                                    .create
                                : t.evaluationPeriodForm
                                    .save}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    )
}

const fieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        fontSize: 13,
    },

    '& .MuiInputLabel-root': {
        fontSize: 13,
    },
}