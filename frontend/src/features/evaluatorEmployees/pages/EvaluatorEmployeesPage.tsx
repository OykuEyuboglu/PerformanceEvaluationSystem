import {
    useEffect,
    useState,
    useCallback,
    useMemo,
    useRef,
} from 'react'

import type {
    ReactElement,
    MouseEvent,
} from 'react'
import { getJobPositions } from '../../../shared/api/jobPositionsApi'
import type { JobPositionDto } from '../../../shared/types/jobPosition'

import {
    Box,
    Typography,
    Paper,
    List,
    ListItemButton,
    ListItemText,
    Avatar,
    IconButton,
    Autocomplete,
    TextField,
    Button,
    Snackbar,
    Alert,
    LinearProgress,
    Divider,
    Tooltip,
    InputAdornment,
    Chip,
    Stack,
} from '@mui/material'

import {
    Delete,
    PersonAdd,
    Groups,
    Search,
    DragIndicator,
    PeopleAltOutlined,
    SupervisorAccountOutlined,
    GroupOutlined,
} from '@mui/icons-material'

import { getUsers } from '../../users/usersApi'

import {
    getTeamByEvaluator,
    assignEmployee,
    removeAssignment,
} from '../evaluatorEmployeesApi'

import type { UserDto } from '../../users/types'
import type { EvaluatorEmployeeDto } from '../types'

import ConfirmDialog from '../../../shared/components/ConfirmDialog'

import { useLanguage } from '../../../shared/i18n/LanguageContext'
import { translations } from '../../../shared/i18n/translations'

type UserInfoTooltipProps = {
    user: UserDto
    roleLabel: string
    children: ReactElement
}

function UserInfoTooltip({
    user,
    roleLabel,
    children,
}: UserInfoTooltipProps) {
    const { language } = useLanguage()
    const t = translations[language]
   

    return (
        <Tooltip
            placement="right"
            enterDelay={500}
            enterNextDelay={150}
            leaveDelay={100}
            arrow
            title={
                <Box sx={{ p: 0.5, minWidth: 230 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.25,
                            mb: 1.25,
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 38,
                                height: 38,
                                fontSize: 14,
                                fontWeight: 700,
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                            }}
                        >
                            {user.firstName
                                .charAt(0)
                                .toUpperCase()}
                        </Avatar>

                        <Box sx={{ minWidth: 0 }}>
                            <Typography
                                sx={{
                                    fontSize: 13.5,
                                    fontWeight: 700,
                                    lineHeight: 1.3,
                                }}
                            >
                                {user.firstName}{' '}
                                {user.lastName}
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: 11.5,
                                    mt: 0.25,
                                    color: 'text.secondary',
                                }}
                            >
                                {roleLabel}
                            </Typography>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            pt: 1,
                            borderTop: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.6,
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: 11.5,
                                color: 'text.secondary',
                            }}
                        >
                            <strong>
                                {
                                    t.evaluatorEmployees
                                        .department
                                }
                                :
                            </strong>{' '}
                            {user.departmentName ||
                                t.evaluatorEmployees
                                    .notSpecified}
                        </Typography>

                        <Typography
                            sx={{
                                fontSize: 11.5,
                                color: 'text.secondary',
                            }}
                        >
                            <strong>
                                {
                                    t.evaluatorEmployees
                                        .position
                                }
                                :
                            </strong>{' '}
                            {user.jobPositionName ||
                                t.evaluatorEmployees.notSpecified}
                        </Typography>

                        <Typography
                            sx={{
                                fontSize: 11.5,
                                color: 'text.secondary',
                                wordBreak: 'break-word',
                            }}
                        >
                            <strong>
                                {
                                    t.evaluatorEmployees
                                        .email
                                }
                                :
                            </strong>{' '}
                            {user.email}
                        </Typography>
                    </Box>
                </Box>
            }
            slotProps={{
                tooltip: {
                    sx: {
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        boxShadow:
                            '0 8px 24px rgba(0,0,0,0.18)',
                        p: 1.25,
                        maxWidth: 290,
                    },
                },
                arrow: {
                    sx: {
                        color: 'background.paper',
                    },
                },
            }}
        >
            {children}
        </Tooltip>
    )
}

