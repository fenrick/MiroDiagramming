import React from 'react'

export type JsonDropZoneProperties = Readonly<{
  onFiles: (files: File[]) => void
}>

/**
 * Simple JSON drop/upload zone without external dependencies.
 */
export function JsonDropZone({ onFiles }: JsonDropZoneProperties): React.JSX.Element {
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    onFiles(Array.from(files))
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault()
    handleFiles(event.dataTransfer.files)
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
      style={{
        border: '2px dashed var(--indigo400)',
        borderRadius: 'var(--border-radius-medium)',
        padding: 'var(--space-300)',
        textAlign: 'center',
        cursor: 'pointer',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
        aria-label="Upload JSON"
      />
      <p>Drop a JSON file here or click to select.</p>
    </div>
  )
}
