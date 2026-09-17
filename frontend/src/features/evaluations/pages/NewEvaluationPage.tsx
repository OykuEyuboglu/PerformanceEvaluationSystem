import { useEffect, useState, useMemo, useCallback } from 'react'

import {
    Box,
    Typography,
    MenuItem,
    TextField,
    Paper,
    Divider,
    Button,
    Snackbar,
    Alert,
    LinearProgress,
    Chip,
    Autocomplete,
    Avatar,
} from '@mui/material'

import {
    Send,
    Person,
    RateReview
} from '@mui/icons-material'

import { useAuthStore } from '../../../store/authStore'
import { useLanguage } from '../../../shared/i18n/LanguageContext'
import { translations } from '../../../shared/i18n/translations'

import { getEvaluationPeriods } from '../../evaluationPeriods/evaluationPeriodsApi'
import { getTeamByEvaluator } from '../../evaluatorEmployees/evaluatorEmployeesApi'
import {
    getCategories,
    getCriteria,
} from '../../criteria/criteriaApi'

import {
    createEvaluation,
    getMyPeriodEvaluations,
} from '../evaluationsApi'

import ScoreSelector from '../components/ScoreSelector'

import type { EvaluationPeriod } from '../../evaluationPeriods/types'
import type { EvaluatorEmployeeDto } from '../../evaluatorEmployees/types'
import type {
    PerformanceCategoryDto,
    PerformanceCriterionDto,
} from '../../criteria/types'

