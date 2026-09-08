import { Box, Typography } from '@mui/material'
import { translations } from '../shared/i18n/translations'
import { useLanguage } from '../shared/i18n/LanguageContext'

export default function Footer() {
    const { language } = useLanguage()
    const t = translations[language]

    return (
        <Box
            component="footer"
            sx={{
                px: { xs: 2, md: 4 },
                py: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}
        >
            <Typography
                variant="caption"
                sx={{ color: 'text.secondary' }}
            >
                © {new Date().getFullYear()} VakıfBank 360
            </Typography>

            <Typography
                variant="caption"
                sx={{ color: 'text.secondary' }}
            >
                {t.footer.allRightsReserved}
            </Typography>
        </Box>
    )
}