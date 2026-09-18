import { useEffect, useState, type ReactNode } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import {
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Stack,
    FormControlLabel,
    Switch,
    Typography,
    Divider,
    InputAdornment,
    IconButton,
} from '@mui/material'

import {
    PersonOutlined,
    BadgeOutlined,
    BusinessOutlined,
    LockOutlined,
    Visibility,
    VisibilityOff,
} from '@mui/icons-material'

import type { UserDto } from '../types'
import type { DepartmentDto } from '../../../shared/types/department'
import type { JobPositionDto } from '../../../shared/types/jobPosition'

import { useLanguage } from '../../../shared/i18n/LanguageContext'
import { translations } from '../../../shared/i18n/translations'

interface UserFormDialogProps {
    open: boolean
    mode: 'create' | 'edit'
    initialData?: UserDto | null
    departments: DepartmentDto[]
    jobPositions: JobPositionDto[]
    submitting: boolean
    onSubmit: (values: UserFormValues) => void
    onClose: () => void
}

export type UserFormValues = {
    firstName: string
    lastName: string
    email?: string
    password?: string
    role: 'Admin' | 'Evaluator' | 'Employee'
    departmentId: number
    jobPositionId?: number | null
    isActive: boolean
}

export default function UserFormDialog({
    open,
    mode,
    initialData,
    departments,
    jobPositions,
    submitting,
    onSubmit,
    onClose,
}: UserFormDialogProps) {
    const { language } = useLanguage()
    const t = translations[language]

    const [showPassword, setShowPassword] =
        useState(false)

    const baseSchema = {
        firstName: z
            .string()
            .trim()
            .min(1, 'Ad gereklidir')
            .max(
                100,
                'Ad maksimum 100 karakter olabilir'
            ),

        lastName: z
            .string()
            .trim()
            .min(1, 'Soyad gereklidir')
            .max(
                100,
                'Soyad maksimum 100 karakter olabilir'
            ),

        role: z.enum([
            'Admin',
            'Evaluator',
            'Employee',
        ]),

        departmentId: z
            .number()
            .min(
                1,
                t.userForm.selectDepartmentError
            ),

        jobPositionId: z
            .number()
            .optional()
            .nullable(),

        isActive: z.boolean(),
    }

    const createSchema = z.object({
        ...baseSchema,

        email: z
            .string()
            .min(1, 'Email gereklidir')
            .email(
                'Geçerli bir email adresi giriniz'
            )
            .max(
                200,
                'Email maksimum 200 karakter olabilir'
            ),

        password: z
            .string()
            .min(1, 'Şifre gereklidir')
            .min(
                8,
                'Şifre en az 8 karakter olmalı'
            )
            .max(
                256,
                'Şifre maksimum 256 karakter olabilir'
            )
            .regex(
                /[A-Z]/,
                'Şifre en az bir büyük harf içermeli'
            )
            .regex(
                /[a-z]/,
                'Şifre en az bir küçük harf içermeli'
            )
            .regex(
                /[0-9]/,
                'Şifre en az bir sayı içermeli'
            )
            .regex(
                /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
                'Şifre en az bir özel karakter içermeli'
            ),
    })

    const editSchema = z.object({
        firstName: z
            .string()
            .min(1, 'Ad boş olamaz.')
            .max(
                100,
                'Ad maksimum 100 karakter olabilir.'
            ),

        lastName: z
            .string()
            .min(1, 'Soyad boş olamaz.')
            .max(
                100,
                'Soyad maksimum 100 karakter olabilir.'
            ),

        role: z.enum(
            ['Admin', 'Evaluator', 'Employee'],
            {
                message:
                    'Geçerli bir rol seçilmelidir.',
            }
        ),

        departmentId: z
            .number()
            .gt(
                0,
                'Departman seçilmelidir.'
            ),

        jobPositionId: z
            .number()
            .optional()
            .nullable(),

        isActive: z.boolean(),

        email: z.string().optional(),
        password: z.string().optional(),
    })

    const schema =
        mode === 'create'
            ? createSchema
            : editSchema

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<UserFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            role: 'Employee',
            departmentId: 0,
            jobPositionId: null,
            isActive: true,
        },
    })

    const selectedDepartmentId = useWatch({
        control,
        name: 'departmentId',
    })

    const filteredJobPositions =
        jobPositions.filter(
            (position) =>
                position.departmentId ===
                selectedDepartmentId
        )

    useEffect(() => {
        if (!open) return

        setShowPassword(false)

        if (mode === 'edit' && initialData) {
            const departmentId =
                departments.find(
                    (department) =>
                        department.name ===
                        initialData.departmentName
                )?.id ?? 0

            const jobPositionId =
                jobPositions.find(
                    (position) =>
                        position.name ===
                        initialData.jobPositionName &&
                        position.departmentId ===
                        departmentId
                )?.id ?? null

            reset({
                firstName:
                    initialData.firstName,
                lastName:
                    initialData.lastName,
                email: initialData.email,
                password: '',
                role:
                    initialData.role as UserFormValues['role'],
                departmentId,
                jobPositionId,
                isActive:
                    initialData.isActive,
            })
        } else {
            reset({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                role: 'Employee',
                departmentId: 0,
                jobPositionId: null,
                isActive: true,
            })
        }
    }, [
        open,
        mode,
        initialData,
        departments,
        jobPositions,
        reset,
    ])

    const roleOptions = [
        {
            value: 'Admin' as const,
            label: t.roles.Admin,
        },
        {
            value: 'Evaluator' as const,
            label: t.roles.Evaluator,
        },
        {
            value: 'Employee' as const,
            label: t.roles.Employee,
        },
    ]

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
                            'dialogEnter 260ms ease-out',
                        '@keyframes dialogEnter': {
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
                    py: 2.25,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                    }}
                >
                    <Box
                        sx={{
                            width: 42,
                            height: 42,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor:
                                'rgba(245,179,1,0.12)',
                            color: '#C68E00',
                            flexShrink: 0,
                        }}
                    >
                        {mode === 'create' ? (
                            <PersonOutlined />
                        ) : (
                            <BadgeOutlined />
                        )}
                    </Box>

                    <Box>
                        <Typography
                            sx={{
                                fontWeight: 850,
                                fontSize: 18,
                                letterSpacing:
                                    '-0.2px',
                            }}
                        >
                            {mode === 'create'
                                ? t.userForm.createTitle
                                : t.userForm.editTitle}
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{
                                fontSize: 11.5,
                                mt: 0.25,
                            }}
                        >
                            {mode === 'create'
                                ? language === 'tr'
                                    ? 'Yeni bir sistem kullanıcısı oluşturun.'
                                    : 'Create a new system user.'
                                : language === 'tr'
                                    ? 'Kullanıcı bilgilerini ve erişim durumunu güncelleyin.'
                                    : 'Update user information and access status.'}
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
                    <Stack spacing={2.25}>
                        <SectionTitle
                            icon={<PersonOutlined />}
                            title={
                                language === 'tr'
                                    ? 'Kişisel Bilgiler'
                                    : 'Personal Information'
                            }
                        />

                        <Stack
                            direction={{
                                xs: 'column',
                                sm: 'row',
                            }}
                            spacing={1.5}
                        >
                            <Controller
                                name="firstName"
                                control={control}
                                render={({
                                    field,
                                }) => (
                                    <TextField
                                        {...field}
                                        label={
                                            t.userForm
                                                .firstName
                                        }
                                        fullWidth
                                        error={
                                            !!errors.firstName
                                        }
                                        helperText={
                                            errors.firstName
                                                ?.message
                                        }
                                        size="small"
                                        sx={fieldSx}
                                    />
                                )}
                            />

                            <Controller
                                name="lastName"
                                control={control}
                                render={({
                                    field,
                                }) => (
                                    <TextField
                                        {...field}
                                        label={
                                            t.userForm
                                                .lastName
                                        }
                                        fullWidth
                                        error={
                                            !!errors.lastName
                                        }
                                        helperText={
                                            errors.lastName
                                                ?.message
                                        }
                                        size="small"
                                        sx={fieldSx}
                                    />
                                )}
                            />
                        </Stack>

                        <SectionTitle
                            icon={<LockOutlined />}
                            title={
                                language === 'tr'
                                    ? 'Hesap Bilgileri'
                                    : 'Account Information'
                            }
                        />

                        {mode === 'create' ? (
                            <>
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({
                                        field,
                                    }) => (
                                        <TextField
                                            {...field}
                                            label={
                                                t.userForm
                                                    .email
                                            }
                                            fullWidth
                                            size="small"
                                            error={
                                                !!errors.email
                                            }
                                            helperText={
                                                errors.email
                                                    ?.message
                                            }
                                            sx={fieldSx}
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Typography
                                                                sx={{
                                                                    fontSize: 12,
                                                                    color: 'text.secondary',
                                                                }}
                                                            >
                                                                @
                                                            </Typography>
                                                        </InputAdornment>
                                                    ),
                                                },
                                            }}
                                        />
                                    )}
                                />

                                <Controller
                                    name="password"
                                    control={control}
                                    render={({
                                        field,
                                    }) => (
                                        <TextField
                                            {...field}
                                            label={
                                                t.userForm
                                                    .password
                                            }
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            fullWidth
                                            size="small"
                                            error={
                                                !!errors.password
                                            }
                                            helperText={
                                                errors.password
                                                    ?.message
                                            }
                                            sx={fieldSx}
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <LockOutlined
                                                                sx={{
                                                                    fontSize: 18,
                                                                    color: 'text.secondary',
                                                                }}
                                                            />
                                                        </InputAdornment>
                                                    ),
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() =>
                                                                    setShowPassword(
                                                                        (value) =>
                                                                            !value
                                                                    )
                                                                }
                                                                edge="end"
                                                            >
                                                                {showPassword ? (
                                                                    <VisibilityOff fontSize="small" />
                                                                ) : (
                                                                    <Visibility fontSize="small" />
                                                                )}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </>
                        ) : (
                            <Box
                                sx={{
                                    px: 1.5,
                                    py: 1.25,
                                    borderRadius: 2,
                                    bgcolor:
                                        'action.hover',
                                    border: '1px solid',
                                    borderColor:
                                        'divider',
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: 10.5,
                                        color: 'text.secondary',
                                        fontWeight: 200,
                                        mb: 0.3,
                                    }}
                                >
                                    {language === 'tr'
                                        ? 'E-posta'
                                        : 'Email'}
                                </Typography>

                                <Controller
                                    name="email"
                                    control={control}
                                    render={({
                                        field,
                                    }) => (
                                        <Typography
                                            sx={{
                                                fontSize: 13,
                                                fontWeight: 400,
                                            }}
                                        >
                                            {field.value ||
                                                '-'}
                                        </Typography>
                                    )}
                                />
                            </Box>
                        )}

                        <SectionTitle
                            icon={
                                <BusinessOutlined />
                            }
                            title={
                                language === 'tr'
                                    ? 'Organizasyon ve Rol'
                                    : 'Organization & Role'
                            }
                        />

                        <Stack
                            direction={{
                                xs: 'column',
                                sm: 'row',
                            }}
                            spacing={1.5}
                        >
                            <Controller
                                name="role"
                                control={control}
                                render={({
                                    field,
                                }) => (
                                    <TextField
                                        {...field}
                                        select
                                        label={
                                            t.userForm.role
                                        }
                                        fullWidth
                                        size="small"
                                        error={
                                            !!errors.role
                                        }
                                        helperText={
                                            errors.role
                                                ?.message
                                        }
                                        sx={fieldSx}
                                    >
                                        {roleOptions.map(
                                            (
                                                option
                                            ) => (
                                                <MenuItem
                                                    key={
                                                        option.value
                                                    }
                                                    value={
                                                        option.value
                                                    }
                                                >
                                                    {
                                                        option.label
                                                    }
                                                </MenuItem>
                                            )
                                        )}
                                    </TextField>
                                )}
                            />

                            <Controller
                                name="departmentId"
                                control={control}
                                render={({
                                    field,
                                }) => (
                                    <TextField
                                        {...field}
                                        value={
                                            field.value ===
                                                0
                                                ? ''
                                                : field.value ??
                                                ''
                                        }
                                        onChange={(
                                            event
                                        ) => {
                                            const departmentId =
                                                Number(
                                                    event
                                                        .target
                                                        .value
                                                )

                                            field.onChange(
                                                departmentId
                                            )

                                            setValue(
                                                'jobPositionId',
                                                null,
                                                {
                                                    shouldValidate:
                                                        true,
                                                }
                                            )
                                        }}
                                        select
                                        label={
                                            t.userForm
                                                .department
                                        }
                                        fullWidth
                                        size="small"
                                        error={
                                            !!errors.departmentId
                                        }
                                        helperText={
                                            errors
                                                .departmentId
                                                ?.message
                                        }
                                        sx={fieldSx}
                                    >
                                        <MenuItem value="">
                                            {
                                                t
                                                    .userForm
                                                    .selectDepartment
                                            }
                                        </MenuItem>

                                        {departments.map(
                                            (
                                                department
                                            ) => (
                                                <MenuItem
                                                    key={
                                                        department.id
                                                    }
                                                    value={
                                                        department.id
                                                    }
                                                >
                                                    {
                                                        department.name
                                                    }
                                                </MenuItem>
                                            )
                                        )}
                                    </TextField>
                                )}
                            />
                        </Stack>

                        <Controller
                            name="jobPositionId"
                            control={control}
                            render={({
                                field,
                            }) => (
                                <TextField
                                    {...field}
                                    value={
                                        field.value ===
                                            0
                                            ? ''
                                            : field.value ??
                                            ''
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        field.onChange(
                                            event.target
                                                .value ===
                                                ''
                                                ? null
                                                : Number(
                                                    event
                                                        .target
                                                        .value
                                                )
                                        )
                                    }
                                    select
                                    disabled={
                                        !selectedDepartmentId ||
                                        selectedDepartmentId ===
                                        0
                                    }
                                    label={
                                        t.userForm
                                            .position
                                    }
                                    fullWidth
                                    size="small"
                                    sx={fieldSx}
                                    slotProps={{
                                        inputLabel: {
                                            shrink: true,
                                        },
                                    }}
                                >
                                    <MenuItem value="">
                                        {!selectedDepartmentId ||
                                            selectedDepartmentId ===
                                            0
                                            ? language ===
                                                'tr'
                                                ? 'Önce departman seçin'
                                                : 'Select a department first'
                                            : t.userForm
                                                .notSelected}
                                    </MenuItem>

                                    {filteredJobPositions.map(
                                        (
                                            position
                                        ) => (
                                            <MenuItem
                                                key={
                                                    position.id
                                                }
                                                value={
                                                    position.id
                                                }
                                            >
                                                {
                                                    position.name
                                                }
                                            </MenuItem>
                                        )
                                    )}
                                </TextField>
                            )}
                        />

                        {mode === 'edit' && (
                            <>
                                <Divider />

                                <Box
                                    sx={{
                                        display:
                                            'flex',
                                        alignItems:
                                            'center',
                                        justifyContent:
                                            'space-between',
                                        gap: 2,
                                        p: 1.5,
                                        borderRadius: 2,
                                        bgcolor:
                                            'rgba(245,179,1,0.055)',
                                        border: '1px solid',
                                        borderColor:
                                            'rgba(245,179,1,0.16)',
                                    }}
                                >
                                    <Box>
                                        <Typography
                                            sx={{
                                                fontSize: 13,
                                                fontWeight: 400,
                                            }}
                                        >
                                            {language ===
                                                'tr'
                                                ? 'Kullanıcı Durumu'
                                                : 'User Status'}
                                        </Typography>

                                        <Typography
                                            color="text.secondary"
                                            sx={{
                                                fontSize: 11,
                                                mt: 0.25,
                                            }}
                                        >
                                            {language ===
                                                'tr'
                                                ? 'Kullanıcının sisteme erişimini yönetin.'
                                                : 'Manage the user’s system access.'}
                                        </Typography>
                                    </Box>

                                    <Controller
                                        name="isActive"
                                        control={
                                            control
                                        }
                                        render={({
                                            field,
                                        }) => (
                                            <FormControlLabel
                                                sx={{
                                                    m: 0,
                                                }}
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
                                                        ? language ===
                                                            'tr'
                                                            ? 'Aktif'
                                                            : 'Active'
                                                        : language ===
                                                            'tr'
                                                            ? 'Pasif'
                                                            : 'Inactive'
                                                }
                                            />
                                        )}
                                    />
                                </Box>
                            </>
                        )}
                    </Stack>
                </DialogContent>

                <DialogActions
                    sx={{
                        px: { xs: 2.5, sm: 3 },
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
                            fontWeight: 500,
                        }}
                    >
                        {t.userForm.cancel}
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={submitting}
                        sx={{
                            minWidth: 120,
                            minHeight: 40,
                            borderRadius: 2,
                            bgcolor: '#F5B301',
                            color: '#111111',
                            fontWeight: 500,
                            boxShadow: 'none',
                            '&:hover': {
                                bgcolor: '#E0A300',
                                boxShadow:
                                    '0 6px 18px rgba(245,179,1,0.18)',
                            },
                        }}
                    >
                        {submitting
                            ? language === 'tr'
                                ? 'Kaydediliyor...'
                                : 'Saving...'
                            : mode === 'create'
                                ? t.userForm.create
                                : t.userForm.update}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    )
}

function SectionTitle({
    icon,
    title,
}: {
    icon: ReactNode
    title: string
}) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                pt: 0.25,
            }}
        >
            <Box
                sx={{
                    color: '#C68E00',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                {icon}
            </Box>

            <Typography
                sx={{
                    fontSize: 12,
                    fontWeight: 200,
                    letterSpacing: 0.3,
                    textTransform: 'uppercase',
                }}
            >
                {title}
            </Typography>
        </Box>
    )
}

const fieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        fontSize: 13,
        fontWeight: 400,
    },

    '& .MuiInputLabel-root': {
        fontSize: 13,
    },
}