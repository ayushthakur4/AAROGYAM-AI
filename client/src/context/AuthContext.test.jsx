import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext.jsx'

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('allows logging in and logging out', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

    expect(result.current.isLoggedIn).toBe(false)
    expect(result.current.user).toBeNull()

    act(() => {
      result.current.login({ name: 'Aarav Patel', email: 'aarav@wellness.in' })
    })

    expect(result.current.isLoggedIn).toBe(true)
    expect(result.current.user.name).toBe('Aarav Patel')

    act(() => {
      result.current.logout()
    })

    expect(result.current.isLoggedIn).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('strictly saves only the past 2 search queries', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

    act(() => {
      result.current.login({ name: 'Aarav Patel', email: 'aarav@wellness.in' })
    })

    act(() => {
      result.current.saveSearchQuery('Headache')
    })
    expect(result.current.recentQueries).toEqual(['Headache'])

    act(() => {
      result.current.saveSearchQuery('Cough')
    })
    expect(result.current.recentQueries).toEqual(['Cough', 'Headache'])

    // Third search should evict the oldest one so only past 2 remain
    act(() => {
      result.current.saveSearchQuery('Stress')
    })
    expect(result.current.recentQueries).toEqual(['Stress', 'Cough'])
    expect(result.current.recentQueries.length).toBe(2)

    // Re-searching an existing query should bring it to the front without duplicating
    act(() => {
      result.current.saveSearchQuery('Cough')
    })
    expect(result.current.recentQueries).toEqual(['Cough', 'Stress'])
    expect(result.current.recentQueries.length).toBe(2)
  })

  it('allows removing a saved query', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

    act(() => {
      result.current.login({ name: 'Aarav Patel', email: 'aarav@wellness.in' })
    })

    act(() => {
      result.current.saveSearchQuery('Headache')
    })

    act(() => {
      result.current.saveSearchQuery('Cough')
    })

    expect(result.current.recentQueries).toHaveLength(2)

    act(() => {
      result.current.removeSearchQuery('Headache')
    })

    expect(result.current.recentQueries).toEqual(['Cough'])
  })
})
