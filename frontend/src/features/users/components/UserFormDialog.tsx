import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
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
} from '@mui/material'

import type { UserDto } from '../../../shared/types/user'
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

    const baseSchema = {
        firstName: z
            .string()
            .min(2, t.userForm.firstNameMin),

        lastName: z
            .string()
            .min(2, t.userForm.lastNameMin),

        role: z.enum([
            'Admin',
            'Evaluator',
            'Employee',
        ]),

        departmentId: z
            .number()
            .min(1, t.userForm.selectDepartmentError),

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
            .email(t.userForm.validEmail),

        password: z
            .string()
            .min(6, t.userForm.passwordMin),
    })

    const editSchema = z.object({
        ...baseSchema,
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
        formState: { errors },
    } = useForm<UserFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            role: 'Employee',
            departmentId: undefined,
            jobPositionId: null,
            isActive: true,
        },
    })

    useEffect(() => {
        if (!open) return

        if (mode === 'edit' && initialData) {
            reset({
                firstName: initialData.firstName,
                lastName: initialData.lastName,
                email: initialData.email,
                password: '',
                role:
                    initialData.role as UserFormValues['role'],

                departmentId:
                    departments.find(
                        (department) =>
                            department.name ===
                            initialData.departmentName
                    )?.id,

                jobPositionId:
                    jobPositions.find(
                        (position) =>
                            position.name ===
                            initialData.jobPositionName
                    )?.id ?? null,

                isActive: initialData.isActive,
            })
        } else {
            reset({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                role: 'Employee',
                departmentId: undefined,
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
        >
            <DialogTitle sx={{ fontWeight: 700 }}>
                {mode === 'create'
                    ? t.userForm.createTitle
                    : t.userForm.editTitle}
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
                        {/* Ad - Soyad */}
                        <Stack
                            direction={{
                                xs: 'column',
                                sm: 'row',
                            }}
                            spacing={2}
                        >
                            <Controller
                                name="firstName"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label={
                                            t.userForm.firstName
                                        }
                                        fullWidth
                                        error={
                                            !!errors.firstName
                                        }
                                        helperText={
                                            errors.firstName
                                                ?.message
                                        }
                                    />
                                )}
                            />

                            <Controller
                                name="lastName"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label={
                                            t.userForm.lastName
                                        }
                                        fullWidth
                                        error={
                                            !!errors.lastName
                                        }
                                        helperText={
                                            errors.lastName
                                                ?.message
                                        }
                                    />
                                )}
                            />
                        </Stack>

                        {/* E-posta - Şifre */}
                        {mode === 'create' && (
                            <>
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label={
                                                t.userForm.email
                                            }
                                            fullWidth
                                            error={
                                                !!errors.email
                                            }
                                            helperText={
                                                errors.email
                                                    ?.message
                                            }
                                        />
                                    )}
                                />

                                <Controller
                                    name="password"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label={
                                                t.userForm.password
                                            }
                                            type="password"
                                            fullWidth
                                            error={
                                                !!errors.password
                                            }
                                            helperText={
                                                errors.password
                                                    ?.message
                                            }
                                        />
                                    )}
                                />
                            </>
                        )}

                        {/* Rol - Departman */}
                        <Stack
                            direction={{
                                xs: 'column',
                                sm: 'row',
                            }}
                            spacing={2}
                        >
                            <Controller
                                name="role"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        label={
                                            t.userForm.role
                                        }
                                        fullWidth
                                    >
                                        {roleOptions.map(
                                            (option) => (
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
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        value={
                                            field.value ?? ''
                                        }
                                        onChange={(event) =>
                                            field.onChange(
                                                Number(
                                                    event.target.value
                                                )
                                            )
                                        }
                                        select
                                        label={
                                            t.userForm.department
                                        }
                                        fullWidth
                                        error={
                                            !!errors.departmentId
                                        }
                                        helperText={
                                            errors.departmentId
                                                ?.message
                                        }
                                    >
                                        <MenuItem value="">
                                            {
                                                t.userForm.selectDepartment
                                            }
                                        </MenuItem>

                                        {departments.map(
                                            (department) => (
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

                        {/* İş Pozisyonu */}
                        <Controller
                            name="jobPositionId"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    value={
                                        field.value ?? ''
                                    }
                                    onChange={(event) =>
                                        field.onChange(
                                            event.target.value === ''
                                                ? null
                                                : Number(
                                                    event.target.value
                                                )
                                        )
                                    }
                                    select
                                    label={
                                        t.userForm.position
                                    }
                                    fullWidth
                                >
                                    <MenuItem value="">
                                        {t.userForm.notSelected}
                                    </MenuItem>

                                    {jobPositions.map(
                                        (position) => (
                                            <MenuItem
                                                key={
                                                    position.id
                                                }
                                                value={
                                                    position.id
                                                }
                                            >
                                                {position.name}
                                            </MenuItem>
                                        )
                                    )}
                                </TextField>
                            )}
                        />

                        {/* Aktif kullanıcı */}
                        {mode === 'edit' && (
                            <Controller
                                name="isActive"
                                control={control}
                                render={({ field }) => (
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
                                        label={
                                            t.userForm.activeUser
                                        }
                                    />
                                )}
                            />
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
                        {t.userForm.cancel}
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={submitting}
                    >
                        {mode === 'create'
                            ? t.userForm.create
                            : t.userForm.update}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    )
}