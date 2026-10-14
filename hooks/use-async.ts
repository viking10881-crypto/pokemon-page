"use client"

import * as React from "react"

type AsyncState<T> = { key: string | null; data?: T; error?: unknown }

/** Ejecuta `load` cuando cambia `key` (null = no cargar). */
export function useAsync<T>(key: string | null, load: () => Promise<T>) {
  const [state, setState] = React.useState<AsyncState<T>>({ key: null })
  const loadRef = React.useRef(load)

  React.useEffect(() => {
    loadRef.current = load
  })

  React.useEffect(() => {
    if (key === null) return
    let alive = true
    loadRef.current().then(
      (data) => alive && setState({ key, data }),
      (error) => alive && setState({ key, error })
    )
    return () => {
      alive = false
    }
  }, [key])

  const current = state.key === key
  return {
    data: current ? state.data : undefined,
    error: current ? state.error : undefined,
    loading: key !== null && !current,
  }
}
