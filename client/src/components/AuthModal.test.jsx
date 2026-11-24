import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from '../context/AuthContext.jsx'
import AuthModal from './AuthModal.jsx'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function TestHarness() {
  const { openAuthModal } = useAuth()
  return (
    <div>
      <button onClick={openAuthModal}>Open Modal</button>
      <AuthModal />
    </div>
  )
}

function renderModal() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <TestHarness />
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('AuthModal component', () => {
  it('opens and displays serene sanctuary branding without developer jargon', () => {
    const { container } = renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Open Modal' }))

    // Eyebrow badge
    expect(screen.getByText('Aarogyam Sanctuary')).toBeInTheDocument()

    // Title
    expect(screen.getByRole('heading', { level: 2, name: /sign in to your account/i })).toBeInTheDocument()

    // Subtitle does not contain database jargon
    expect(screen.getByText(/access your saved wellness inquiries and classical ayurvedic recommendations/i)).toBeInTheDocument()
    expect(screen.queryByText(/database profile/i)).not.toBeInTheDocument()

    // Primary CTA is clean
    const submitBtn = container.querySelector('button[type="submit"]')
    expect(submitBtn).toBeInTheDocument()
    expect(submitBtn.textContent).toMatch(/Sign In/i)
    expect(screen.queryByText(/with supabase/i)).not.toBeInTheDocument()

    // Quick demo section
    expect(screen.getByText(/explore with demo profile/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /aarav patel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /priya sharma/i })).toBeInTheDocument()
  })

  it('switches to Create Account mode smoothly', () => {
    const { container } = renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Open Modal' }))
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

    expect(screen.getByRole('heading', { level: 2, name: /create your account/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/your full name/i)).toBeInTheDocument()

    const submitBtn = container.querySelector('button[type="submit"]')
    expect(submitBtn.textContent).toMatch(/Create Account/i)
  })

  it('allows logging in directly via demo profile', () => {
    renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Open Modal' }))
    fireEvent.click(screen.getByRole('button', { name: /priya sharma/i }))

    // Once logged in, modal closes automatically
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('can be closed using the close button', () => {
    renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Open Modal' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /close authentication dialog/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
