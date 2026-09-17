import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Chip,
    Divider,
    CircularProgress,
} from '@mui/material'

import { CheckCircle } from '@mui/icons-material'

import type { EvaluationDto } from '../types'

import { useLanguage } from '../../../shared/i18n/LanguageContext'
import { translations } from '../../../shared/i18n/translations'

const STATUS_COLORS: Record<
    string,
    'info' | 'success'
> = {
    Submitted: 'info',
    Approved: 'success',
}

interface EvaluationDetailDialogProps {
    open: boolean
    evaluation: EvaluationDto | null
    onClose: () => void
    canApprove?: boolean
    onApprove?: (id: number) => void
    approving?: boolean
}

export default function EvaluationDetailDialog({
    open,
    evaluation,
    onClose,
    canApprove = false,
    onApprove,
    approving = false,
}: EvaluationDetailDialogProps) {
    const { language } = useLanguage()
    const t = translations[language]

    if (!evaluation) return null

    const grouped =
        evaluation.details.reduce<
            Record<string, typeof evaluation.details>
        >((acc, d) => {
            if (!acc[d.categoryName]) {
                acc[d.categoryName] = []
            }

            acc[d.categoryName].push(d)

            return acc
        }, {})

    const showApproveButton =
        canApprove &&
        evaluation.status === 'Submitted'

    const statusLabel =
        evaluation.status === 'Submitted'
            ? t.evaluationDetail.submitted
            : evaluation.status === 'Approved'
                ? t.evaluationDetail.approved
                : evaluation.status

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle sx={{ fontWeight: 700 }}>
                {evaluation.employeeName} —{' '}
                {evaluation.evaluationPeriodName}
            </DialogTitle>

            <DialogContent>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent:
                            'space-between',
                        alignItems: 'center',
                        mb: 2,
                        flexWrap: 'wrap',
                        gap: 1,
                    }}
                >
                    <Box>
                        <Typography
                            sx={{
                                fontSize: 13,
                                color: 'text.secondary',
                            }}
                        >
                            {t.evaluationDetail.evaluator}:{' '}
                            {evaluation.evaluatorName}
                        </Typography>

                        <Typography
                            sx={{
                                fontSize: 13,
                                color: 'text.secondary',
                            }}
                        >
                            {t.evaluationDetail.date}:{' '}
                            {new Date(
                                evaluation.createdAt,
                            ).toLocaleDateString(
                                language === 'tr'
                                    ? 'tr-TR'
                                    : 'en-US',
                            )}
                        </Typography>
                    </Box>

                    <Chip
                        label={statusLabel}
                        color={
                            STATUS_COLORS[
                            evaluation.status
                            ] ?? 'default'
                        }
                        sx={{
                            fontWeight: 600,
                        }}
                    />
                </Box>

                <Box
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'action.hover',
                        mb: 2.5,
                        textAlign: 'center',
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 12.5,
                            color: 'text.secondary',
                        }}
                    >
                        {t.evaluationDetail.totalScore}
                    </Typography>

                    <Typography
                        sx={{
                            fontWeight: 800,
                            fontSize: 26,
                        }}
                    >
                        {evaluation.totalScore.toFixed(2)} / 5
                    </Typography>
                </Box>

                {Object.entries(grouped).map(
                    ([categoryName, details]) => (
                        <Box
                            key={categoryName}
                            sx={{ mb: 2 }}
                        >
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    fontSize: 13.5,
                                    mb: 1,
                                }}
                            >
                                {categoryName}
                            </Typography>

                            {details.map((d) => (
                                <Box
                                    key={
                                        d.performanceCriterionId
                                    }
                                    sx={{
                                        display: 'flex',
                                        justifyContent:
                                            'space-between',
                                        py: 0.75,
                                        borderBottom:
                                            '1px solid',
                                        borderColor:
                                            'divider',
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: 13.5,
                                        }}
                                    >
                                        {d.criterionName}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: 13.5,
                                            fontWeight: 700,
                                        }}
                                    >
                                        {d.score} / 5
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    ),
                )}

                {evaluation.comment && (
                    <>
                        <Divider sx={{ my: 1.5 }} />

                        <Typography
                            sx={{
                                fontWeight: 700,
                                fontSize: 13.5,
                                mb: 0.5,
                            }}
                        >
                            {t.evaluationDetail.comment}
                        </Typography>

                        <Typography
                            sx={{
                                fontSize: 13.5,
                                color: 'text.secondary',
                            }}
                        >
                            {evaluation.comment}
                        </Typography>
                    </>
                )}
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
                    {t.evaluationDetail.close}
                </Button>

                {showApproveButton && (
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={
                            approving ? (
                                <CircularProgress
                                    size={16}
                                    sx={{
                                        color: '#fff',
                                    }}
                                />
                            ) : (
                                <CheckCircle />
                            )
                        }
                        disabled={approving}
                        onClick={() =>
                            onApprove?.(
                                evaluation.id,
                            )
                        }
                    >
                        {approving
                            ? t.evaluationDetail
                                .approving
                            : t.evaluationDetail
                                .approve}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    )
}