export default function EvaluatorEmployeesPage() {
    const { language } = useLanguage()
    const t = translations[language]

    const [allUsers, setAllUsers] =
        useState<UserDto[]>([])

    const [loadingUsers, setLoadingUsers] =
        useState(true)

    const [evaluatorSearch, setEvaluatorSearch] =
        useState('')

    const [employeeSearch, setEmployeeSearch] =
        useState('')

    const [selectedEvaluator, setSelectedEvaluator] =
        useState<UserDto | null>(null)

    const [team, setTeam] =
        useState<EvaluatorEmployeeDto[]>([])

    const [loadingTeam, setLoadingTeam] =
        useState(false)

    const [employeesToAdd, setEmployeesToAdd] =
        useState<UserDto[]>([])

    const [assigning, setAssigning] =
        useState(false)

    const [removeTarget, setRemoveTarget] =
        useState<EvaluatorEmployeeDto | null>(null)

    const [removing, setRemoving] =
        useState(false)

    const [leftPanelWidth, setLeftPanelWidth] =
        useState(400)

    const [isResizing, setIsResizing] =
        useState(false)

    const layoutRef =
        useRef<HTMLDivElement | null>(null)

    const [snackbar, setSnackbar] = useState<{
        open: boolean
        message: string
        severity: 'success' | 'error'
    }>({
        open: false,
        message: '',
        severity: 'success',
    })

    const showError = (
        err: any,
        fallback: string,
    ) =>
        setSnackbar({
            open: true,
            message:
                err?.response?.data?.message ??
                fallback,
            severity: 'error',
        })

    const evaluators = useMemo(
        () =>
            allUsers.filter(
                (u) => u.role === 'Evaluator',
            ),
        [allUsers],
    )

    const [jobPositions, setJobPositions] =
        useState<JobPositionDto[]>([])

    const employees = useMemo(
        () =>
            allUsers.filter(
                (u) =>
                    u.role === 'Employee' &&
                    u.isActive,
            ),
        [allUsers],
    )

    const filteredEvaluators = useMemo(() => {
        const q = evaluatorSearch
            .trim()
            .toLowerCase()

        if (!q) return evaluators

        return evaluators.filter((ev) => {
            const fullName =
                `${ev.firstName} ${ev.lastName}`.toLowerCase()

            const department =
                ev.departmentName
                    ?.toLowerCase() ?? ''

            const email =
                ev.email?.toLowerCase() ?? ''

            return (
                fullName.includes(q) ||
                department.includes(q) ||
                email.includes(q)
            )
        })
    }, [evaluators, evaluatorSearch])

    const filteredEmployees = useMemo(() => {
        const q = employeeSearch
            .trim()
            .toLowerCase()

        return employees.filter((employee) => {
            const alreadyAssigned =
                team.some(
                    (member) =>
                        member.employeeId ===
                        employee.id,
                )

            if (alreadyAssigned) return false

            if (!q) return true

            const fullName =
                `${employee.firstName} ${employee.lastName}`.toLowerCase()

            const department =
                employee.departmentName
                    ?.toLowerCase() ?? ''

            const jobPosition =
                employee.jobPositionName
                    ?.toLowerCase() ?? ''

            const email =
                employee.email
                    ?.toLowerCase() ?? ''

            return (
                fullName.includes(q) ||
                department.includes(q) ||
                jobPosition.includes(q) ||
                email.includes(q)
            )
        })
    }, [
        employees,
        team,
        employeeSearch,
    ])

    const enrichMember = (
        member: EvaluatorEmployeeDto,
    ): UserDto | undefined =>
        allUsers.find(
            (u) => u.id === member.employeeId,
        )

    const loadUsers = useCallback(
        async () => {
            setLoadingUsers(true)
          
            try {
                const [usersData, positionsData] =
                    await Promise.all([
                        getUsers(),
                        getJobPositions(),
                    ])

                setAllUsers(usersData)
                setJobPositions(positionsData)
            } catch {
                setSnackbar({
                    open: true,
                    message:
                        t.evaluatorEmployees
                            .usersLoadError,
                    severity: 'error',
                })
            } finally {
                setLoadingUsers(false)
            }
        },
        [
            t.evaluatorEmployees
                .usersLoadError,
        ],
    )

    useEffect(() => {
        loadUsers()
    }, [loadUsers])

    const loadTeam = useCallback(
        async (evaluatorId: number) => {
            setLoadingTeam(true)

            try {
                const data =
                    await getTeamByEvaluator(
                        evaluatorId,
                    )

                setTeam(data)
            } catch {
                setSnackbar({
                    open: true,
                    message:
                        t.evaluatorEmployees
                            .teamLoadError,
                    severity: 'error',
                })

                setTeam([])
            } finally {
                setLoadingTeam(false)
            }
        },
        [
            t.evaluatorEmployees
                .teamLoadError,
        ],
    )

    const handleSelectEvaluator = (
        evaluator: UserDto,
    ) => {
        setSelectedEvaluator(evaluator)
        setEmployeesToAdd([])
        setEmployeeSearch('')
        loadTeam(evaluator.id)
    }

    const handleAssign = async () => {
        if (
            !selectedEvaluator ||
            employeesToAdd.length === 0
        ) {
            return
        }

        setAssigning(true)

        try {
            await Promise.all(
                employeesToAdd.map(
                    (employee) =>
                        assignEmployee({
                            evaluatorId:
                                selectedEvaluator.id,
                            employeeId:
                                employee.id,
                        }),
                ),
            )

            setSnackbar({
                open: true,
                message: t.evaluatorEmployees
                    .employeesAdded.replace(
                        '{count}',
                        String(
                            employeesToAdd.length,
                        ),
                    ),
                severity: 'success',
            })

            setEmployeesToAdd([])
            setEmployeeSearch('')

            await loadTeam(
                selectedEvaluator.id,
            )
        } catch (err) {
            showError(
                err,
                t.evaluatorEmployees
                    .assignError,
            )
        } finally {
            setAssigning(false)
        }
    }

    const handleRemove = async () => {
        if (!removeTarget) return

        setRemoving(true)

        try {
            await removeAssignment(
                removeTarget.evaluatorId,
                removeTarget.employeeId,
            )

            setSnackbar({
                open: true,
                message:
                    t.evaluatorEmployees
                        .employeeRemoved,
                severity: 'success',
            })

            setRemoveTarget(null)

            if (selectedEvaluator) {
                await loadTeam(
                    selectedEvaluator.id,
                )
            }
        } catch (err) {
            showError(
                err,
                t.evaluatorEmployees
                    .removeError,
            )
        } finally {
            setRemoving(false)
        }
    }

    const handleResizeStart = (
        event: MouseEvent<HTMLDivElement>,
    ) => {
        event.preventDefault()
        setIsResizing(true)
    }

    useEffect(() => {
        if (!isResizing) return

        const handleMouseMove = (
            event: globalThis.MouseEvent,
        ) => {
            const layout =
                layoutRef.current

            if (!layout) return

            const rect =
                layout.getBoundingClientRect()

            const newWidth =
                event.clientX - rect.left

            const minWidth = 280
            const maxWidth =
                rect.width * 0.5

            setLeftPanelWidth(
                Math.min(
                    Math.max(
                        newWidth,
                        minWidth,
                    ),
                    maxWidth,
                ),
            )
        }

        const handleMouseUp = () => {
            setIsResizing(false)
        }

        document.addEventListener(
            'mousemove',
            handleMouseMove,
        )

        document.addEventListener(
            'mouseup',
            handleMouseUp,
        )

        return () => {
            document.removeEventListener(
                'mousemove',
                handleMouseMove,
            )

            document.removeEventListener(
                'mouseup',
                handleMouseUp,
            )
        }
    }, [isResizing])

    return (
        <Box>
            <Box
                sx={{
                    mb: 3,
                    display: 'flex',
                    justifyContent:
                        'space-between',
                    alignItems: {
                        xs: 'flex-start',
                        md: 'center',
                    },
                    gap: 2,
                    flexWrap: 'wrap',
                }}
            >
                <Box>
                    <Stack
                        direction="row"
                        spacing={1.25}
                        sx={{
                            mb: 0.75,
                            alignItems: 'center',
                        }}
                    >
                        <Box
                            sx={{
                                width: 42,
                                height: 42,
                                borderRadius: 2.25,
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor:
                                    'primary.main',
                                color:
                                    'primary.contrastText',
                                boxShadow:
                                    '0 8px 20px rgba(245,179,1,0.20)',
                            }}
                        >
                            <Groups fontSize="small" />
                        </Box>

                        <Box>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 800,
                                    letterSpacing:
                                        -0.35,
                                }}
                            >
                                {
                                    t
                                        .evaluatorEmployees
                                        .title
                                }
                            </Typography>

                            <Typography
                                color="text.secondary"
                                sx={{
                                    mt: 0.2,
                                    fontSize: 13.5,
                                }}
                            >
                                {
                                    t
                                        .evaluatorEmployees
                                        .description
                                }
                            </Typography>
                        </Box>
                    </Stack>
                </Box>

                <Stack
                    direction="row"
                    spacing={1}
                >
                    <Chip
                        icon={
                            <SupervisorAccountOutlined
                                sx={{
                                    fontSize: 17,
                                }}
                            />
                        }
                        label={`${evaluators.length} ${t.evaluatorEmployees
                            .evaluators
                            }`}
                        variant="outlined"
                        sx={{
                            fontWeight: 600,
                            borderRadius: 2,
                        }}
                    />

                    <Chip
                        icon={
                            <PeopleAltOutlined
                                sx={{
                                    fontSize: 17,
                                }}
                            />
                        }
                        label={`${employees.length} ${t.evaluatorEmployees
                            .activeEmployees
                            }`}
                        variant="outlined"
                        sx={{
                            fontWeight: 600,
                            borderRadius: 2,
                        }}
                    />
                </Stack>
            </Box>

            {loadingUsers ? (
                <LinearProgress />
            ) : evaluators.length === 0 ? (
                <Typography color="text.secondary">
                    {
                        t.evaluatorEmployees
                            .noEvaluators
                    }
                </Typography>
            ) : (
                <Box
                    ref={layoutRef}
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            md: `${leftPanelWidth}px 8px minmax(0, 1fr)`,
                        },
                        gap: 0,
                        alignItems: 'stretch',
                        minHeight: 420,
                    }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            minWidth: 0,
                            border: '1px solid',
                            borderColor:
                                'divider',
                            borderRadius: 3,
                            overflow: 'hidden',
                        }}
                    >
                        <Box
                            sx={{
                                px: 2.5,
                                py: 2,
                                borderBottom:
                                    '1px solid',
                                borderColor:
                                    'divider',
                            }}
                        >
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    fontSize: 14,
                                    mb: 1.25,
                                }}
                            >
                                {
                                    t
                                        .evaluatorEmployees
                                        .evaluatorsTitle
                                }
                            </Typography>

                            <TextField
                                size="small"
                                fullWidth
                                placeholder={
                                    t
                                        .evaluatorEmployees
                                        .evaluatorSearchPlaceholder
                                }
                                value={
                                    evaluatorSearch
                                }
                                onChange={(e) =>
                                    setEvaluatorSearch(
                                        e.target.value,
                                    )
                                }
                                slotProps={{
                                    input: {
                                        startAdornment:
                                            (
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
                                sx={{
                                    '& .MuiOutlinedInput-root':
                                    {
                                        borderRadius: 2,
                                    },
                                }}
                            />
                        </Box>

                        {filteredEvaluators.length ===
                            0 ? (
                            <Box sx={{ p: 3 }}>
                                <Typography
                                    color="text.secondary"
                                    sx={{
                                        fontSize: 13.5,
                                    }}
                                >
                                    {
                                        t
                                            .evaluatorEmployees
                                            .noMatchingEvaluators
                                    }
                                </Typography>
                            </Box>
                        ) : (
                            <List
                                sx={{
                                    py: 0,
                                    maxHeight: {
                                        xs: 420,
                                        md: 'calc(100vh - 400px)',
                                    },
                                    overflowY:
                                        'auto',
                                }}
                            >
                                {filteredEvaluators.map(
                                    (ev) => {
                                        const isSelected =
                                            selectedEvaluator?.id ===
                                            ev.id

                                        return (
                                            <UserInfoTooltip
                                                key={
                                                    ev.id
                                                }
                                                user={ev}
                                                roleLabel={
                                                    t
                                                        .evaluatorEmployees
                                                        .evaluator
                                                }
                                            >
                                                <ListItemButton
                                                    selected={
                                                        isSelected
                                                    }
                                                    onClick={() =>
                                                        handleSelectEvaluator(
                                                            ev,
                                                        )
                                                    }
                                                    sx={{
                                                        py: 1.5,
                                                        px: 2,
                                                        transition:
                                                            'background-color 0.15s ease',

                                                        '&:hover':
                                                        {
                                                            bgcolor:
                                                                'action.hover',
                                                        },

                                                        '&.Mui-selected':
                                                        {
                                                            bgcolor:
                                                                'primary.main',
                                                            color:
                                                                'primary.contrastText',

                                                            '&:hover':
                                                            {
                                                                bgcolor:
                                                                    'primary.main',
                                                            },
                                                        },
                                                    }}
                                                >
                                                    <Avatar
                                                        sx={{
                                                            width: 34,
                                                            height: 34,
                                                            fontSize: 13,
                                                            fontWeight: 700,
                                                            mr: 1.5,
                                                            bgcolor:
                                                                isSelected
                                                                    ? '#111111'
                                                                    : 'action.selected',
                                                            color:
                                                                isSelected
                                                                    ? '#FFFFFF'
                                                                    : 'text.primary',
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {ev.firstName
                                                            .charAt(
                                                                0,
                                                            )
                                                            .toUpperCase()}
                                                    </Avatar>

                                                    <ListItemText
                                                        primary={`${ev.firstName} ${ev.lastName}`}
                                                        secondary={
                                                            ev.departmentName
                                                        }
                                                        sx={{
                                                            minWidth: 0,

                                                            '& .MuiListItemText-primary':
                                                            {
                                                                fontSize: 14,
                                                                fontWeight: 600,
                                                                whiteSpace:
                                                                    'nowrap',
                                                                overflow:
                                                                    'hidden',
                                                                textOverflow:
                                                                    'ellipsis',
                                                            },

                                                            '& .MuiListItemText-secondary':
                                                            {
                                                                fontSize: 12,
                                                                color:
                                                                    isSelected
                                                                        ? 'rgba(17,17,17,0.7)'
                                                                        : 'text.secondary',
                                                            },
                                                        }}
                                                    />
                                                </ListItemButton>
                                            </UserInfoTooltip>
                                        )
                                    },
                                )}
                            </List>
                        )}
                    </Paper>

                    <Box
                        onMouseDown={
                            handleResizeStart
                        }
                        sx={{
                            display: {
                                xs: 'none',
                                md: 'flex',
                            },
                            alignItems:
                                'center',
                            justifyContent:
                                'center',
                            cursor:
                                'col-resize',
                            userSelect: 'none',
                            position: 'relative',

                            '&:hover .resize-handle':
                            {
                                opacity: 1,
                                bgcolor:
                                    'primary.main',
                            },
                        }}
                    >
                        <Box
                            className="resize-handle"
                            sx={{
                                width: 3,
                                height: 48,
                                borderRadius: 2,
                                bgcolor:
                                    isResizing
                                        ? 'primary.main'
                                        : 'divider',
                                opacity:
                                    isResizing
                                        ? 1
                                        : 0.7,
                                transition:
                                    'all 0.15s ease',
                            }}
                        />

                        <DragIndicator
                            sx={{
                                position:
                                    'absolute',
                                fontSize: 16,
                                color:
                                    'text.secondary',
                                opacity:
                                    isResizing
                                        ? 1
                                        : 0,
                                pointerEvents:
                                    'none',
                            }}
                        />
                    </Box>

                    <Paper
                        elevation={0}
                        sx={{
                            minWidth: 0,
                            border: '1px solid',
                            borderColor:
                                'divider',
                            borderRadius: 3,
                            overflow: 'hidden',
                            mt: {
                                xs: 2,
                                md: 0,
                            },
                        }}
                    >
                        {!selectedEvaluator ? (
                            <Box
                                sx={{
                                    p: 5,
                                    textAlign:
                                        'center',
                                }}
                            >
                                <Groups
                                    sx={{
                                        fontSize: 40,
                                        color:
                                            'text.secondary',
                                        mb: 1,
                                    }}
                                />

                                <Typography color="text.secondary">
                                    {
                                        t
                                            .evaluatorEmployees
                                            .selectEvaluator
                                    }
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                <Box
                                    sx={{
                                        px: 2.5,
                                        py: 2,
                                        borderBottom:
                                            '1px solid',
                                        borderColor:
                                            'divider',
                                        display:
                                            'flex',
                                        alignItems:
                                            'center',
                                        justifyContent:
                                            'space-between',
                                        gap: 2,
                                    }}
                                >
                                    <Stack
                                        direction="row"
                                        spacing={1.5}
                                        sx={{
                                            alignItems:
                                                'center',
                                            minWidth: 0,
                                        }}
                                    >
                                        <Avatar
                                            sx={{
                                                width: 38,
                                                height: 38,
                                                bgcolor:
                                                    'primary.main',
                                                color:
                                                    'primary.contrastText',
                                                fontWeight: 800,
                                                fontSize: 14,
                                            }}
                                        >
                                            {selectedEvaluator.firstName
                                                .charAt(
                                                    0,
                                                )
                                                .toUpperCase()}
                                        </Avatar>

                                        <Box
                                            sx={{
                                                minWidth: 0,
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontWeight: 750,
                                                    fontSize: 15,
                                                }}
                                            >
                                                {
                                                    selectedEvaluator.firstName
                                                }{' '}
                                                {
                                                    selectedEvaluator.lastName
                                                }
                                            </Typography>

                                            <Typography
                                                color="text.secondary"
                                                sx={{
                                                    fontSize: 12,
                                                    mt: 0.2,
                                                    whiteSpace:
                                                        'nowrap',
                                                    overflow:
                                                        'hidden',
                                                    textOverflow:
                                                        'ellipsis',
                                                }}
                                            >
                                                {
                                                    selectedEvaluator.departmentName
                                                    ||
                                                    t
                                                        .evaluatorEmployees
                                                        .departmentNotSpecified
                                                }
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Chip
                                        icon={
                                            <GroupOutlined
                                                sx={{
                                                    fontSize: 16,
                                                }}
                                            />
                                        }
                                        label={`${team.length} ${t
                                            .evaluatorEmployees
                                            .employees
                                            }`}
                                        size="small"
                                        sx={{
                                            flexShrink: 0,
                                            fontWeight: 700,
                                            borderRadius: 1.5,
                                            bgcolor:
                                                'action.selected',
                                        }}
                                    />
                                </Box>

                                <Box
                                    sx={{
                                        px: 2.5,
                                        py: 2,
                                        display:
                                            'flex',
                                        gap: 1.5,
                                        alignItems:
                                            'center',
                                        bgcolor:
                                            'background.default',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            minWidth: 0,
                                            flex: 1,
                                        }}
                                    >
                                        <Autocomplete
                                            multiple
                                            options={
                                                filteredEmployees
                                            }
                                            value={
                                                employeesToAdd
                                            }
                                            inputValue={
                                                employeeSearch
                                            }
                                            onChange={(
                                                _,
                                                values,
                                            ) => {
                                                setEmployeesToAdd(
                                                    values,
                                                )
                                            }}
                                            onInputChange={(
                                                _,
                                                value,
                                                reason,
                                            ) => {
                                                if (
                                                    reason ===
                                                    'input' ||
                                                    reason ===
                                                    'clear'
                                                ) {
                                                    setEmployeeSearch(
                                                        value,
                                                    )
                                                }
                                            }}
                                            isOptionEqualToValue={(
                                                option,
                                                value,
                                            ) =>
                                                option.id ===
                                                value.id
                                            }
                                            filterOptions={(
                                                options,
                                            ) =>
                                                options
                                            }
                                            getOptionLabel={(
                                                user,
                                            ) =>
                                                `${user.firstName} ${user.lastName}`}
                                            disableCloseOnSelect
                                            sx={{
                                                flex: 1,
                                                minWidth: 0,

                                                '& .MuiAutocomplete-inputRoot':
                                                {
                                                    minHeight: 42,
                                                },
                                            }}
                                            renderOption={(
                                                props,
                                                option,
                                            ) => (
                                                <Box
                                                    component="li"
                                                    {...props}
                                                    key={
                                                        option.id
                                                    }
                                                    sx={{
                                                        display:
                                                            'flex !important',
                                                        alignItems:
                                                            'center',
                                                        gap: 1.5,
                                                        px: '14px !important',
                                                        py: '10px !important',
                                                    }}
                                                >
                                                    <Avatar
                                                        sx={{
                                                            width: 34,
                                                            height: 34,
                                                            fontSize: 13,
                                                            fontWeight: 700,
                                                            bgcolor:
                                                                'action.selected',
                                                            color:
                                                                'text.primary',
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {option.firstName
                                                            .charAt(
                                                                0,
                                                            )
                                                            .toUpperCase()}
                                                    </Avatar>

                                                    <Box
                                                        sx={{
                                                            minWidth: 0,
                                                        }}
                                                    >
                                                        <Typography
                                                            sx={{
                                                                fontSize: 13.5,
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            {
                                                                option.firstName
                                                            }{' '}
                                                            {
                                                                option.lastName
                                                            }
                                                        </Typography>

                                                        <Typography
                                                            sx={{
                                                                fontSize: 11.5,
                                                                color:
                                                                    'text.secondary',
                                                                mt: 0.25,
                                                            }}
                                                        >
                                                            {
                                                                option.departmentName
                                                            }{' '}
                                                            ·{' '}
                                                            {option.jobPositionName ||
                                                                t.evaluatorEmployees.positionNotSpecified}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            )}
                                            renderValue={(
                                                value,
                                                getItemProps,
                                            ) =>
                                                value.map(
                                                    (
                                                        option,
                                                        index,
                                                    ) => (
                                                        <Chip
                                                            {...getItemProps(
                                                                {
                                                                    index,
                                                                },
                                                            )}
                                                            key={
                                                                option.id
                                                            }
                                                            label={`${option.firstName} ${option.lastName}`}
                                                            size="small"
                                                            sx={{
                                                                maxWidth: 180,
                                                                fontWeight: 600,
                                                                borderRadius: 1.5,
                                                                bgcolor:
                                                                    'action.selected',
                                                                color:
                                                                    'text.primary',
                                                                border:
                                                                    '1px solid',
                                                                borderColor:
                                                                    'divider',

                                                                '& .MuiChip-deleteIcon':
                                                                {
                                                                    color:
                                                                        'text.secondary',
                                                                    fontSize: 17,

                                                                    '&:hover':
                                                                    {
                                                                        color:
                                                                            'error.main',
                                                                    },
                                                                },
                                                            }}
                                                        />
                                                    ),
                                                )
                                            }
                                            renderInput={(
                                                params,
                                            ) => (
                                                <TextField
                                                    {...params}
                                                    size="small"
                                                    placeholder={
                                                        employeesToAdd.length >
                                                            0
                                                            ? t
                                                                .evaluatorEmployees
                                                                .anotherEmployeeSearch
                                                            : t
                                                                .evaluatorEmployees
                                                                .employeeSearchPlaceholder
                                                    }
                                                />
                                            )}
                                        />
                                    </Box>

                                    <Button
                                        variant="contained"
                                        startIcon={
                                            <PersonAdd />
                                        }
                                        disabled={
                                            employeesToAdd.length ===
                                            0 ||
                                            assigning
                                        }
                                        onClick={
                                            handleAssign
                                        }
                                        sx={{
                                            flexShrink: 0,
                                        }}
                                    >
                                        {
                                            t
                                                .evaluatorEmployees
                                                .add
                                        }
                                    </Button>
                                </Box>

                                <Divider />

                                {loadingTeam ? (
                                    <LinearProgress />
                                ) : team.length === 0 ? (
                                    <Box
                                        sx={{
                                            minHeight: 260,
                                            p: 4,
                                            display:
                                                'flex',
                                            alignItems:
                                                'center',
                                            justifyContent:
                                                'center',
                                            textAlign:
                                                'center',
                                        }}
                                    >
                                        <Box>
                                            <Box
                                                sx={{
                                                    width: 56,
                                                    height: 56,
                                                    mx: 'auto',
                                                    mb: 1.5,
                                                    borderRadius: 2.5,
                                                    display:
                                                        'grid',
                                                    placeItems:
                                                        'center',
                                                    bgcolor:
                                                        'action.selected',
                                                    color:
                                                        'text.secondary',
                                                }}
                                            >
                                                <GroupOutlined />
                                            </Box>

                                            <Typography
                                                sx={{
                                                    fontWeight: 700,
                                                    mb: 0.5,
                                                }}
                                            >
                                                {
                                                    t
                                                        .evaluatorEmployees
                                                        .noTeamMembers
                                                }
                                            </Typography>

                                            <Typography
                                                color="text.secondary"
                                                sx={{
                                                    fontSize: 13,
                                                }}
                                            >
                                                {
                                                    t
                                                        .evaluatorEmployees
                                                        .noTeamMembersDescription
                                                }
                                            </Typography>
                                        </Box>
                                    </Box>
                                ) : (
                                    <List
                                        sx={{
                                            py: 0,
                                            maxHeight: {
                                                xs: 420,
                                                md: 'calc(100vh - 430px)',
                                            },
                                            overflowY:
                                                'auto',
                                        }}
                                    >
                                        {team.map(
                                            (
                                                member,
                                            ) => {
                                                const details =
                                                    enrichMember(
                                                        member,
                                                    )

                                                return (
                                                    <Box
                                                        key={
                                                            member.id
                                                        }
                                                        sx={{
                                                            display:
                                                                'flex',
                                                            alignItems:
                                                                'center',
                                                            justifyContent:
                                                                'space-between',
                                                            px: 2.5,
                                                            py: 1.5,
                                                            borderBottom:
                                                                '1px solid',
                                                            borderColor:
                                                                'divider',
                                                            transition:
                                                                'background-color 0.15s ease',

                                                            '&:hover':
                                                            {
                                                                bgcolor:
                                                                    'action.hover',
                                                            },

                                                            '&:last-child':
                                                            {
                                                                borderBottom:
                                                                    'none',
                                                            },
                                                        }}
                                                    >
                                                        {details ? (
                                                            <UserInfoTooltip
                                                                user={
                                                                    details
                                                                }
                                                                roleLabel={
                                                                    t
                                                                        .evaluatorEmployees
                                                                        .employee
                                                                }
                                                            >
                                                                <Box
                                                                    sx={{
                                                                        display:
                                                                            'flex',
                                                                        alignItems:
                                                                            'center',
                                                                        gap: 1.5,
                                                                        minWidth: 0,
                                                                        cursor:
                                                                            'default',
                                                                    }}
                                                                >
                                                                    <Avatar
                                                                        sx={{
                                                                            width: 34,
                                                                            height: 34,
                                                                            fontSize: 13,
                                                                            fontWeight: 700,
                                                                            bgcolor:
                                                                                'action.selected',
                                                                            color:
                                                                                'text.primary',
                                                                            flexShrink: 0,
                                                                        }}
                                                                    >
                                                                        {member.employeeName
                                                                            .charAt(
                                                                                0,
                                                                            )
                                                                            .toUpperCase()}
                                                                    </Avatar>

                                                                    <Box
                                                                        sx={{
                                                                            minWidth: 0,
                                                                        }}
                                                                    >
                                                                        <Typography
                                                                            sx={{
                                                                                fontWeight: 600,
                                                                                fontSize: 14,
                                                                                whiteSpace:
                                                                                    'nowrap',
                                                                                overflow:
                                                                                    'hidden',
                                                                                textOverflow:
                                                                                    'ellipsis',
                                                                            }}
                                                                        >
                                                                            {
                                                                                member.employeeName
                                                                            }
                                                                        </Typography>

                                                                        <Box
                                                                            sx={{
                                                                                display:
                                                                                    'flex',
                                                                                alignItems:
                                                                                    'center',
                                                                                gap: 0.75,
                                                                                minWidth: 0,
                                                                            }}
                                                                        >
                                                                            <Typography
                                                                                sx={{
                                                                                    fontSize: 12,
                                                                                    color:
                                                                                        'text.secondary',
                                                                                    mt: 0.25,
                                                                                    whiteSpace:
                                                                                        'nowrap',
                                                                                    overflow:
                                                                                        'hidden',
                                                                                    textOverflow:
                                                                                        'ellipsis',
                                                                                }}
                                                                            >
                                                                                {
                                                                                    details.departmentName
                                                                                }{' '}
                                                                                ·{' '}
                                                                                {
                                                                                    details.jobPositionName
                                                                                    ||
                                                                                    t
                                                                                        .evaluatorEmployees
                                                                                        .positionNone
                                                                                }
                                                                            </Typography>

                                                                            {!details.isActive && (
                                                                                <Chip
                                                                                    label={
                                                                                        t
                                                                                            .evaluatorEmployees
                                                                                            .inactive
                                                                                    }
                                                                                    size="small"
                                                                                    sx={{
                                                                                        height: 20,
                                                                                        fontSize: 10.5,
                                                                                        fontWeight: 600,
                                                                                        flexShrink: 0,
                                                                                        bgcolor:
                                                                                            'action.selected',
                                                                                        color:
                                                                                            'text.secondary',
                                                                                        border:
                                                                                            '1px solid',
                                                                                        borderColor:
                                                                                            'divider',

                                                                                        '& .MuiChip-label':
                                                                                        {
                                                                                            px: 0.75,
                                                                                        },
                                                                                    }}
                                                                                />
                                                                            )}
                                                                        </Box>
                                                                    </Box>
                                                                </Box>
                                                            </UserInfoTooltip>
                                                        ) : (
                                                            <Box
                                                                sx={{
                                                                    display:
                                                                        'flex',
                                                                    alignItems:
                                                                        'center',
                                                                    gap: 1.5,
                                                                    minWidth: 0,
                                                                }}
                                                            >
                                                                <Avatar
                                                                    sx={{
                                                                        width: 34,
                                                                        height: 34,
                                                                        fontSize: 13,
                                                                        fontWeight: 700,
                                                                        bgcolor:
                                                                            'action.selected',
                                                                        color:
                                                                            'text.primary',
                                                                    }}
                                                                >
                                                                    {member.employeeName
                                                                        .charAt(
                                                                            0,
                                                                        )
                                                                        .toUpperCase()}
                                                                </Avatar>

                                                                <Typography
                                                                    sx={{
                                                                        fontWeight: 600,
                                                                        fontSize: 14,
                                                                    }}
                                                                >
                                                                    {
                                                                        member.employeeName
                                                                    }
                                                                </Typography>
                                                            </Box>
                                                        )}

                                                        <IconButton
                                                            size="small"
                                                            onClick={() =>
                                                                setRemoveTarget(
                                                                    member,
                                                                )
                                                            }
                                                            sx={{
                                                                flexShrink: 0,
                                                                ml: 2,
                                                                color:
                                                                    'text.secondary',

                                                                '&:hover':
                                                                {
                                                                    color:
                                                                        'error.main',
                                                                },
                                                            }}
                                                        >
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                )
                                            },
                                        )}
                                    </List>
                                )}
                            </>
                        )}
                    </Paper>
                </Box>
            )}

            <ConfirmDialog
                open={!!removeTarget}
                title={
                    t.evaluatorEmployees
                        .removeTitle
                }
                description={
                    language === 'tr'
                        ? `"${removeTarget?.employeeName}" adlı çalışanı bu değerlendiricinin ekibinden çıkarmak istediğine emin misin?`
                        : `Are you sure you want to remove "${removeTarget?.employeeName}" from this evaluator's team?`
                }
                confirmLabel={
                    t.evaluatorEmployees
                        .remove
                }
                loading={removing}
                onConfirm={handleRemove}
                onCancel={() =>
                    setRemoveTarget(null)
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
                    severity={
                        snackbar.severity
                    }
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