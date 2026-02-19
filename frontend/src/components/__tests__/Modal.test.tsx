import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Modal from '../Modal'

describe('Modal', () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        title: 'Test Modal',
        children: <p>Modal content here</p>,
    }

    it('should render when isOpen is true', () => {
        render(<Modal {...defaultProps} />)
        expect(screen.getByText('Test Modal')).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
        render(<Modal {...defaultProps} isOpen={false} />)
        expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
    })

    it('should display the title', () => {
        render(<Modal {...defaultProps} />)
        expect(screen.getByText('Test Modal')).toBeInTheDocument()
    })

    it('should display children content', () => {
        render(<Modal {...defaultProps} />)
        expect(screen.getByText('Modal content here')).toBeInTheDocument()
    })

    it('should call onClose when clicking the close button', async () => {
        const onClose = vi.fn()
        render(<Modal {...defaultProps} onClose={onClose} />)

        const closeButton = screen.getAllByRole('button')[0]
        fireEvent.click(closeButton)

        await waitFor(() => {
            expect(onClose).toHaveBeenCalled()
        }, { timeout: 1000 })
    })
})
