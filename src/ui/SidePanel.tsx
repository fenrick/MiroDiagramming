import { useEffect, useState } from 'preact/hooks';

export default function SidePanel() {
  const [metadata, setMetadata] = useState<any>(null);

  useEffect(() => {
    async function handleSelection() {
      const selection = await miro.board.getSelection();
      if (selection.length > 0) {
        const item = selection[0] as any;
        setMetadata(item.metadata?.['app.miro.structgraph'] || null);
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
