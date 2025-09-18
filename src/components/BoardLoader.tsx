import React, { useCallback, useEffect, useState } from 'react'

import { Button, Skeleton } from '../ui/components'

interface ShapeSnapshot {
  readonly id: string | number
  readonly [key: string]: unknown
}

/**
 * Loads cached board shapes while displaying placeholder skeletons.
 */
export function BoardLoader(): JSX.Element {
  const [shapes, setShapes] = useState<ShapeSnapshot[]>([])
  const [loading, setLoading] = useState(true)

  const SkeletonRow = (): JSX.Element => <Skeleton data-testid="skeleton" />

  const fetchShapes = useCallback(
    async (): Promise<void> => {
      const board = globalThis.miro?.board
      if (typeof board?.get !== 'function') {
        setShapes([])
        return
      }
      const items = await board.get({ type: 'shape' })
      const normalized = items.map((item) => {
        // eslint-disable-next-line no-restricted-syntax
        const record = item as unknown as Record<string, unknown>
        const idValue = record.id
        return {
          id: (typeof idValue === 'string' || typeof idValue === 'number') ? idValue : String(idValue ?? ''),
          ...record,
        } as ShapeSnapshot
      })
      setShapes(normalized)
    },
    [],
  )

  const load = useCallback(
    async (): Promise<void> => {
      await Promise.all([fetchShapes(), new Promise((resolve) => setTimeout(resolve, 350))])
      setLoading(false)
    },
    [fetchShapes],
  )

  useEffect(() => {
    void load()
  }, [load])

  const refresh = async (): Promise<void> => {
    setLoading(true)
    await load()
  }

  if (loading) {
    return (
      <div className="board-loader">
        {Array.from({ length: 3 }, (_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    )
  }

  if (shapes.length === 0) {
    return (
      <div className="board-loader">
        <div>No items yet. Create shapes or import.</div>
        <Button onClick={refresh}>Refresh board</Button>
      </div>
    )
  }

  return (
    <div className="board-loader">
      <ul>
        {shapes.map((s) => (
          <li key={String(s.id)}>{String(s.id)}</li>
        ))}
      </ul>
      <Button onClick={refresh}>Refresh board</Button>
    </div>
  )
}

export default BoardLoader
