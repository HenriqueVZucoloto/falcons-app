import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '../LoginPage'

// Need to mock the logo import
vi.mock('../../assets/falcons-logo.png', () => ({ default: 'logo.png' }))

// Get the mocked signIn function
const mockSignIn = vi.fn()
vi.mock('firebase/auth', async () => {
    const actual = await vi.importActual('firebase/auth')
    return {
        ...actual,
        getAuth: vi.fn(() => ({})),
        signInWithEmailAndPassword: (...args: unknown[]) => mockSignIn(...args),
    }
})

describe('LoginPage', () => {
    beforeEach(() => {
        mockSignIn.mockReset()
    })

    it('should render email and password fields', () => {
        render(<LoginPage />)

        expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    })

    it('should render the submit button with text "Entrar"', () => {
        render(<LoginPage />)

        expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
    })

    it('should render the Falcons logo', () => {
        render(<LoginPage />)

        expect(screen.getByAltText(/falcons logo/i)).toBeInTheDocument()
    })

    it('should update email and password fields on typing', async () => {
        const user = userEvent.setup()
        render(<LoginPage />)

        const emailInput = screen.getByLabelText(/e-mail/i)
        const passwordInput = screen.getByLabelText(/senha/i)

        await user.type(emailInput, 'test@test.com')
        await user.type(passwordInput, 'password123')

        expect(emailInput).toHaveValue('test@test.com')
        expect(passwordInput).toHaveValue('password123')
    })

    it('should call signInWithEmailAndPassword on form submit', async () => {
        mockSignIn.mockResolvedValue({})
        const user = userEvent.setup()
        render(<LoginPage />)

        await user.type(screen.getByLabelText(/e-mail/i), 'test@test.com')
        await user.type(screen.getByLabelText(/senha/i), 'pass123')
        await user.click(screen.getByRole('button', { name: /entrar/i }))

        expect(mockSignIn).toHaveBeenCalledTimes(1)
    })

    it('should display error message for invalid credentials', async () => {
        const FirebaseError = class extends Error {
            code: string
            constructor(code: string, msg: string) {
                super(msg)
                this.code = code
            }
        }

        mockSignIn.mockRejectedValue(new FirebaseError('auth/invalid-credential', 'Invalid'))
        const user = userEvent.setup()
        render(<LoginPage />)

        await user.type(screen.getByLabelText(/e-mail/i), 'wrong@test.com')
        await user.type(screen.getByLabelText(/senha/i), 'wrongpass')
        await user.click(screen.getByRole('button', { name: /entrar/i }))

        expect(await screen.findByText(/e-mail ou senha inválidos/i)).toBeInTheDocument()
    })
})
