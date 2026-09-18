import { useEffect, useState, useCallback, useMemo } from 'react'
import {
    Box,
    Typography,
    Button,
    Chip,
    IconButton,
    Switch,
    Snackbar,
    Alert,
    TextField,
    MenuItem,
    InputAdornment,
    Tooltip,
} from '@mui/material'

import {
    DataGrid,
    type GridColDef,
    type GridFilterModel,
} from '@mui/x-data-grid'

import {
    trTR,
    enUS,
} from '@mui/x-data-grid/locales'

import {
    Add,
    Edit,
    Delete,
    FilterList,
    Search,
    PeopleAlt,
    PersonOff,
    AdminPanelSettings,
    Group,
} from '@mui/icons-material'

import {
    getUsers,
    createUser,
    updateUser,
    patchUser,
    deleteUser,
} from '../usersApi'

import { getDepartments } from '../../../shared/api/departmentsApi'
import { getJobPositions } from '../../../shared/api/jobPositionsApi'
import { useLanguage } from '../../../shared/i18n/LanguageContext'
import type { UserDto } from '../types'
import type { DepartmentDto } from '../../../shared/types/department'
import type { JobPositionDto } from '../../../shared/types/jobPosition'

import UserFormDialog, {
    type UserFormValues,
} from '../components/UserFormDialog'

import ConfirmDialog from '../../../shared/components/ConfirmDialog'

const ROLE_LABELS: Record<string, { tr: string; en: string }> = {
    Admin: { tr: 'Yönetici', en: 'Admin' },
    Evaluator: { tr: 'Değerlendirici', en: 'Evaluator' },
    Employee: { tr: 'Çalışan', en: 'Employee' },
}

const ROLE_COLORS: Record<
    string,
    'warning' | 'info' | 'default'
