import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import EvaluationDetailDialog from './EvaluationDetailDialog'
import type { EvaluationDto } from '../types'

vi.mock('@mui/icons-material', () => ({
    CheckCircle: () => <span data-testid="check-circle-icon" />,
}))

const mockEvaluation: EvaluationDto = {
    id: 1,
    employeeId: 10,
    employeeName: 'Test Çalışan',
    evaluatorId: 20,
    evaluatorName: 'Test Değerlendirici',
    evaluationPeriodName: '2026 Q3',
    totalScore: 4.25,
    status: 'Submitted',
    createdAt: '2026-07-15T10:30:00',
    comment: 'Genel performans oldukça iyi.',
    details: [
        {
            performanceCriterionId: 1,
            criterionName: 'Teknik Yetkinlik',
            categoryName: 'Teknik Beceriler',
            score: 5,
        },
        {
            performanceCriterionId: 2,
            criterionName: 'Problem Çözme',
            categoryName: 'Teknik Beceriler',
            score: 4,
        },
        {
            performanceCriterionId: 3,
            criterionName: 'İletişim',
            categoryName: 'Kişisel Yetkinlikler',
            score: 4,
        },
    ],
}

const renderDialog = (
    props: Partial<React.ComponentProps<typeof EvaluationDetailDialog>> = {},
) => {
    const defaultProps = {
        open: true,
        evaluation: mockEvaluation,
        onClose: vi.fn(),
        ...props,
    }

    return render(<EvaluationDetailDialog {...defaultProps} />)
}

describe('EvaluationDetailDialog', () => {
    it('evaluation null ise hiçbir şey göstermemeli', () => {
        const { container } = render(
            <EvaluationDetailDialog
                open={true}
                evaluation={null}
                onClose={vi.fn()}
            />,
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('değerlendirme bilgilerini göstermeli', () => {
        renderDialog()

        expect(
            screen.getByText('Test Çalışan — 2026 Q3'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('Değerlendiren: Test Değerlendirici'),
        ).toBeInTheDocument()

        expect(
            screen.getByText((content) =>
                content.includes('Tarih:') &&
                content.includes('15.07.2026'),
            ),
        ).toBeInTheDocument()

        expect(screen.getByText('Gönderildi')).toBeInTheDocument()
    })

    it('toplam skoru doğru göstermeli', () => {
        renderDialog()

        expect(screen.getByText('Toplam Skor')).toBeInTheDocument()
        expect(screen.getByText('4.25 / 5')).toBeInTheDocument()
    })

    it('kriterleri kategorilere göre gruplandırarak göstermeli', () => {
        renderDialog()

        expect(screen.getByText('Teknik Beceriler')).toBeInTheDocument()
        expect(screen.getByText('Teknik Yetkinlik')).toBeInTheDocument()
        expect(screen.getByText('Problem Çözme')).toBeInTheDocument()

        expect(
            screen.getByText('Kişisel Yetkinlikler'),
        ).toBeInTheDocument()

        expect(screen.getByText('İletişim')).toBeInTheDocument()

        expect(screen.getByText('5 / 5')).toBeInTheDocument()
        expect(screen.getAllByText('4 / 5')).toHaveLength(2)
    })

    it('yorum varsa yorumu göstermeli', () => {
        renderDialog()

        expect(screen.getByText('Yorum')).toBeInTheDocument()

        expect(
            screen.getByText('Genel performans oldukça iyi.'),
        ).toBeInTheDocument()
    })

    it('yorum yoksa yorum alanını göstermemeli', () => {
        renderDialog({
            evaluation: {
                ...mockEvaluation,
                comment: '',
            },
        })

        expect(screen.queryByText('Yorum')).not.toBeInTheDocument()

        expect(
            screen.queryByText('Genel performans oldukça iyi.'),
        ).not.toBeInTheDocument()
    })

    it('Approved durumunu doğru göstermeli', () => {
        renderDialog({
            evaluation: {
                ...mockEvaluation,
                status: 'Approved',
            },
        })

        expect(screen.getByText('Onaylandı')).toBeInTheDocument()
        expect(screen.queryByText('Gönderildi')).not.toBeInTheDocument()
    })

    it('canApprove true ve Submitted durumunda Onayla butonunu göstermeli', () => {
        renderDialog({
            canApprove: true,
        })

        expect(
            screen.getByRole('button', { name: 'Onayla' }),
        ).toBeInTheDocument()
    })

    it('Onayla butonuna basıldığında evaluation id ile onApprove çağırmalı', async () => {
        const user = userEvent.setup()
        const onApprove = vi.fn()

        renderDialog({
            canApprove: true,
            onApprove,
        })

        await user.click(
            screen.getByRole('button', { name: 'Onayla' }),
        )

        expect(onApprove).toHaveBeenCalledTimes(1)
        expect(onApprove).toHaveBeenCalledWith(1)
    })

    it('Approved durumunda Onayla butonunu göstermemeli', () => {
        renderDialog({
            canApprove: true,
            evaluation: {
                ...mockEvaluation,
                status: 'Approved',
            },
        })

        expect(
            screen.queryByRole('button', { name: 'Onayla' }),
        ).not.toBeInTheDocument()
    })

    it('canApprove false ise Onayla butonunu göstermemeli', () => {
        renderDialog({
            canApprove: false,
        })

        expect(
            screen.queryByRole('button', { name: 'Onayla' }),
        ).not.toBeInTheDocument()
    })

    it('onaylama sırasında butonu devre dışı bırakmalı', () => {
        renderDialog({
            canApprove: true,
            approving: true,
        })

        const approveButton = screen.getByRole('button', {
            name: 'Onaylanıyor...',
        })

        expect(approveButton).toBeDisabled()
    })

    it('Kapat butonuna basıldığında onClose çağırmalı', async () => {
        const user = userEvent.setup()
        const onClose = vi.fn()

        renderDialog({
            onClose,
        })

        await user.click(
            screen.getByRole('button', { name: 'Kapat' }),
        )

        expect(onClose).toHaveBeenCalledTimes(1)
    })
})