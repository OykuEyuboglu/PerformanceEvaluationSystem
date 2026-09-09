import { useEffect, useState, useCallback } from 'react'
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
    Popover,
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



const ROLE_LABELS: Record<
    string,
    { tr: string; en: string }
> = {
    Admin: {
        tr: 'Yönetici',
        en: 'Admin',
    },
    Evaluator: {
        tr: 'Değerlendirici',
        en: 'Evaluator',
    },
    Employee: {
        tr: 'Çalışan',
        en: 'Employee',
    },
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
    const [dialogMode, setDialogMode] = useState<
        'create' | 'edit'
    >('create')

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

    // Global filter
    const [filterAnchorEl, setFilterAnchorEl] =
        useState<HTMLElement | null>(null)

    const [filterModel, setFilterModel] =
        useState<GridFilterModel>({
            items: [],
        })

    const [filterField, setFilterField] =
        useState('')

    const [filterValue, setFilterValue] =
        useState('')

    const filterOpen = Boolean(filterAnchorEl)

    /*
     * MUI DataGrid dili
     *
     * TR seçiliyse Türkçe,
     * EN seçiliyse İngilizce.
     */
    const dataGridLocale =
        language === 'tr'
            ? trTR.components.MuiDataGrid.defaultProps.localeText
            : enUS.components.MuiDataGrid.defaultProps.localeText

    const loadData = useCallback(async () => {
        setLoading(true)

        try {
            const [
                usersData,
                deptData,
                posData,
            ] = await Promise.all([
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

    const handleSubmit = async (
        values: UserFormValues
    ) => {
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
                    (
                        language === 'tr'
                            ? 'İşlem sırasında hata oluştu.'
                            : 'An error occurred during the operation.'
                    ),
                severity: 'error',
            })
        } finally {
            setSubmitting(false)
        }
    }

    const handleToggleActive = async (
        user: UserDto
    ) => {
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
                    (
                        language === 'tr'
                            ? 'Kullanıcı silinemedi.'
                            : 'User could not be deleted.'
                    ),
                severity: 'error',
            })
        } finally {
            setDeleting(false)
        }
    }

    // Global filter uygula
    const handleFilterClick = (
        event: React.MouseEvent<HTMLElement>
    ) => {
        setFilterAnchorEl(event.currentTarget)
    }

    const handleFilterClose = () => {
        setFilterAnchorEl(null)
    }

    const handleFilterFieldChange = (
        field: string
    ) => {
        setFilterField(field)

        if (!filterValue.trim()) {
            setFilterModel({
                items: [],
            })

            return
        }

        setFilterModel({
            items: [
                {
                    id: 1,
                    field,
                    operator: 'contains',
                    value: filterValue.trim(),
                },
            ],
        })
    }

    const handleFilterValueChange = (
        value: string
    ) => {
        setFilterValue(value)

        if (!filterField || !value.trim()) {
            setFilterModel({
                items: [],
            })

            return
        }

        setFilterModel({
            items: [
                {
                    id: 1,
                    field: filterField,
                    operator: 'contains',
                    value: value.trim(),
                },
            ],
        })
    }

    const columns: GridColDef<UserDto>[] = [
        {
            field: 'fullName',
            headerName:
                language === 'tr'
                    ? 'Ad Soyad'
                    : 'Full Name',
            flex: 1.2,

            sortable: true,
            filterable: false,

            valueGetter: (_, row) =>
                `${row.firstName} ${row.lastName}`,
        },

        {
            field: 'email',
            headerName:
                language === 'tr'
                    ? 'E-posta'
                    : 'Email',
            flex: 1.4,

            sortable: true,
            filterable: false,
        },

        {
            field: 'role',
            headerName:
                language === 'tr'
                    ? 'Rol'
                    : 'Role',
            flex: 0.9,

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
                        fontWeight: 600,
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

            sortable: true,
            filterable: false,
        },

        {
            field: 'isActive',
            headerName:
                language === 'tr'
                    ? 'Aktif'
                    : 'Active',
            flex: 0.6,

            sortable: true,
            filterable: false,

            renderCell: (params) => (
                <Switch
                    checked={params.value}
                    onChange={() =>
                        handleToggleActive(
                            params.row
                        )
                    }
                    size="small"
                />
            ),
        },

        {
            field: 'actions',
            headerName: '',
            flex: 0.7,

            sortable: false,
            filterable: false,

            renderCell: (params) => (
                <Box>
                    <IconButton
                        size="small"
                        onClick={() =>
                            handleOpenEdit(
                                params.row
                            )
                        }
                    >
                        <Edit fontSize="small" />
                    </IconButton>

                    <IconButton
                        size="small"
                        onClick={() =>
                            setDeleteTarget(
                                params.row
                            )
                        }
                    >
                        <Delete fontSize="small" />
                    </IconButton>
                </Box>
            ),
        },
    ]

    return (
        <Box>
            {/* Page header */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    mb: 3,
                }}
            >
                <Box>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 800,
                        }}
                    >
                        {language === 'tr'
                            ? 'Kullanıcı Yönetimi'
                            : 'User Management'}
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{
                            mt: 0.5,
                            fontSize: 14.5,
                        }}
                    >
                        {language === 'tr'
                            ? 'Sistemdeki tüm kullanıcıları görüntüle, ekle ve yönet.'
                            : 'View, add and manage all users in the system.'}
                    </Typography>
                </Box>

                {/* Page actions */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <Button
                        variant="outlined"
                        startIcon={<FilterList />}
                        onClick={handleFilterClick}
                    >
                        {language === 'tr'
                            ? 'Filtre'
                            : 'Filter'}
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleOpenCreate}
                    >
                        {language === 'tr'
                            ? 'Yeni Kullanıcı'
                            : 'New User'}
                    </Button>
                </Box>
            </Box>

            <Popover
                open={filterOpen}
                anchorEl={filterAnchorEl}
                onClose={handleFilterClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                slotProps={{
                    paper: {
                        sx: {
                            mt: 1,
                            p: 2,
                            width: 330,
                            borderRadius: 2.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: 4,
                        },
                    },
                }}
            >
                <Typography
                    sx={{
                        fontWeight: 700,
                        fontSize: 14,
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
                            ? 'Ara'
                            : 'Search'
                    }
                    placeholder={
                        language === 'tr'
                            ? 'Aramak istediğiniz değeri yazın...'
                            : 'Type a value to search...'
                    }
                    value={filterValue}
                    onChange={(event) =>
                        handleFilterValueChange(
                            event.target.value
                        )
                    }
                    disabled={!filterField}
                />

              
            </Popover>

            {/* Users table */}
            <Box
                sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <DataGrid
                    rows={users}
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
                    }}
                />
            </Box>

            {/* Create / Edit dialog */}
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

            {/* Delete confirmation */}
            <ConfirmDialog
                open={!!deleteTarget}
                title={
                    language === 'tr'
                        ? 'Kullanıcıyı Sil'
                        : 'Delete User'
                }
                description={
                    language === 'tr'
                        ? `"${deleteTarget?.firstName} ${deleteTarget?.lastName}" adlı kullanıcıyı silmek istediğine emin misin? Bu işlem geri alınamaz.`
                        : `Are you sure you want to delete "${deleteTarget?.firstName} ${deleteTarget?.lastName}"? This action cannot be undone.`
                }
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() =>
                    setDeleteTarget(null)
                }
            />

            {/* Snackbar */}
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