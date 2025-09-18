import type { Miro } from '@mirohq/websdk-types'

declare global {
  const miro: Miro

  interface Window {
    miro?: Miro
  }

  interface Global {
    miro?: Miro
  }
}

export {}
