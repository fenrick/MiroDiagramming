import React from 'react'

export type JsonDropZoneProperties = Readonly<{
  onFiles: (files: File[]) => void
}>

/**
 * Simple JSON drop/upload zone without external dependencies.
 */
export function JsonDropZone({ onFiles }: JsonDropZoneProperties): React.JSX.Element {
  const inputReference = React.useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    onFiles([...files])
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault()
    handleFiles(event.dataTransfer.files)
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
      }}
      onDrop={handleDrop}
      onClick={() => inputReference.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          inputReference.current?.click()
        }
      }}
    >
      <input
        ref={inputReference}
        type="file"
        accept=".json,application/json"
        multiple
        onChange={(event) => {
          handleFiles(event.target.files)
        }}
        aria-label="Upload JSON"
      />
      <p>Drop a JSON file here or click to select.</p>
    </div>
  )
}