> = {
    Admin: 'warning',
    Evaluator: 'info',
    Employee: 'default',
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserDto[]>([])
    const [departments, setDepartments] = useState<DepartmentDto[]>([])
    const [jobPositions, setJobPositions] = useState<JobPositionDto[]>([])
    const [loading, setLoading] = useState(true)

    const { language } = useLanguage()

    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] =
        useState<'create' | 'edit'>('create')

    const [selectedUser, setSelectedUser] =
        useState<UserDto | null>(null)

    const [submitting, setSubmitting] = useState(false)
    const [deleteTarget, setDeleteTarget] =
        useState<UserDto | null>(null)
    const [deleting, setDeleting] = useState(false)

    const [snackbar, setSnackbar] = useState<{
        open: boolean
        message: string
        severity: 'success' | 'error'
    }>({
        open: false,
        message: '',
        severity: 'success',
    })

    const [search, setSearch] = useState('')
    const [filterAnchorEl, setFilterAnchorEl] =
        useState<HTMLElement | null>(null)

    const [filterModel, setFilterModel] =
        useState<GridFilterModel>({
            items: [],
        })

    const [filterField, setFilterField] = useState('')
    const [filterValue, setFilterValue] = useState('')

    const filterOpen = Boolean(filterAnchorEl)

    const dataGridLocale =
        language === 'tr'
            ? trTR.components.MuiDataGrid.defaultProps.localeText
            : enUS.components.MuiDataGrid.defaultProps.localeText

    const loadData = useCallback(async () => {
        setLoading(true)

        try {
            const [usersData, deptData, posData] =
                await Promise.all([
                    getUsers(),
                    getDepartments(),
                    getJobPositions(),
                ])

            setUsers(usersData)
            setDepartments(deptData)
            setJobPositions(posData)
        } catch {
            setSnackbar({
                open: true,
                message:
                    language === 'tr'
                        ? 'Veriler yüklenirken hata oluştu.'
                        : 'An error occurred while loading data.',
                severity: 'error',
            })
        } finally {
            setLoading(false)
        }
    }, [language])

    useEffect(() => {
        loadData()
    }, [loadData])

    const handleOpenCreate = () => {
        setDialogMode('create')
        setSelectedUser(null)
        setDialogOpen(true)
    }

    const handleOpenEdit = (user: UserDto) => {
        setDialogMode('edit')
        setSelectedUser(user)
        setDialogOpen(true)
    }

    const handleSubmit = async (values: UserFormValues) => {
        setSubmitting(true)

        try {
            if (dialogMode === 'create') {
                await createUser({
                    firstName: values.firstName,
                    lastName: values.lastName,
                    email: values.email!,
                    password: values.password!,
                    role: values.role,
                    departmentId: values.departmentId,
                    jobPositionId:
                        values.jobPositionId ?? undefined,
                })

                setSnackbar({
                    open: true,
                    message:
                        language === 'tr'
                            ? 'Kullanıcı oluşturuldu.'
                            : 'User created successfully.',
                    severity: 'success',
                })
            } else if (selectedUser) {
                await updateUser(selectedUser.id, {
                    firstName: values.firstName,
                    lastName: values.lastName,
                    role: values.role,
                    departmentId: values.departmentId,
                    jobPositionId:
                        values.jobPositionId ?? undefined,
                    isActive: values.isActive,
                })

                setSnackbar({
                    open: true,
                    message:
                        language === 'tr'
                            ? 'Kullanıcı güncellendi.'
                            : 'User updated successfully.',
                    severity: 'success',
                })
            }

            setDialogOpen(false)
            await loadData()
        } catch (err: any) {
            setSnackbar({
                open: true,
                message:
                    err?.response?.data?.message ??
                    (language === 'tr'
                        ? 'İşlem sırasında hata oluştu.'
                        : 'An error occurred during the operation.'),
                severity: 'error',
            })
        } finally {
            setSubmitting(false)
        }
    }

    const handleToggleActive = async (user: UserDto) => {
        try {
            await patchUser(user.id, {
                isActive: !user.isActive,
            })

            setUsers((prev) =>
                prev.map((u) =>
                    u.id === user.id
                        ? {
                            ...u,
                            isActive: !u.isActive,
                        }
                        : u
                )
            )
        } catch {
            setSnackbar({
                open: true,
                message:
                    language === 'tr'
                        ? 'Durum güncellenemedi.'
                        : 'Status could not be updated.',
                severity: 'error',
            })
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return

        setDeleting(true)

        try {
            await deleteUser(deleteTarget.id)

            setSnackbar({
                open: true,
                message:
                    language === 'tr'
                        ? 'Kullanıcı silindi.'
                        : 'User deleted successfully.',
                severity: 'success',
            })

            setDeleteTarget(null)
            await loadData()
        } catch (err: any) {
            setSnackbar({
                open: true,
                message:
                    err?.response?.data?.message ??
                    (language === 'tr'
                        ? 'Kullanıcı silinemedi.'
                        : 'User could not be deleted.'),
                severity: 'error',
            })
        } finally {
            setDeleting(false)
        }
    }

    const handleFilterClick = (
        event: React.MouseEvent<HTMLElement>
    ) => {
        setFilterAnchorEl(event.currentTarget)
    }

    const handleFilterClose = () => {
        setFilterAnchorEl(null)
    }

    const applyFilter = (field: string, value: string) => {
        if (!field || !value.trim()) {
            setFilterModel({ items: [] })
            return
        }

        setFilterModel({
            items: [
                {
                    id: 1,
                    field,
                    operator: 'contains',
                    value: value.trim(),
                },
            ],
        })
    }

    const handleFilterFieldChange = (field: string) => {
        setFilterField(field)
        applyFilter(field, filterValue)
    }

    const handleFilterValueChange = (value: string) => {
        setFilterValue(value)
        applyFilter(filterField, value)
    }

    const visibleUsers = useMemo(() => {
        const query = search.trim().toLocaleLowerCase('tr-TR')

        if (!query) return users

        return users.filter((user) =>
            [
                `${user.firstName} ${user.lastName}`,
                user.email,
                user.departmentName,
                user.jobPositionName ?? '',
                ROLE_LABELS[user.role]?.[language] ?? user.role,
            ].some((value) =>
                value
                    .toLocaleLowerCase('tr-TR')
                    .includes(query)
            )
        )
    }, [users, search, language])

    const stats = useMemo(() => {
        const active = users.filter((u) => u.isActive).length

        return {
            total: users.length,
            active,
            inactive: users.length - active,
            admins: users.filter((u) => u.role === 'Admin').length,
            evaluators: users.filter(
                (u) => u.role === 'Evaluator'
            ).length,
            employees: users.filter(
                (u) => u.role === 'Employee'
            ).length,
        }
    }, [users])

    const columns: GridColDef<UserDto>[] = [
        {
            field: 'fullName',
            headerName:
                language === 'tr' ? 'Ad Soyad' : 'Full Name',
            flex: 1.25,
            minWidth: 180,
            sortable: true,
            filterable: false,
            valueGetter: (_, row) =>
                `${row.firstName} ${row.lastName}`,
            renderCell: (params) => (
                <Box
                    sx={{
                        minWidth: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 13.5,
                            fontWeight: 700,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {params.value}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'email',
            headerName:
                language === 'tr' ? 'E-posta' : 'Email',
            flex: 1.25,
            minWidth: 200,
            sortable: true,
            filterable: false,
        },
        {
            field: 'role',
            headerName:
                language === 'tr' ? 'Rol' : 'Role',
            flex: 0.8,
            minWidth: 125,
            sortable: true,
            filterable: false,
            renderCell: (params) => (
                <Chip
                    size="small"
                    label={
                        ROLE_LABELS[params.value]?.[
                        language
                        ] ?? params.value
                    }
                    color={
                        ROLE_COLORS[params.value] ??
                        'default'
                    }
                    sx={{
                        fontWeight: 700,
                        fontSize: 11,
                    }}
                />
            ),
        },
        {
            field: 'departmentName',
            headerName:
                language === 'tr'
                    ? 'Departman'
                    : 'Department',
            flex: 1,
            minWidth: 145,
            sortable: true,
            filterable: false,
        },
        {
            field: 'jobPositionName',
            headerName:
                language === 'tr'
                    ? 'Pozisyon'
                    : 'Position',
            flex: 1,
            minWidth: 145,
            sortable: true,
            filterable: false,
            valueGetter: (_, row) =>
                row.jobPositionName ?? '-',
        },
        {
            field: 'isActive',
            headerName:
                language === 'tr' ? 'Durum' : 'Status',
            flex: 0.75,
            minWidth: 120,
            sortable: true,
            filterable: false,
            renderCell: (params) => (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                    }}
                >
                    <Switch
                        checked={params.value}
                        onChange={() =>
                            handleToggleActive(
                                params.row
                            )
                        }
                        size="small"
                    />
                    <Typography
                        sx={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: params.value
                                ? 'success.main'
                                : 'text.secondary',
                        }}
                    >
                        {params.value
                            ? language === 'tr'
                                ? 'Aktif'
                                : 'Active'
                            : language === 'tr'
                                ? 'Pasif'
                                : 'Inactive'}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'actions',
            headerName: '',
            width: 105,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <Box
                    sx={{
                        display: 'flex',
                        gap: 0.25,
                    }}
                >
                    <Tooltip
                        title={
                            language === 'tr'
                                ? 'Düzenle'
                                : 'Edit'
                        }
                    >
                        <IconButton
                            size="small"
                            onClick={() =>
                                handleOpenEdit(
                                    params.row
                                )
                            }
                            sx={{
                                transition:
                                    'all 0.18s ease',
                                '&:hover': {
                                    bgcolor:
                                        'rgba(245,179,1,0.12)',
                                    color: '#C68E00',
                                    transform:
                                        'translateY(-1px)',
                                },
                            }}
                        >
                            <Edit fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip
                        title={
                            language === 'tr'
                                ? 'Sil'
                                : 'Delete'
                        }
                    >
                        <IconButton
                            size="small"
                            disabled={!params.row.isActive}
                            onClick={() =>
                                setDeleteTarget(
                                    params.row
                                )
                            }
                            sx={{
                                transition:
                                    'all 0.18s ease',
                                '&:hover': {
                                    bgcolor:
                                        'rgba(211,47,47,0.08)',
                                    color: 'error.main',
                                },
                            }}
                        >
                            <Delete fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ]

    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: 1600,
                mx: 'auto',
                animation:
                    'usersPageEnter 500ms ease-out',
                '@keyframes usersPageEnter': {
                    from: {
                        opacity: 0,
                        transform: 'translateY(8px)',
                    },
                    to: {
                        opacity: 1,
                        transform: 'translateY(0)',
                    },
                },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: {
                        xs: 'flex-start',
                        md: 'center',
                    },
                    gap: 2,
                    mb: 3,
                    flexWrap: 'wrap',
                }}
            >
                <Box>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 0.6,
                        }}
                    >
                        <Box
                            sx={{
                                width: 8,
                                height: 28,
                                borderRadius: 1,
                                bgcolor: '#F5B301',
                            }}
                        />

                        <Typography
                            sx={{
                                fontSize: {
                                    xs: 24,
                                    md: 28,
                                },
                                fontWeight: 850,
                                letterSpacing: '-0.6px',
                            }}
                        >
                            {language === 'tr'
                                ? 'Kullanıcı Yönetimi'
                                : 'User Management'}
                        </Typography>
                    </Box>

                    <Typography
                        color="text.secondary"
                        sx={{
                            fontSize: 13.5,
                            ml: 2,
                        }}
                    >
                        {language === 'tr'
                            ? 'Sistem kullanıcılarını, rollerini ve erişim durumlarını yönetin.'
                            : 'Manage system users, roles and access status.'}
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleOpenCreate}
                    sx={{
                        minHeight: 42,
                        px: 2.2,
                        borderRadius: 2,
                        bgcolor: '#F5B301',
                        color: '#111111',
                        fontWeight: 800,
                        boxShadow: 'none',
                        transition:
                            'all 0.2s ease',
                        '&:hover': {
                            bgcolor: '#E0A300',
                            transform:
                                'translateY(-1px)',
                            boxShadow:
                                '0 8px 20px rgba(245,179,1,0.20)',
                        },
                    }}
                >
                    {language === 'tr'
                        ? 'Yeni Kullanıcı'
                        : 'New User'}
                </Button>
            </Box>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr 1fr',
                        md: 'repeat(4, 1fr)',
                    },
                    gap: 1.5,
                    mb: 2.5,
                }}
            >
                <SummaryCard
                    icon={<PeopleAlt />}
                    label={
                        language === 'tr'
                            ? 'Toplam Kullanıcı'
                            : 'Total Users'
                    }
                    value={stats.total}
                    delay={80}
                />

                <SummaryCard
                    icon={<Group />}
                    label={
                        language === 'tr'
                            ? 'Aktif Kullanıcı'
                            : 'Active Users'
                    }
                    value={stats.active}
                    delay={140}
                    accent
                />

                <SummaryCard
                    icon={<AdminPanelSettings />}
                    label={
                        language === 'tr'
                            ? 'Yönetici'
                            : 'Administrators'
                    }
                    value={stats.admins}
                    delay={200}
                />

                <SummaryCard
                    icon={<PersonOff />}
                    label={
                        language === 'tr'
                            ? 'Pasif Kullanıcı'
                            : 'Inactive Users'
                    }
                    value={stats.inactive}
                    delay={260}
                />
            </Box>

            <Box
                sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                    animation:
                        'tableEnter 600ms ease-out 220ms both',
                    '@keyframes tableEnter': {
                        from: {
                            opacity: 0,
                            transform:
                                'translateY(10px)',
                        },
                        to: {
                            opacity: 1,
                            transform:
                                'translateY(0)',
                        },
                    },
                }}
            >
                <Box
                    sx={{
                        px: { xs: 2, md: 2.5 },
                        py: 1.75,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.25,
                        flexWrap: 'wrap',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <TextField
                        size="small"
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        placeholder={
                            language === 'tr'
                                ? 'Ad, e-posta, departman veya pozisyon ara...'
                                : 'Search name, email, department or position...'
                        }
                        sx={{
                            flex: 1,
                            minWidth: {
                                xs: '100%',
                                sm: 280,
                            },
                            maxWidth: 560,
                            '& .MuiOutlinedInput-root':
                            {
                                borderRadius: 2,
                                fontSize: 12.5,
                            },
                        }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search
                                            fontSize="small"
                                            sx={{
                                                color: 'text.secondary',
                                            }}
                                        />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    <Button
                        variant="outlined"
                        startIcon={<FilterList />}
                        onClick={handleFilterClick}
                        sx={{
                            minHeight: 40,
                            borderRadius: 2,
                            color: 'text.primary',
                            borderColor: 'divider',
                            fontWeight: 700,
                            '&:hover': {
                                borderColor:
                                    '#F5B301',
                                bgcolor:
                                    'rgba(245,179,1,0.05)',
                            },
                        }}
                    >
                        {language === 'tr'
                            ? 'Filtrele'
                            : 'Filter'}
                    </Button>

                    <Typography
                        color="text.secondary"
                        sx={{
                            ml: {
                                xs: 0,
                                md: 'auto',
                            },
                            fontSize: 11.5,
                        }}
                    >
                        {visibleUsers.length}{' '}
                        {language === 'tr'
                            ? 'kullanıcı gösteriliyor'
                            : 'users shown'}
                    </Typography>
                </Box>

                {filterModel.items.length > 0 && (
                    <Box
                        sx={{
                            px: 2.5,
                            py: 1,
                            bgcolor:
                                'rgba(245,179,1,0.055)',
                            borderBottom:
                                '1px solid',
                            borderColor:
                                'divider',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: 11,
                                color: 'text.secondary',
                            }}
                        >
                            {language === 'tr'
                                ? 'Aktif filtre:'
                                : 'Active filter:'}
                        </Typography>

                        <Chip
                            size="small"
                            label={`${filterField}: ${filterValue}`}
                            onDelete={() => {
                                setFilterField('')
                                setFilterValue('')
                                setFilterModel({
                                    items: [],
                                })
                            }}
                            sx={{
                                height: 25,
                                fontSize: 10.5,
                                fontWeight: 700,
                            }}
                        />
                    </Box>
                )}

                <DataGrid
                    rows={visibleUsers}
                    columns={columns}
                    loading={loading}
                    filterModel={filterModel}
                    onFilterModelChange={
                        setFilterModel
                    }
                    getRowId={(row) => row.id}
                    autoHeight
                    disableRowSelectionOnClick
                    pageSizeOptions={[
                        10,
                        25,
                        50,
                    ]}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 10,
                            },
                        },
                    }}
                    localeText={dataGridLocale}
                    sx={{
                        border: 'none',

                        '& .MuiDataGrid-columnHeaders':
                        {
                            bgcolor:
                                'rgba(0,0,0,0.018)',
                            borderBottom:
                                '1px solid',
                            borderColor:
                                'divider',
                        },

                        '& .MuiDataGrid-columnHeaderTitle':
                        {
                            fontSize: 11.5,
                            fontWeight: 650,
                            color: 'text.secondary',
                        },

                        '& .MuiDataGrid-cell':
                        {
                            borderColor:
                                'divider',
                            outline: 'none !important',
                        },

                        '& .MuiDataGrid-row':
                        {
                            transition:
                                'background-color 0.15s ease',
                        },

                        '& .MuiDataGrid-row:hover':
                        {
                            bgcolor:
                                'rgba(245,179,1,0.045)',
                        },

                        '& .MuiDataGrid-footerContainer':
                        {
                            borderTop:
                                '1px solid',
                            borderColor:
                                'divider',
                        },
                    }}
                />
            </Box>

            {filterOpen && (
                <Box
                    sx={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 1200,
                    }}
                    onClick={handleFilterClose}
                >
                    <Box
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                        sx={{
                            position: 'absolute',
                            top: (
                                filterAnchorEl
                                    ?.getBoundingClientRect()
                                    .bottom ?? 0
                            ) + 8,
                            left:
                                filterAnchorEl
                                    ?.getBoundingClientRect()
                                    .left ?? 0,
                            width: 330,
                            p: 2,
                            bgcolor:
                                'background.paper',
                            border:
                                '1px solid',
                            borderColor:
                                'divider',
                            borderRadius: 2.5,
                            boxShadow:
                                '0 14px 40px rgba(0,0,0,0.12)',
                            animation:
                                'filterEnter 180ms ease-out',
                            '@keyframes filterEnter':
                            {
                                from: {
                                    opacity: 0,
                                    transform:
                                        'translateY(-4px) scale(0.98)',
                                },
                                to: {
                                    opacity: 1,
                                    transform:
                                        'translateY(0) scale(1)',
                                },
                            },
                        }}
                    >
                        <Typography
                            sx={{
                                fontWeight: 650,
                                fontSize: 12,
                                mb: 1.5,
                            }}
                        >
                            {language === 'tr'
                                ? 'Kullanıcıları Filtrele'
                                : 'Filter Users'}
                        </Typography>

                        <TextField
                            select
                            fullWidth
                            size="small"
                            label={
                                language === 'tr'
                                    ? 'Alan'
                                    : 'Field'
                            }
                            value={filterField}
                            onChange={(event) =>
                                handleFilterFieldChange(
                                    event.target.value
                                )
                            }
                            sx={{
                                mb: 1.5,
                                '& .MuiOutlinedInput-root':
                                {
                                    borderRadius: 2,
                                },
                            }}
                        >
                            <MenuItem value="fullName">
                                {language === 'tr'
                                    ? 'Ad Soyad'
                                    : 'Full Name'}
                            </MenuItem>
                            <MenuItem value="email">
                                {language === 'tr'
                                    ? 'E-posta'
                                    : 'Email'}
                            </MenuItem>
                            <MenuItem value="role">
                                {language === 'tr'
                                    ? 'Rol'
                                    : 'Role'}
                            </MenuItem>
                            <MenuItem value="departmentName">
                                {language === 'tr'
                                    ? 'Departman'
                                    : 'Department'}
                            </MenuItem>
                            <MenuItem value="jobPositionName">
                                {language === 'tr'
                                    ? 'Pozisyon'
                                    : 'Position'}
                            </MenuItem>
                        </TextField>

                        <TextField
                            fullWidth
                            size="small"
                            label={
                                language === 'tr'
                                    ? 'Değer'
                                    : 'Value'
                            }
                            placeholder={
                                language === 'tr'
                                    ? 'Filtre değerini yazın...'
                                    : 'Enter filter value...'
                            }
                            value={filterValue}
                            onChange={(event) =>
                                handleFilterValueChange(
                                    event.target.value
                                )
                            }
                            disabled={!filterField}
                            sx={{
                                '& .MuiOutlinedInput-root':
                                {
                                    borderRadius: 2,
                                },
                            }}
                        />
                    </Box>
                </Box>
            )}

            <UserFormDialog
                open={dialogOpen}
                mode={dialogMode}
                initialData={selectedUser}
                departments={departments}
                jobPositions={jobPositions}
                submitting={submitting}
                onSubmit={handleSubmit}
                onClose={() =>
                    setDialogOpen(false)
                }
            />

            <ConfirmDialog
                open={!!deleteTarget}
                title={
                    language === 'tr'
                        ? 'Kullanıcıyı Sil'
                        : 'Delete User'
                }
                description={
                    language === 'tr'
                        ? `"${deleteTarget?.firstName} ${deleteTarget?.lastName}" adlı kullanıcıyı silmek istediğine emin misin? Kullanıcı sistemden silinmez, yalnızca tablolardan gizlenir.`
                        : `Are you sure you want to deactivate "${deleteTarget?.firstName} ${deleteTarget?.lastName}"? The user will be deleted rather than permanently deleted.`
                }
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() =>
                    setDeleteTarget(null)
                }
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() =>
                    setSnackbar((s) => ({
                        ...s,
                        open: false,
                    }))
                }
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
            >
                <Alert
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{
                        borderRadius: 2,
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}

