import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from '@mui/material'

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
    confirmLabel = 'Sil',
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}> {title} </DialogTitle>
            <DialogContent>
                <DialogContentText>{description} </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }
            }>
                <Button onClick={onCancel} color="inherit">
                    Vazgeç
                </Button>
                <Button onClick={onConfirm} color="error" variant="contained" disabled={loading}>
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