export default function NewEvaluationPage() {
    const currentUser = useAuthStore((s) => s.user)
    const { language } = useLanguage()
    const t = translations[language]

    const [periods, setPeriods] =
        useState<EvaluationPeriod[]>([])

    const [selectedPeriodId, setSelectedPeriodId] =
        useState<number | ''>('')

    const [team, setTeam] =
        useState<EvaluatorEmployeeDto[]>([])

    const [selectedEmployee, setSelectedEmployee] =
        useState<EvaluatorEmployeeDto | null>(null)

    const [categories, setCategories] =
        useState<PerformanceCategoryDto[]>([])

    const [criteria, setCriteria] =
        useState<PerformanceCriterionDto[]>([])

    const [completedEmployeeIds, setCompletedEmployeeIds] =
        useState<number[]>([])

    const [scores, setScores] =
        useState<Record<number, number>>({})

    const [comment, setComment] = useState('')

    const [loading, setLoading] = useState(true)
    const [loadingCompleted, setLoadingCompleted] =
        useState(false)

    const [submitting, setSubmitting] =
        useState(false)

    const [snackbar, setSnackbar] = useState<{
        open: boolean
        message: string
        severity: 'success' | 'error'
    }>({
        open: false,
        message: '',
        severity: 'success',
    })


    const loadInitial = useCallback(async () => {
        if (!currentUser) return

        setLoading(true)

        try {
            const [
                periodsData,
                teamData,
                categoriesData,
                criteriaData,
            ] = await Promise.all([
                getEvaluationPeriods(),
                getTeamByEvaluator(currentUser.id),
                getCategories(),
                getCriteria(),
            ])

            const now = new Date()

            // Sadece şu anda aktif olan dönemler
            const activePeriods =
                periodsData.filter((period) => {
                    const start =
                        new Date(period.startDate)

                    const end =
                        new Date(period.endDate)

                    return (
                        start <= now &&
                        now <= end
                    )
                })

            setPeriods(activePeriods)
            setTeam(teamData)

            setCategories(
                categoriesData.filter(
                    (category) =>
                        category.isActive
                )
            )

            setCriteria(
                criteriaData.filter(
                    (criterion) =>
                        criterion.isActive
                )
            )

            if (activePeriods.length > 0) {
                setSelectedPeriodId(
                    activePeriods[0].id
                )
            } else {
                setSelectedPeriodId('')
            }
        } catch (error) {
            console.error(
                'Değerlendirme verileri yüklenemedi:',
                error
            )

            setSnackbar({
                open: true,
                message:
                    t.newEvaluation.loadError,
                severity: 'error',
            })
        } finally {
            setLoading(false)
        }
    }, [currentUser, language])

    useEffect(() => {
        loadInitial()
    }, [loadInitial])

    const loadCompletedEvaluations =
        useCallback(async () => {
            if (
                !currentUser ||
                selectedPeriodId === ''
            ) {
                setCompletedEmployeeIds([])
                return
            }

            setLoadingCompleted(true)

            try {
                const evaluations =
                    await getMyPeriodEvaluations(
                        selectedPeriodId
                    )

                setCompletedEmployeeIds(
                    evaluations.map(
                        (evaluation) =>
                            evaluation.employeeId
                    )
                )
            } catch (error) {
                console.error(
                    'Tamamlanan değerlendirmeler alınamadı:',
                    error
                )

                setCompletedEmployeeIds([])

                setSnackbar({
                    open: true,
                    message:
                        t.newEvaluation.statusLoadError,
                    severity: 'error',
                })
            } finally {
                setLoadingCompleted(false)
            }
        }, [
            currentUser,
            selectedPeriodId,
            language,
        ])

    useEffect(() => {
        loadCompletedEvaluations()
    }, [loadCompletedEvaluations])

    const employeeJobPositionId =
        selectedEmployee?.employeeJobPositionId ??
        null

    const relevantCriteriaByCategory =
        useMemo(() => {
            if (!employeeJobPositionId) {
                return []
            }

            return categories
                .map((category) => {
                    const categoryCriteria =
                        criteria.filter(
                            (criterion) =>
                                criterion.performanceCategoryId ===
                                category.id &&
                                criterion.jobPositionDescriptions.some(
                                    (description) =>
                                        description.jobPositionId ===
                                        employeeJobPositionId
                                )
                        )

                    return {
                        category,
                        criteria: categoryCriteria,
                    }
                })
                .filter(
                    (group) =>
                        group.criteria.length > 0
                )
        }, [
            categories,
            criteria,
            employeeJobPositionId,
        ])

    const allCriteriaIds =
        relevantCriteriaByCategory.flatMap(
            (group) =>
                group.criteria.map(
                    (criterion) =>
                        criterion.id
                )
        )

    const allScored =
        allCriteriaIds.length > 0 &&
        allCriteriaIds.every(
            (id) =>
                scores[id] !== undefined
        )

    const estimatedTotal = useMemo(() => {
        if (
            relevantCriteriaByCategory.length === 0
        ) {
            return null
        }

        let weightedSum = 0

        relevantCriteriaByCategory.forEach(
            ({
                category,
                criteria: categoryCriteria,
            }) => {
                const rated =
                    categoryCriteria.filter(
                        (criterion) =>
                            scores[
                            criterion.id
                            ] !== undefined
                    )

                if (rated.length === 0) return

                const average =
                    rated.reduce(
                        (sum, criterion) =>
                            sum +
                            scores[
                            criterion.id
                            ],
                        0
                    ) / rated.length

                weightedSum +=
                    average *
                    (category.weight / 100)
            }
        )

        return weightedSum
    }, [
        relevantCriteriaByCategory,
        scores,
    ])

    useEffect(() => {
        setScores({})
        setComment('')
    }, [
        selectedEmployee?.employeeId,
    ])


    const handleSubmit = async () => {
        if (
            !selectedEmployee ||
            selectedPeriodId === '' ||
            !allScored
        ) {
            return
        }

        // Ek frontend güvenlik kontrolü
        if (
            completedEmployeeIds.includes(
                selectedEmployee.employeeId
            )
        ) {
            setSnackbar({
                open: true,
                message:
                    t.newEvaluation.alreadyEvaluated,
                severity: 'error',
            })

            return
        }

        setSubmitting(true)

        try {
            await createEvaluation({
                employeeId:
                    selectedEmployee.employeeId,

                evaluationPeriodId:
                    selectedPeriodId,

                comment:
                    comment.trim() || undefined,

                scores: allCriteriaIds.map(
                    (id) => ({
                        performanceCriterionId:
                            id,
                        score: scores[id],
                    })
                ),
            })

            setCompletedEmployeeIds(
                (previous) =>
                    previous.includes(
                        selectedEmployee.employeeId
                    )
                        ? previous
                        : [
                            ...previous,
                            selectedEmployee.employeeId,
                        ]
            )

            setSnackbar({
                open: true,
                message:
                    t.newEvaluation.success,
                severity: 'success',
            })

            setSelectedEmployee(null)
            setScores({})
            setComment('')
        } catch (error: any) {
            setSnackbar({
                open: true,
                message:
                    error?.response?.data?.message ??
                    t.newEvaluation.saveError,
                severity: 'error',
            })
        } finally {
            setSubmitting(false)
        }
    }


    if (loading) {
        return <LinearProgress />
    }

    return (
        <Box>

            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.2,
                    mb: 0.5,
                }}
            >
                <Avatar
                    sx={{
                        width: 42,
                        height: 40,
                    }}
                >
                    <RateReview />
                </Avatar>

                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 800,
                        letterSpacing: '-0.4px',
                    }}
                >
                    {t.newEvaluation.title}
                </Typography>
            </Box>

            <Typography
                color="text.secondary"
                sx={{
                    fontSize: 14.5,
                }}
            >
                {t.newEvaluation.description}
            </Typography>

            {team.length === 0 ? (
                <Paper
                    elevation={0}
                    sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 3,
                        p: 4,
                        textAlign: 'center',
                    }}
                >
                    <Avatar
                        sx={{
                            width: 52,
                            height: 52,
                            mx: 'auto',
                            mb: 1.5,
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                        }}
                    >
                        <RateReview />
                    </Avatar>

                    <Typography
                        sx={{
                            fontWeight: 700,
                        }}
                    >
                        {t.newEvaluation.noTeamMembers}
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{
                            mt: 0.5,
                            fontSize: 13.5,
                        }}
                    >
                        {t.newEvaluation.noTeamMembersDescription}
                    </Typography>
                </Paper>
            ) : (
                <Paper
                    elevation={0}
                    sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 3,
                        overflow: 'hidden',
                    }}
                >
                    {/* Üst seçim alanı */}
                    <Box
                        sx={{
                            p: {
                                xs: 2.5,
                                md: 3,
                            },
                        }}
                    >
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    md: 'minmax(260px, 0.7fr) minmax(320px, 1.3fr)',
                                },
                                gap: 2,
                            }}
                        >
                            {/* Dönem */}
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label={t.newEvaluation.evaluationPeriod}
                                value={
                                    selectedPeriodId
                                }
                                onChange={(event) =>
                                    setSelectedPeriodId(
                                        Number(
                                            event.target.value
                                        )
                                    )
                                }
                                disabled={
                                    periods.length ===
                                    0
                                }
                            >
                                {periods.map(
                                    (period) => (
                                        <MenuItem
                                            key={
                                                period.id
                                            }
                                            value={
                                                period.id
                                            }
                                        >
                                            {period.name}
                                        </MenuItem>
                                    )
                                )}
                            </TextField>

                            {/* Çalışan */}
                            <Autocomplete
                                options={team}
                                value={
                                    selectedEmployee
                                }
                                onChange={(
                                    _,
                                    value
                                ) =>
                                    setSelectedEmployee(
                                        value
                                    )
                                }
                                getOptionLabel={(
                                    option
                                ) =>
                                    option.employeeName
                                }
                                isOptionEqualToValue={(
                                    option,
                                    value
                                ) =>
                                    option.employeeId ===
                                    value.employeeId
                                }
                                getOptionDisabled={(
                                    option
                                ) =>
                                    completedEmployeeIds.includes(
                                        option.employeeId
                                    )
                                }
                                noOptionsText={t.newEvaluation.noEmployees}
                                clearText={t.newEvaluation.clear}
                                openText={t.newEvaluation.open}
                                closeText={t.newEvaluation.close}
                                filterOptions={(
                                    options,
                                    state
                                ) => {
                                    const query =
                                        state.inputValue
                                            .trim()
                                            .toLowerCase()

                                    if (!query) {
                                        return options
                                    }

                                    return options.filter(
                                        (
                                            option
                                        ) =>
                                            option.employeeName
                                                .toLowerCase()
                                                .includes(
                                                    query
                                                ) ||
                                            option.employeeJobPositionName
                                                ?.toLowerCase()
                                                .includes(
                                                    query
                                                )
                                    )
                                }}
                                renderOption={(
                                    props,
                                    option
                                ) => {
                                    const completed =
                                        completedEmployeeIds.includes(
                                            option.employeeId
                                        )

                                    return (
                                        <Box
                                            component="li"
                                            {...props}
                                            key={
                                                option.employeeId
                                            }
                                            sx={{
                                                display:
                                                    'flex !important',
                                                alignItems:
                                                    'center',
                                                justifyContent:
                                                    'space-between',
                                                gap: 2,
                                                px: 1.5,
                                                py: 1.25,
                                                opacity:
                                                    completed
                                                        ? 0.6
                                                        : 1,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display:
                                                        'flex',
                                                    alignItems:
                                                        'center',
                                                    gap: 1.25,
                                                    minWidth: 0,
                                                }}
                                            >
                                                <Avatar
                                                    sx={{
                                                        width: 36,
                                                        height: 36,
                                                        fontSize: 13,
                                                        fontWeight: 700,
                                                        bgcolor:
                                                            'primary.main',
                                                        color:
                                                            'primary.contrastText',
                                                    }}
                                                >
                                                    {option.employeeName
                                                        .charAt(
                                                            0
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
                                                            fontSize: 14,
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {
                                                            option.employeeName
                                                        }
                                                    </Typography>

                                                    <Typography
                                                        sx={{
                                                            fontSize: 12,
                                                            color:
                                                                'text.secondary',
                                                            mt: 0.2,
                                                        }}
                                                    >
                                                        {option.employeeJobPositionName ??
                                                            t.newEvaluation.positionNotSpecified}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {completed && (
                                                <Chip
                                                    label={`✓ ${t.newEvaluation.completed}`}
                                                    size="small"
                                                    sx={{
                                                        flexShrink: 0,
                                                        fontSize: 11,
                                                        fontWeight: 600,
                                                        bgcolor:
                                                            'action.selected',
                                                        color:
                                                            'text.secondary',
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    )
                                }}
                                renderInput={(
                                    params
                                ) => (
                                    <TextField
                                        {...params}
                                        label={t.newEvaluation.employee}
                                        placeholder={t.newEvaluation.searchEmployee}
                                        size="small"
                                    />
                                )}
                            />
                        </Box>

                        {/* İlerleme */}
                        <Box sx={{ mt: 2.25 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent:
                                        'space-between',
                                    alignItems:
                                        'center',
                                    mb: 0.75,
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: 12.5,
                                        color:
                                            'text.secondary',
                                    }}
                                >
                                    {t.newEvaluation.evaluationProgress}
                                </Typography>

                                <Typography
                                    sx={{
                                        fontSize: 12.5,
                                        fontWeight: 700,
                                    }}
                                >
                                    {
                                        completedEmployeeIds.length
                                    }{' '}
                                    / {team.length}{' '}
                                    {t.newEvaluation.completedCount}
                                </Typography>
                            </Box>

                            <LinearProgress
                                variant="determinate"
                                value={
                                    team.length > 0
                                        ? (completedEmployeeIds.length /
                                            team.length) *
                                        100
                                        : 0
                                }
                                sx={{
                                    height: 6,
                                    borderRadius: 3,
                                }}
                            />

                            {loadingCompleted && (
                                <Typography
                                    sx={{
                                        mt: 0.75,
                                        fontSize: 11.5,
                                        color:
                                            'text.secondary',
                                    }}
                                >
                                    {t.newEvaluation.checkingStatus}
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    <Divider />

                    {/* Dönem yok */}
                    {periods.length === 0 ? (
                        <Box
                            sx={{
                                py: 7,
                                px: 3,
                                textAlign: 'center',
                            }}
                        >
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    mb: 0.5,
                                }}
                            >
                                {t.newEvaluation.noActivePeriod}
                            </Typography>

                            <Typography
                                color="text.secondary"
                                sx={{
                                    fontSize: 13.5,
                                }}
                            >
                                {t.newEvaluation.noActivePeriodDescription}
                            </Typography>
                        </Box>
                    ) : !selectedEmployee ? (
                        <Box
                            sx={{
                                py: 7,
                                px: 3,
                                textAlign: 'center',
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 54,
                                    height: 54,
                                    mx: 'auto',
                                    mb: 1.5,
                                    bgcolor:
                                        'action.selected',
                                    color:
                                        'text.secondary',
                                }}
                            >
                                <Person />
                            </Avatar>

                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    fontSize: 15,
                                }}
                            >
                                {t.newEvaluation.selectEmployee}
                            </Typography>

                            <Typography
                                color="text.secondary"
                                sx={{
                                    mt: 0.5,
                                    fontSize: 13,
                                }}
                            >
                                {t.newEvaluation.selectEmployeeDescription}
                            </Typography>
                        </Box>
                    ) : completedEmployeeIds.includes(
                        selectedEmployee.employeeId
                    ) ? (
                        <Box
                            sx={{
                                py: 7,
                                px: 3,
                                textAlign: 'center',
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 54,
                                    height: 54,
                                    mx: 'auto',
                                    mb: 1.5,
                                    bgcolor:
                                        'action.selected',
                                    color:
                                        'text.secondary',
                                }}
                            >
                                ✓
                            </Avatar>

                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    fontSize: 15,
                                }}
                            >
                                {t.newEvaluation.completedEvaluation}
                            </Typography>

                            <Typography
                                color="text.secondary"
                                sx={{
                                    mt: 0.5,
                                    fontSize: 13,
                                }}
                            >
                                {t.newEvaluation.completedForEmployee.replace(
                                    '{name}',
                                    selectedEmployee.employeeName,
                                )}
                            </Typography>
                        </Box>
                    ) : !employeeJobPositionId ? (
                        <Box
                            sx={{
                                p: {
                                    xs: 2.5,
                                    md: 3.5,
                                },
                            }}
                        >
                            <Typography
                                color="warning.main"
                            >
                                {t.newEvaluation.missingPosition}
                            </Typography>
                        </Box>
                    ) : relevantCriteriaByCategory.length ===
                        0 ? (
                        <Box
                            sx={{
                                p: {
                                    xs: 2.5,
                                    md: 3.5,
                                },
                            }}
                        >
                            <Typography
                                color="text.secondary"
                            >
                                {t.newEvaluation.noActiveCriteria}
                            </Typography>
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                p: {
                                    xs: 2.5,
                                    md: 3.5,
                                },
                            }}
                        >
                            {/* Seçilen çalışan özeti */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems:
                                        'center',
                                    gap: 1.5,
                                    mb: 3,
                                    p: 1.75,
                                    borderRadius: 2,
                                    bgcolor:
                                        'action.hover',
                                }}
                            >
                                <Avatar
                                    sx={{
                                        width: 42,
                                        height: 42,
                                        fontWeight: 700,
                                        bgcolor:
                                            'primary.main',
                                        color:
                                            'primary.contrastText',
                                    }}
                                >
                                    {selectedEmployee.employeeName
                                        .charAt(0)
                                        .toUpperCase()}
                                </Avatar>

                                <Box
                                    sx={{
                                        minWidth: 0,
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontWeight: 700,
                                            fontSize: 14.5,
                                        }}
                                    >
                                        {
                                            selectedEmployee.employeeName
                                        }
                                    </Typography>

                                    <Typography
                                        sx={{
                                            color:
                                                'text.secondary',
                                            fontSize: 12.5,
                                            mt: 0.2,
                                        }}
                                    >
                                        {selectedEmployee.employeeJobPositionName ??
                                            t.newEvaluation.positionNotSpecified}
                                    </Typography>
                                </Box>

                                <Chip
                                    label={t.newEvaluation.evaluation}
                                    size="small"
                                    sx={{
                                        ml: 'auto',
                                        fontWeight: 600,
                                    }}
                                />
                            </Box>

                            {/* Kriterler */}
                            {relevantCriteriaByCategory.map(
                                ({
                                    category,
                                    criteria:
                                    categoryCriteria,
                                }) => (
                                    <Box
                                        key={
                                            category.id
                                        }
                                        sx={{
                                            mb: 3,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display:
                                                    'flex',
                                                alignItems:
                                                    'center',
                                                gap: 1,
                                                mb: 1.5,
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontWeight:
                                                        700,
                                                }}
                                            >
                                                {
                                                    category.name
                                                }
                                            </Typography>

                                            <Chip
                                                size="small"
                                                label={`%${category.weight}`}
                                                sx={{
                                                    fontWeight:
                                                        600,
                                                }}
                                            />
                                        </Box>

                                        {categoryCriteria.map(
                                            (
                                                criterion
                                            ) => {
                                                const description =
                                                    criterion.jobPositionDescriptions.find(
                                                        (
                                                            item
                                                        ) =>
                                                            item.jobPositionId ===
                                                            employeeJobPositionId
                                                    )

                                                return (
                                                    <Box
                                                        key={
                                                            criterion.id
                                                        }
                                                        sx={{
                                                            display:
                                                                'flex',
                                                            justifyContent:
                                                                'space-between',
                                                            alignItems:
                                                                'center',
                                                            gap: 2,
                                                            py: 2,
                                                            borderBottom:
                                                                '1px solid',
                                                            borderColor:
                                                                'divider',
                                                            flexWrap:
                                                                'wrap',
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                flex: 1,
                                                                minWidth: 220,
                                                            }}
                                                        >
                                                            <Typography
                                                                sx={{
                                                                    fontWeight:
                                                                        600,
                                                                    fontSize: 14.5,
                                                                }}
                                                            >
                                                                {
                                                                    criterion.name
                                                                }
                                                            </Typography>

                                                            {description && (
                                                                <Typography
                                                                    color="text.secondary"
                                                                    sx={{
                                                                        fontSize: 13,
                                                                        mt: 0.5,
                                                                    }}
                                                                >
                                                                    {
                                                                        description.description
                                                                    }
                                                                </Typography>
                                                            )}
                                                        </Box>

                                                        <ScoreSelector
                                                            value={
                                                                scores[
                                                                criterion
                                                                    .id
                                                                ] ??
                                                                null
                                                            }
                                                            onChange={(
                                                                score
                                                            ) =>
                                                                setScores(
                                                                    (
                                                                        previous
                                                                    ) => ({
                                                                        ...previous,
                                                                        [criterion.id]:
                                                                            score,
                                                                    })
                                                                )
                                                            }
                                                        />
                                                    </Box>
                                                )
                                            }
                                        )}
                                    </Box>
                                )
                            )}

                            <Divider
                                sx={{ my: 2 }}
                            />

                            {/* Yorum */}
                            <TextField
                                label={t.newEvaluation.commentOptional}
                                multiline
                                minRows={3}
                                fullWidth
                                value={comment}
                                onChange={(event) =>
                                    setComment(
                                        event.target.value
                                    )
                                }
                                sx={{ mb: 3 }}
                            />

                            {/* Alt bölüm */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent:
                                        'space-between',
                                    alignItems:
                                        'center',
                                    flexWrap: 'wrap',
                                    gap: 2,
                                }}
                            >
                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: 13,
                                            color:
                                                'text.secondary',
                                        }}
                                    >
                                        {t.newEvaluation.estimatedScore}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontWeight: 800,
                                            fontSize: 22,
                                        }}
                                    >
                                        {estimatedTotal !==
                                            null
                                            ? `${estimatedTotal.toFixed(
                                                2
                                            )} / 5`
                                            : '—'}
                                    </Typography>

                                    {!allScored && (
                                        <Typography
                                            sx={{
                                                fontSize: 12,
                                                color:
                                                    'warning.main',
                                                mt: 0.5,
                                            }}
                                        >
                                            {t.newEvaluation.allCriteriaRequired}
                                        </Typography>
                                    )}
                                </Box>

                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={
                                        <Send />
                                    }
                                    disabled={
                                        !allScored ||
                                        submitting
                                    }
                                    onClick={
                                        handleSubmit
                                    }
                                >
                                    {submitting
                                        ? t.newEvaluation.submitting
                                        : t.newEvaluation.submit}
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Paper>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() =>
                    setSnackbar(
                        (state) => ({
                            ...state,
                            open: false,
                        })
                    )
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