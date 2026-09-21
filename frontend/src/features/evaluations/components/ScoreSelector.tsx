import {
    Box,
    ButtonBase,
    Typography,
} from '@mui/material'

import {
    Star,
    StarBorder,
} from '@mui/icons-material'

import { useLanguage } from '../../../shared/i18n/LanguageContext'
import { translations } from '../../../shared/i18n/translations'

interface ScoreSelectorProps {
    value: number | null
    onChange: (score: number) => void
}

export default function ScoreSelector({
    value,
    onChange,
}: ScoreSelectorProps) {
    const { language } = useLanguage()
    const t = translations[language]

    const scoreLabel =
        value !== null
            ? t.scoreSelector.labels[
            value as 1 | 2 | 3 | 4 | 5
            ]
            : ''

    return (
        <Box>
            <Box
                sx={{
                    display: 'flex',
                    gap: 0.5,
                }}
            >
                {[1, 2, 3, 4, 5].map(
                    (score) => (
                        <ButtonBase
                            key={score}
                            onClick={() =>
                                onChange(score)
                            }
                            sx={{
                                borderRadius: 1,
                                p: 0.25,
                            }}
                            aria-label={`${score} ${t.scoreSelector.points}`}
                        >
                            {value !== null &&
                                score <= value ? (
                                <Star
                                    sx={{
                                        fontSize: 30,
                                        color:
                                            'primary.main',
                                    }}
                                />
                            ) : (
                                <StarBorder
                                    sx={{
                                        fontSize: 30,
                                        color:
                                            'text.secondary',
                                    }}
                                />
                            )}
                        </ButtonBase>
                    ),
                )}
            </Box>

            {value !== null && (
                <Typography
                    sx={{
                        fontSize: 12,
                        color: 'text.secondary',
                        mt: 0.25,
                    }}
                >
                    {scoreLabel}
                </Typography>
            )}
        </Box>
    )
}