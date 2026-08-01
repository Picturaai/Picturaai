import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { reducer } from '@/hooks/use-toast'

type State = Parameters<typeof reducer>[0]
type Action = Parameters<typeof reducer>[1]

const toast = (id: string, extra: Record<string, unknown> = {}) =>
  ({ id, open: true, title: `toast ${id}`, ...extra }) as State['toasts'][number]

describe('use-toast reducer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('adds a toast to the front of the queue', () => {
    const state = reducer({ toasts: [] }, { type: 'ADD_TOAST', toast: toast('1') } as Action)
    expect(state.toasts.map((t) => t.id)).toEqual(['1'])
  })

  it('enforces the toast limit of one', () => {
    const state = reducer({ toasts: [toast('1')] }, { type: 'ADD_TOAST', toast: toast('2') } as Action)
    expect(state.toasts.map((t) => t.id)).toEqual(['2'])
  })

  it('updates only the matching toast', () => {
    const state = reducer(
      { toasts: [toast('1'), toast('2')] },
      { type: 'UPDATE_TOAST', toast: { id: '2', title: 'updated' } } as Action,
    )
    expect(state.toasts.map((t) => t.title)).toEqual(['toast 1', 'updated'])
  })

  it('closes a single toast on dismiss by id', () => {
    const state = reducer({ toasts: [toast('1'), toast('2')] }, { type: 'DISMISS_TOAST', toastId: '1' } as Action)
    expect(state.toasts.map((t) => t.open)).toEqual([false, true])
  })

  it('closes every toast when dismissing without an id', () => {
    const state = reducer({ toasts: [toast('1'), toast('2')] }, { type: 'DISMISS_TOAST' } as Action)
    expect(state.toasts.every((t) => t.open === false)).toBe(true)
  })

  it('removes a toast by id and clears them all when no id is given', () => {
    expect(
      reducer({ toasts: [toast('1'), toast('2')] }, { type: 'REMOVE_TOAST', toastId: '1' } as Action).toasts.map(
        (t) => t.id,
      ),
    ).toEqual(['2'])
    expect(reducer({ toasts: [toast('1')] }, { type: 'REMOVE_TOAST' } as Action).toasts).toEqual([])
  })

  it('queues removal only once per toast when dismissed repeatedly', () => {
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout')
    const state = { toasts: [toast('queued')] }
    reducer(state, { type: 'DISMISS_TOAST', toastId: 'queued' } as Action)
    reducer(state, { type: 'DISMISS_TOAST', toastId: 'queued' } as Action)
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1)
    setTimeoutSpy.mockRestore()
  })
})
