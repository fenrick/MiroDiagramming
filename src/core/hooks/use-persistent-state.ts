import * as React from 'react'

/** Options for configuring how values are persisted in storage. */
interface PersistentStateOptions<T> {
  /** Override the storage object (defaults to `globalThis.localStorage`). */
  readonly storage?: Storage
  /** Custom serializer. Defaults to JSON serialization. */
  readonly serialize?: (value: T) => string
  /** Custom deserializer matching {@link serialize}. Defaults to JSON parse. */
  readonly deserialize?: (raw: string) => T
}

type StateUpdater<T> = T | ((previous: T) => T)

type InitialState<T> = T | (() => T)

const defaultSerialize = (value: unknown): string => {
  const serialized = JSON.stringify(value)
  return typeof serialized === 'string' ? serialized : 'null'
}

const defaultDeserialize = (raw: string): unknown => JSON.parse(raw)

const resolveInitial = <T>(value: InitialState<T>): T =>
  typeof value === 'function' ? (value as () => T)() : value

const safeDeserialize = <T>(raw: string, deserialize: (value: string) => T): T | null => {
  try {
    return deserialize(raw)
  } catch {
    return null
  }
}

const getStorage = (override?: Storage): Storage | null => {
  if (override) {
    return override
  }
  try {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
      return globalThis.localStorage
    }
  } catch {
    // Ignored (private mode, sandboxed iframe, etc.)
  }
  return null
}

const readStoredValue = <T>(
  key: string,
  initialValue: InitialState<T>,
  options?: PersistentStateOptions<T>,
): T => {
  const storage = getStorage(options?.storage)
  const deserialize = options?.deserialize ?? ((value: string) => defaultDeserialize(value) as T)
  if (storage) {
    try {
      const raw = storage.getItem(key)
      if (raw !== null) {
        const parsed = safeDeserialize(raw, deserialize)
        if (parsed !== null) {
          return parsed
        }
      }
    } catch {
      // Ignore storage failures and fall back to the initial value.
    }
  }
  return resolveInitial(initialValue)
}

/**
 * Persist state in `localStorage` (or a provided storage adapter) with SSR safety.
 * Values are serialized via JSON by default and rehydrated on mount.
 */
export function usePersistentState<T>(
  key: string,
  initialValue: InitialState<T>,
  options?: PersistentStateOptions<T>,
): [T, (value: StateUpdater<T>) => void] {
  const serialize = options?.serialize ?? ((value: T) => defaultSerialize(value))
  const deserialize = options?.deserialize ?? ((value: string) => defaultDeserialize(value) as T)
  const storageOverride = options?.storage
  const initializerReference = React.useRef(initialValue)

  React.useEffect(() => {
    initializerReference.current = initialValue
  }, [initialValue])

  const [value, setValue] = React.useState<T>(() =>
    readStoredValue(key, initialValue, { storage: storageOverride, deserialize }),
  )

  // Re-read when the key changes so state aligns with the new namespace.
  React.useEffect(() => {
    setValue(
      readStoredValue(key, initializerReference.current, {
        storage: storageOverride,
        deserialize,
      }),
    )
  }, [deserialize, key, storageOverride])

  const setPersistentValue = React.useCallback(
    (updater: StateUpdater<T>) => {
      setValue((previous) => {
        const next =
          typeof updater === 'function' ? (updater as (current: T) => T)(previous) : updater
        const storage = getStorage(storageOverride)
        if (storage) {
          try {
            if (typeof next === 'undefined') {
              storage.removeItem(key)
            } else {
              storage.setItem(key, serialize(next))
            }
          } catch {
            // Ignore quota/security errors; state remains updated locally.
          }
        }
        return next
      })
    },
    [key, serialize, storageOverride],
  )

  return [value, setPersistentValue]
}