interface SummaryCardProps {
    icon: React.ReactNode
    label: string
    value: number
    delay?: number
    accent?: boolean
}

function SummaryCard({
    icon,
    label,
    value,
    delay = 0,
    accent = false,
}: SummaryCardProps) {
    return (
        <Box
            sx={{
                p: {
                    xs: 1.75,
                    md: 2,
                },
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',

                opacity: 0,
                animation:
                    'summaryEnter 500ms ease-out forwards',
                animationDelay: `${delay}ms`,

                '@keyframes summaryEnter': {
                    from: {
                        opacity: 0,
                        transform:
                            'translateY(10px)',
                    },
                    to: {
                        opacity: 1,
                        transform:
                            'translateY(0)',
                    },
                },

                transition:
                    'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',

                '&:hover': {
                    transform:
                        'translateY(-2px)',
                    borderColor:
                        accent
                            ? 'rgba(245,179,1,0.45)'
                            : 'divider',
                    boxShadow:
                        '0 8px 24px rgba(0,0,0,0.05)',
                },
            }}
        >
            <Box
                sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: accent
                        ? 'rgba(245,179,1,0.12)'
                        : 'action.hover',
                    color: accent
                        ? '#C68E00'
                        : 'text.secondary',
                    mb: 1.4,
                }}
            >
                {icon}
            </Box>

            <Typography
                color="text.secondary"
                sx={{
                    fontSize: 11,
                    fontWeight: 650,
                }}
            >
                {label}
            </Typography>

            <Typography
                sx={{
                    mt: 0.3,
                    fontSize: 20,
                    fontWeight: 650,
                    lineHeight: 1,
                    fontVariantNumeric:
                        'tabular-nums',
                }}
            >
                {value}
            </Typography>
        </Box>
    )
}
