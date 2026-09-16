import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import CategoryFormDialog, {
    type CategoryFormValues,
} from './CategoryFormDialog'
import type { PerformanceCategoryDto } from '../types'

const existingCategory: PerformanceCategoryDto = {
    id: 1,
    name: 'Teknik Yetkinlik',
    weight: 40,
    isActive: true,
}

function renderDialog(
    overrides: Partial<ComponentProps<typeof CategoryFormDialog>> = {}
) {
    const onSubmit = vi.fn()
    const onClose = vi.fn()

    const utils = render(
        <CategoryFormDialog
            open
            mode="create"
            submitting={false}
            onSubmit={onSubmit}
            onClose={onClose}
            {...overrides}
        />
    )

    return { ...utils, onSubmit, onClose }
}

describe('CategoryFormDialog', () => {
    it('create modunda alanları render etmeli ve durum anahtarı olmamalı', () => {
        renderDialog()

        expect(screen.getByText('Yeni Kategori')).toBeInTheDocument()
        expect(screen.getByLabelText(/kategori adı/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/ağırlık/i)).toBeInTheDocument()
        expect(
            screen.queryByText(/kategori durumu/i)
        ).not.toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /oluştur/i })
        ).toBeInTheDocument()
    })

    it('edit modunda mevcut kategori verisiyle doldurulmalı ve durum anahtarı görünmeli', () => {
        renderDialog({ mode: 'edit', initialData: existingCategory })

        expect(screen.getByText('Kategoriyi Düzenle')).toBeInTheDocument()
        expect(screen.getByLabelText(/kategori adı/i)).toHaveValue(
            'Teknik Yetkinlik'
        )
        expect(screen.getByLabelText(/ağırlık/i)).toHaveValue(40)
        expect(screen.getByText('Aktif')).toBeInTheDocument()
    })

    it('pasif kategori düzenlenirken anahtar "Pasif" göstermeli', () => {
        renderDialog({
            mode: 'edit',
            initialData: { ...existingCategory, isActive: false },
        })

        expect(screen.getByText('Pasif')).toBeInTheDocument()
    })

    it('boş isimle ve varsayılan ağırlıkla gönderilirse doğrulama hatalarını göstermeli', async () => {
        const user = userEvent.setup()
        const { onSubmit } = renderDialog()

        await user.click(screen.getByRole('button', { name: /oluştur/i }))

        expect(
            await screen.findByText('Kategori adı en az 2 karakter olmalı')
        ).toBeInTheDocument()
        expect(
            screen.getByText('Ağırlık 0’dan büyük olmalı')
        ).toBeInTheDocument()

        expect(onSubmit).not.toHaveBeenCalled()
    })

    it('100’den büyük ağırlık girilirse hata göstermeli', async () => {
        const user = userEvent.setup()
        const { onSubmit } = renderDialog()

        await user.type(screen.getByLabelText(/kategori adı/i), 'Geçerli Kategori')

        const weightInput = screen.getByLabelText(/ağırlık/i)
        await user.clear(weightInput)
        await user.type(weightInput, '150')

        await user.click(screen.getByRole('button', { name: /oluştur/i }))

        expect(
            await screen.findByText('Ağırlık 100’ü geçemez')
        ).toBeInTheDocument()

        expect(onSubmit).not.toHaveBeenCalled()
    })

    it('geçerli verilerle gönderildiğinde onSubmit sayısal ağırlıkla çağrılmalı', async () => {
        const user = userEvent.setup()
        const { onSubmit } = renderDialog()

        await user.type(
            screen.getByLabelText(/kategori adı/i),
            'İletişim Becerileri'
        )

        const weightInput = screen.getByLabelText(/ağırlık/i)
        await user.clear(weightInput)
        await user.type(weightInput, '25')

        await user.click(screen.getByRole('button', { name: /oluştur/i }))

        expect(onSubmit).toHaveBeenCalledTimes(1)

        const submitted = onSubmit.mock.calls[0][0] as CategoryFormValues
        expect(submitted.name).toBe('İletişim Becerileri')
        expect(submitted.weight).toBe(25)
        expect(typeof submitted.weight).toBe('number')
    })

    it('edit modunda durum anahtarına tıklayınca gönderilen değer değişmeli', async () => {
        const user = userEvent.setup()
        const { onSubmit } = renderDialog({
            mode: 'edit',
            initialData: existingCategory,
        })

        await user.click(screen.getByRole('switch'))
        expect(screen.getByText('Pasif')).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: /^kaydet$/i }))

        expect(onSubmit).toHaveBeenCalledTimes(1)
        const submitted = onSubmit.mock.calls[0][0] as CategoryFormValues
        expect(submitted.isActive).toBe(false)
    })

    it('vazgeç butonuna tıklanınca onClose çağrılmalı', async () => {
        const user = userEvent.setup()
        const { onClose } = renderDialog()

        await user.click(screen.getByRole('button', { name: /vazgeç/i }))

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('submitting=true iken buton devre dışı olmalı', () => {
        renderDialog({ submitting: true })

        expect(
            screen.getByRole('button', { name: /kaydediliyor/i })
        ).toBeDisabled()
    })
})