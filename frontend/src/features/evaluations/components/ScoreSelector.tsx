import { Box, ButtonBase, Typography } from '@mui/material'
import { Star, StarBorder } from '@mui/icons-material'

const SCORE_LABELS: Record<number, string> = {
    1: 'Yetersiz',
    2: 'Geliştirilmeli',
    3: 'Beklentiyi Karşılıyor',
    4: 'İyi',
    5: 'Üstün',
}

interface ScoreSelectorProps {
    value: number | null
    onChange: (score: number) => void
}

export default function ScoreSelector({
    value,
    onChange,
}: ScoreSelectorProps) {
    return (
        <Box>
            <Box
                sx={{
                    display: 'flex',
                    gap: 0.5,
                }}
            >
                {[1, 2, 3, 4, 5].map((score) => (
                    <ButtonBase
                        key={score}
                        onClick={() => onChange(score)}
                        sx={{
                            borderRadius: 1,
                            p: 0.25,
                        }}
                        aria-label={`${score} puan`}
                    >
                        {value !== null && score <= value ? (
                            <Star
                                sx={{
                                    fontSize: 30,
                                    color: 'primary.main',
                                }}
                            />
                        ) : (
                            <StarBorder
                                sx={{
                                    fontSize: 30,
                                    color: 'text.secondary',
                                }}
                            />
                        )}
                    </ButtonBase>
                ))}
            </Box>

            {value !== null && (
                <Typography
                    sx={{
                        fontSize: 12,
                        color: 'text.secondary',
                        mt: 0.25,
                    }}
                >
                    {SCORE_LABELS[value]}
                </Typography>
            )}
        </Box>
    )
}