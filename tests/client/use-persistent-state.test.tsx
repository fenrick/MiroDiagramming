// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { usePersistentState } from '../../src/core/hooks/use-persistent-state'

class MemoryStorage implements Storage {
  #store = new Map<string, string>()

  public get length(): number {
    return this.#store.size
  }

  public clear(): void {
    this.#store.clear()
  }

  public getItem(key: string): string | null {
    return this.#store.has(key) ? (this.#store.get(key) ?? null) : null
  }

  public key(index: number): string | null {
    return Array.from(this.#store.keys())[index] ?? null
  }

  public removeItem(key: string): void {
    this.#store.delete(key)
  }

  public setItem(key: string, value: string): void {
    this.#store.set(key, value)
  }
}

const TestComponent: React.FC<{ storageKey?: string; storage?: Storage }> = ({
  storageKey = 'test.key',
  storage,
}) => {
  const [value, setValue] = usePersistentState(
    storageKey,
    'initial',
    storage ? { storage } : undefined,
  )
  return (
    <button
      type="button"
      onClick={() => {
        setValue((previous) => `${previous}-next`)
      }}
    >
      {value}
    </button>
  )
}

describe('usePersistentState', () => {
  it('hydrates from the provided storage when a value exists', () => {
    const storage = new MemoryStorage()
    storage.setItem('test.persisted', JSON.stringify('stored'))
    render(<TestComponent storageKey="test.persisted" storage={storage} />)
    expect(screen.getByRole('button')).toHaveTextContent('stored')
  })

  it('stores updates back to storage', () => {
    const storage = new MemoryStorage()
    render(<TestComponent storage={storage} />)
    const button = screen.getByRole('button')
    act(() => {
      button.click()
    })
    expect(button).toHaveTextContent('initial-next')
    expect(storage.getItem('test.key')).toBe(JSON.stringify('initial-next'))
  })

  it('falls back to the initializer when storage operations fail', () => {
    const erringStorage: Storage = {
      get length() {
        return 0
      },
      clear() {
        throw new Error('blocked')
      },
      getItem() {
        throw new Error('blocked')
      },
      key() {
        return null
      },
      removeItem() {
        throw new Error('blocked')
      },
      setItem() {
        throw new Error('blocked')
      },
    }

    render(<TestComponent storageKey="no.storage" storage={erringStorage} />)
    expect(screen.getByRole('button')).toHaveTextContent('initial')
  })
})
