import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App.jsx'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function renderApp() {
  return render(<MemoryRouter><App /></MemoryRouter>)
}

describe('AAROGYAM AI landing page', () => {
  it('renders the hero, search field, and wellness topics', () => {
    renderApp()

    expect(screen.getByRole('heading', { level: 1, name: /ancient wisdom.*intelligent wellness/i })).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'What are you feeling today?' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Headache' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Common cold' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /a little care/i })).toBeInTheDocument()
  })

  it('fills the search field when a suggested topic is chosen', () => {
    renderApp()
    const search = screen.getByRole('searchbox', { name: 'What are you feeling today?' })

    fireEvent.click(screen.getByRole('button', { name: 'Headache' }))

    expect(search).toHaveValue('Headache')
  })

  it('keeps the responsive navigation accessible and closes it after selection', () => {
    renderApp()

    fireEvent.click(screen.getByRole('button', { name: 'Open navigation menu' }))
    expect(screen.getByRole('button', { name: 'Close navigation menu' })).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(screen.getByRole('link', { name: 'Home' }))
    expect(screen.getByRole('button', { name: 'Open navigation menu' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows a service error when the search request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'We could not prepare a guide right now.' }),
    }))
    renderApp()
    const search = screen.getByRole('searchbox', { name: 'What are you feeling today?' })
    fireEvent.change(search, { target: { value: 'sleep trouble' } })
    fireEvent.submit(search.closest('form'))

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not prepare a guide/i)
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/search', expect.objectContaining({ method: 'POST' }))
    expect(window.location.hash).not.toBe('#results')
  })
})
