declare module 'close-with-grace' {
  interface CloseWithGraceEvent {
    err?: Error
    signal?: NodeJS.Signals
    manual?: boolean
  }

  interface CloseWithGraceOptions {
    delay?: number | false | null
    timeout?: number | null
  }

  interface CloseWithGraceResult {
    uninstall: () => void
    close: () => void
  }

  type CloseWithGraceHandler = (event: CloseWithGraceEvent) => void | Promise<void>

  function closeWithGrace(handler: CloseWithGraceHandler): CloseWithGraceResult
  function closeWithGrace(
    options: CloseWithGraceOptions,
    handler: CloseWithGraceHandler,
  ): CloseWithGraceResult

  export default closeWithGrace
}
