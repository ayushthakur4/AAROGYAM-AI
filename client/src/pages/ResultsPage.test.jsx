import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AppRoutes from '../AppRoutes.jsx'
import RecommendationList from '../components/RecommendationList.jsx'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('sample wellness results route', () => {
  it('shows the separate sample guide, safety note, remedy steps, and sample videos', () => {
    render(<MemoryRouter initialEntries={['/results/demo']}><AppRoutes /></MemoryRouter>)

    expect(screen.getByRole('heading', { name: /gentle guide for.*common cold/i })).toBeInTheDocument()
    expect(screen.getByText(/sample guide.*not personalized/i)).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /home remedies/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getAllByText('PREPARATION').length).toBeGreaterThan(0)
    expect(screen.getByText(/never give honey to a child younger than 1 year/i)).toBeInTheDocument()
    expect(screen.getByText('SAMPLE VIDEO 01')).toBeInTheDocument()
  })

  it('switches to the yoga tab and exposes gentle instructions and durations', () => {
    render(<MemoryRouter initialEntries={['/results/demo']}><AppRoutes /></MemoryRouter>)
    fireEvent.click(screen.getByRole('tab', { name: /yoga practices/i }))

    expect(screen.getByRole('tab', { name: /yoga practices/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('heading', { name: 'Rest is a practice, too.' })).toBeInTheDocument()
    expect(screen.getByText('2–3 minutes')).toBeInTheDocument()
    expect(screen.getByText(/keep your breath natural/i)).toBeInTheDocument()
  })

  it('submits a search to the API and opens the returned guide', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        query: 'gentle sleep routine',
        summary: 'A few low-pressure ideas for a calmer evening.',
        safetyNote: 'General wellness information only.',
        remedies: [],
        yoga: [],
        videos: [],
        sources: [],
      }),
    }))
    render(<MemoryRouter initialEntries={['/']}><AppRoutes /></MemoryRouter>)

    fireEvent.change(screen.getByRole('searchbox', { name: 'What are you feeling today?' }), { target: { value: 'gentle sleep routine' } })
    fireEvent.click(screen.getByRole('button', { name: 'Explore wellness guidance' }))

    expect(await screen.findByRole('heading', { name: /gentle guide for.*gentle sleep routine/i })).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/search', expect.objectContaining({ method: 'POST', body: JSON.stringify({ query: 'gentle sleep routine' }) }))
  })
})

describe('YouTube keyword cards', () => {
  it('shows yoga artwork that opens topic-based YouTube search results', () => {
    const guide = {
      query: 'evening relaxation',
      summary: 'A gentle guide.',
      safetyNote: 'General wellness information.',
      remedies: [],
      yoga: [],
      videos: [],
    }
    render(<MemoryRouter initialEntries={[{ pathname: '/results', state: { guide } }]}><AppRoutes /></MemoryRouter>)

    const links = screen.getAllByRole('link', { name: /search youtube for/i })
    expect(links).toHaveLength(3)
    expect(links[0].getAttribute('href')).toContain('https://www.youtube.com/results?search_query=')
    expect(links[0].getAttribute('href')).toContain('evening%20relaxation%20gentle%20warrior%20yoga%20pose')
    expect(links[0]).toHaveAttribute('target', '_blank')
    expect(screen.getAllByRole('img', { name: /illustration of a .* yoga pose/i })).toHaveLength(3)
    expect(new Set(screen.getAllByRole('img', { name: /illustration of a .* yoga pose/i }).map((image) => image.getAttribute('src'))).size).toBe(3)
  })
})

describe('recommendation UI states', () => {
  it('renders a loading skeleton with an accessible busy state', () => {
    render(<RecommendationList kind="remedy" items={[]} state="loading" />)
    expect(screen.getByRole('region', { name: 'Loading home remedies' })).toHaveAttribute('aria-busy', 'true')
  })

  it('renders empty and retryable error states', () => {
    const onRetry = vi.fn()
    const { rerender } = render(<MemoryRouter><RecommendationList kind="remedy" items={[]} /></MemoryRouter>)
    expect(screen.getByRole('status')).toHaveTextContent('Nothing to show here yet')

    rerender(<MemoryRouter><RecommendationList kind="remedy" items={[]} state="error" onRetry={onRetry} /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(screen.getByRole('alert')).toHaveTextContent('We couldn’t load this section')
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
