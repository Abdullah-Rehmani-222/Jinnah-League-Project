import { useEffect, useState } from 'react'
import { api } from './api'

export function useDebounce(value, delay = 350) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return v
}

/** GET helper. Keeps the previous data on screen while a new request is in flight. Pass path=null to skip. */
export function useFetch(path, query) {
  const key = path ? path + JSON.stringify(query ?? {}) : null
  const [state, setState] = useState({ data: null, meta: null, loading: Boolean(path), error: null })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!key) return undefined
    const ctrl = new AbortController()
    setState((s) => ({ ...s, loading: true, error: null }))
    api
      .get(path, { query, signal: ctrl.signal })
      .then((r) => setState({ data: r.data, meta: r.meta ?? null, loading: false, error: null }))
      .catch((e) => { if (e.name !== 'AbortError') setState((s) => ({ ...s, loading: false, error: e })) })
    return () => ctrl.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, tick])

  return { ...state, reload: () => setTick((t) => t + 1) }
}
