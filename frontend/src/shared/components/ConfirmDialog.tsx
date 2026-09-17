import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from '@mui/material'
import { useLanguage } from '../i18n/LanguageContext'

interface ConfirmDialogProps {
    open: boolean
    title: string
    description: string
    confirmLabel?: string
    loading?: boolean
    onConfirm: () => void
    onCancel: () => void
}

export default function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel,
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {

    const { language } = useLanguage()

    return (
        <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}> {title} </DialogTitle>
            <DialogContent>
                <DialogContentText>{description} </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }
            }>
                <Button onClick={onCancel} color="inherit">
                    {language === 'tr' ? 'Vazgeç' : 'Cancel'}
                </Button>

                <Button
                    onClick={onConfirm}
                    color="error"
                    variant="contained"
                    disabled={loading}
                >
                    {confirmLabel ??
                        (language === 'tr' ? 'Sil' : 'Delete')}
                </Button>
                
            </DialogActions>
        </Dialog>
    )
}
