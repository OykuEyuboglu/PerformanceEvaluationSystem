import { useEffect, useState, type ReactNode } from 'react'
import {
    useForm,
    Controller,
    useWatch,
} from 'react-hook-form'
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
    onChangePassword: (
        userId: number,
        newPassword: string,
    ) => Promise<void>
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
    onChangePassword,
    onClose,
}: UserFormDialogProps) {
    const { language } = useLanguage()
    const t = translations[language]

    const [showPassword, setShowPassword] =
        useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [changingPassword, setChangingPassword] =
        useState(false)

    const baseSchema = {
        firstName: z
            .string()
            .trim()
            .min(1, t.userForm.firstNameRequired)
            .max(
                100,
                t.userForm.firstNameMax
            ),

        lastName: z
            .string()
            .trim()
            .min(1, t.userForm.lastNameRequired)
            .max(
                100,
                t.userForm.lastNameMax
            ),

        role: z.enum(
            ['Admin', 'Evaluator', 'Employee'],
            { message: t.userForm.validRole },
        ),

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

    const validateNewPassword = (
        password: string,
    ): string => {
        if (!password) {
            return t.userForm.passwordRequired
        }

        if (password.length < 8) {
            return t.userForm.passwordMin
        }

        if (password.length > 256) {
            return t.userForm.passwordMax
        }

        if (!/[A-Z]/.test(password)) {
            return t.userForm.passwordUppercase
        }

        if (!/[a-z]/.test(password)) {
            return t.userForm.passwordLowercase
        }

        if (!/[0-9]/.test(password)) {
            return t.userForm.passwordNumber
        }

        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            return t.userForm.passwordSpecial
        }

        return ''
    }

    const createSchema = z.object({
        ...baseSchema,

        email: z
            .string()
            .trim()
            .min(1, t.userForm.emailRequired)
            .max(
                200,
                t.userForm.emailMax
            )
            .regex(
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                t.userForm.validEmail
            ),

        password: z
            .string()
            .min(1, t.userForm.passwordRequired)
            .min(
                8,
                t.userForm.passwordMin
            )
            .max(
                256,
                t.userForm.passwordMax
            )
            .regex(
                /[A-Z]/,
                t.userForm.passwordUppercase
            )
            .regex(
                /[a-z]/,
                t.userForm.passwordLowercase
            )
            .regex(
                /[0-9]/,
                t.userForm.passwordNumber
            )
            .regex(
                /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
                t.userForm.passwordSpecial
            ),
    })

    const editSchema = z.object({
        firstName: z
            .string()
            .trim()
            .min(1, t.userForm.firstNameEmpty)
            .max(
                100,
                t.userForm.firstNameMax
            ),

        lastName: z
            .string()
            .trim()
            .min(1, t.userForm.lastNameEmpty)
            .max(
                100,
                t.userForm.lastNameMax
            ),

        role: z.enum(
            ['Admin', 'Evaluator', 'Employee'],
            {
                message:
                    t.userForm.validRole,
            }
        ),

        departmentId: z
            .number()
            .gt(
                0,
                t.userForm.departmentRequired
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
        setNewPassword('')
        setPasswordError('')
        setChangingPassword(false)

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

                email:
                    initialData.email,

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
                        width: '100%',
                        maxHeight: 'calc(100vh - 32px)',
                        display: 'flex',
                        flexDirection: 'column',
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
                    flexShrink: 0,
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
                            bgcolor: 'rgba(245,179,1,0.12)',
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
                                letterSpacing: '-0.2px',
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
                                ? t.userForm.createDescription
                                : t.userForm.editDescription}
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    minHeight: 0,
                }}
            >
                <DialogContent
                    sx={{
                        px: { xs: 2.5, sm: 3 },
                        py: 2.5,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        flex: 1,
                        minHeight: 0,

                        '&::-webkit-scrollbar': {
                            width: 6,
                        },

                        '&::-webkit-scrollbar-track': {
                            background: 'transparent',
                        },

                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor:
                                'rgba(0,0,0,0.18)',
                            borderRadius: 10,
                        },

                        '&::-webkit-scrollbar-thumb:hover': {
                            backgroundColor:
                                'rgba(0,0,0,0.28)',
                        },
                    }}
                >
                    <Stack spacing={2.25}>
                        <SectionTitle
                            icon={<PersonOutlined />}
                            title={t.userForm.personalInformation}
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
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label={t.userForm.firstName}
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
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label={t.userForm.lastName}
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
                            title={t.userForm.accountInformation}
                        />

                        {mode === 'create' ? (
                            <>
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            value={
                                                field.value ?? ''
                                            }
                                            onChange={(event) => {
                                                field.onChange(
                                                    event.target.value,
                                                )
                                            }}
                                            label={t.userForm.email}
                                            fullWidth
                                            size="small"
                                            error={!!errors.email}
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
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            value={
                                                field.value ?? ''
                                            }
                                            label={t.userForm.password}
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
                                                                            !value,
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
                                    bgcolor: 'action.hover',
                                    border: '1px solid',
                                    borderColor: 'divider',
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
                                    {t.userForm.email}
                                </Typography>

                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <Typography
                                            sx={{
                                                fontSize: 13,
                                                fontWeight: 400,
                                            }}
                                        >
                                            {field.value || '-'}
                                        </Typography>
                                    )}
                                />
                            </Box>
                        )}

                        <SectionTitle
                            icon={<BusinessOutlined />}
                            title={t.userForm.organizationAndRole}
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
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        label={t.userForm.role}
                                        fullWidth
                                        size="small"
                                        error={!!errors.role}
                                        helperText={
                                            errors.role?.message
                                        }
                                        sx={fieldSx}
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
                                                    {option.label}
                                                </MenuItem>
                                            ),
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
                                            field.value === 0
                                                ? ''
                                                : field.value ?? ''
                                        }
                                        onChange={(event) => {
                                            const departmentId =
                                                Number(
                                                    event.target.value,
                                                )

                                            field.onChange(
                                                departmentId,
                                            )

                                            setValue(
                                                'jobPositionId',
                                                null,
                                                {
                                                    shouldValidate:
                                                        true,
                                                },
                                            )
                                        }}
                                        select
                                        label={
                                            t.userForm.department
                                        }
                                        fullWidth
                                        size="small"
                                        error={
                                            !!errors.departmentId
                                        }
                                        helperText={
                                            errors.departmentId
                                                ?.message
                                        }
                                        sx={fieldSx}
                                    >
                                        <MenuItem value="">
                                            {
                                                t.userForm
                                                    .selectDepartment
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
                                                    {department.name}
                                                </MenuItem>
                                            ),
                                        )}
                                    </TextField>
                                )}
                            />
                        </Stack>

                        <Controller
                            name="jobPositionId"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    value={
                                        field.value === 0
                                            ? ''
                                            : field.value ?? ''
                                    }
                                    onChange={(event) =>
                                        field.onChange(
                                            event.target.value ===
                                                ''
                                                ? null
                                                : Number(
                                                    event.target
                                                        .value,
                                                ),
                                        )
                                    }
                                    select
                                    disabled={
                                        !selectedDepartmentId ||
                                        selectedDepartmentId === 0
                                    }
                                    label={t.userForm.position}
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
                                            selectedDepartmentId === 0
                                            ? t.userForm.selectDepartmentFirst
                                            : t.userForm.notSelected}
                                    </MenuItem>

                                    {filteredJobPositions.map(
                                        (position) => (
                                            <MenuItem
                                                key={position.id}
                                                value={position.id}
                                            >
                                                {position.name}
                                            </MenuItem>
                                        ),
                                    )}
                                </TextField>
                            )}
                        />

                        {mode === 'edit' && (
                            <>
                                <Divider />

                                <SectionTitle
                                    icon={<LockOutlined />}
                                    title={t.userForm.changePassword}
                                />

                                <Stack spacing={1.5}>
                                    <TextField
                                        value={newPassword}
                                        onChange={(event) => {
                                            setNewPassword(
                                                event.target.value,
                                            )
                                            setPasswordError('')
                                        }}
                                        label={t.userForm.newPassword}
                                        type={
                                            showPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        fullWidth
                                        size="small"
                                        error={!!passwordError}
                                        helperText={
                                            passwordError ||
                                            t.userForm.passwordRequirement
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
                                                                        !value,
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

                                    <Button
                                        variant="outlined"
                                        disabled={
                                            changingPassword ||
                                            !newPassword
                                        }
                                        onClick={async () => {
                                            if (!initialData) return

                                            const error =
                                                validateNewPassword(
                                                    newPassword,
                                                )

                                            if (error) {
                                                setPasswordError(
                                                    error,
                                                )
                                                return
                                            }

                                            setChangingPassword(
                                                true,
                                            )

                                            try {
                                                await onChangePassword(
                                                    initialData.id,
                                                    newPassword,
                                                )

                                                setNewPassword('')
                                                setPasswordError('')
                                            } finally {
                                                setChangingPassword(
                                                    false,
                                                )
                                            }
                                        }}
                                        sx={{
                                            alignSelf: 'flex-start',
                                            minHeight: 40,
                                            borderRadius: 2,
                                            borderColor: '#F5B301',
                                            color: '#C68E00',
                                            fontWeight: 600,
                                            '&:hover': {
                                                borderColor: '#E0A300',
                                                bgcolor:
                                                    'rgba(245,179,1,0.06)',
                                            },
                                        }}
                                    >
                                        {
                                            changingPassword
                                                ? t.userForm.changingPassword
                                                : t.userForm.changePasswordButton
                                        }
                                    </Button>
                                </Stack>

                                <Divider />

                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
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
                                            {
                                                t.userForm.userStatus
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
                                                t.userForm.userStatusDescription
                                            }
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
                                                        ? t.common.active
                                                        : t.common.inactive
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
                        flexShrink: 0,
                        bgcolor: 'background.paper',
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
                        {
                            submitting
                                ? t.userForm.saving
                                : mode === 'create'
                                    ? t.userForm.create
                                    : t.userForm.update
                        }
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