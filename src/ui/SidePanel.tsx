import { useEffect, useState } from 'preact/hooks';

/**
 * Small utility panel that displays metadata of the currently selected widget
 * on the board. The panel listens for selection changes and updates the
 * displayed JSON accordingly.
 */
export default function SidePanel() {
  const [metadata, setMetadata] = useState<any>(null);

  useEffect(() => {
    // Listen for selection updates and load structured graph metadata for the
    // first selected item (if any).
    async function handleSelection() {
      const selection = await miro.board.getSelection();
      if (selection.length > 0) {
        const item = selection[0] as { metadata?: Record<string, unknown> };
        const data = item.metadata?.['app.miro.structgraph'] ?? null;
        setMetadata(data);
      } else {
        setMetadata(null);
      }
    }

    miro.board.ui.on('selection:update', handleSelection);
    handleSelection();
    return () => miro.board.ui.off('selection:update', handleSelection);
  }, []);

  return (
    <div className="side-panel">
      <h3>Selected Metadata</h3>
      <pre>{metadata ? JSON.stringify(metadata, null, 2) : 'No selection'}</pre>
    </div>
  );
}
