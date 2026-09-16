import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ScoreSelector from './ScoreSelector'

vi.mock('@mui/icons-material', () => ({
    Star: () => <svg data-testid="StarIcon" />,
    StarBorder: () => <svg data-testid="StarBorderIcon" />,
}))

describe('ScoreSelector', () => {
    it('5 puanlık yıldızı da render etmeli', () => {
        render(<ScoreSelector value={null} onChange={vi.fn()} />)

        for (let score = 1; score <= 5; score++) {
            expect(
                screen.getByRole('button', { name: `${score} puan` })
            ).toBeInTheDocument()
        }
    })

    it('value=null iken hiçbir puan etiketi gösterilmemeli', () => {
        render(<ScoreSelector value={null} onChange={vi.fn()} />)

        expect(screen.queryByText('Yetersiz')).not.toBeInTheDocument()
        expect(screen.queryByText('Üstün')).not.toBeInTheDocument()
    })

    it.each([
        [1, 'Yetersiz'],
        [2, 'Geliştirilmeli'],
        [3, 'Beklentiyi Karşılıyor'],
        [4, 'İyi'],
        [5, 'Üstün'],
    ])(
        'value=%i verildiğinde "%s" etiketini göstermeli',
        (score, label) => {
            render(<ScoreSelector value={score} onChange={vi.fn()} />)

            expect(screen.getByText(label)).toBeInTheDocument()
        }
    )

    it('bir yıldıza tıklandığında onChange o puanla çağrılmalı', async () => {
        const user = userEvent.setup()
        const onChange = vi.fn()

        render(<ScoreSelector value={null} onChange={onChange} />)

        await user.click(screen.getByRole('button', { name: '4 puan' }))

        expect(onChange).toHaveBeenCalledTimes(1)
        expect(onChange).toHaveBeenCalledWith(4)
    })

    it('value=3 iken sadece ilk 3 puan dolu yıldız olarak görünmeli', () => {
        render(<ScoreSelector value={3} onChange={vi.fn()} />)

        const filledStars = document.querySelectorAll(
            'svg[data-testid="StarIcon"]'
        )
        const emptyStars = document.querySelectorAll(
            'svg[data-testid="StarBorderIcon"]'
        )

        expect(filledStars).toHaveLength(3)
        expect(emptyStars).toHaveLength(2)
    })

    it('value=5 iken tüm yıldızlar dolu olmalı', () => {
        render(<ScoreSelector value={5} onChange={vi.fn()} />)

        const filledStars = document.querySelectorAll(
            'svg[data-testid="StarIcon"]'
        )

        expect(filledStars).toHaveLength(5)
    })

    it('daha düşük bir puana tıklamak onChange değerini o puana düşürmeli', async () => {
        const user = userEvent.setup()
        const onChange = vi.fn()

        render(<ScoreSelector value={5} onChange={onChange} />)

        await user.click(screen.getByRole('button', { name: '2 puan' }))

        expect(onChange).toHaveBeenCalledWith(2)
    })
})