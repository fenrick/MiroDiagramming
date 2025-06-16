import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { useDropzone } from 'react-dropzone';
import { loadGraph } from './graph';
import { layoutGraph } from './elk-layout';
import { parseCsv } from './csv-utils';
import { createMindmap } from './mindmap';

// UI
const dropzoneStyles = {
  display: 'flex',
  height: '100%',
  flexDirection: 'column',
  justifyContent: 'center',
  textAlign: 'center',
  border: '3px dashed rgba(41, 128, 185, 0.5)',
  color: 'rgba(41, 128, 185, 1.0)',
  fontWeight: 'bold',
  fontSize: '1.2em',
} as const;

const App: React.FC = () => {
  const [files, setFiles] = React.useState<File[]>([]);
  const dropzone = useDropzone({
    accept: {
      'application/json': ['.json'],
    },
    maxFiles: 1,
    onDrop: (droppedFiles) => {
      setFiles([droppedFiles[0]]);
    },
  });

  const handleCreate = async () => {
    for (const file of files) {
      try {
        const graph = await loadGraph(file);
        const positions = await layoutGraph(graph);

        const created: Record<string, string> = {};
        for (const node of graph.nodes) {
          const pos = positions[node.id];
          const shape = await miro.board.createShape({
            content: node.label,
            x: pos.x,
            y: pos.y,
            width: pos.width,
            height: pos.height,
          });
          created[node.id] = shape.id;
        }

        for (const edge of graph.edges) {
          const start = created[edge.source];
          const end = created[edge.target];
          if (start && end) {
            await miro.board.createConnector({
              start: { item: start },
              end: { item: end },
            });
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    setFiles([]);
  };

  const style = React.useMemo(() => {
    let borderColor = 'rgba(41, 128, 185, 0.5)';
    if (dropzone.isDragAccept) {
      borderColor = 'rgba(41, 128, 185, 1.0)';
    }

    if (dropzone.isDragReject) {
      borderColor = 'rgba(192, 57, 43,1.0)';
    }
    return {
      ...dropzoneStyles,
      borderColor,
    };
  }, [dropzone.isDragActive, dropzone.isDragReject]);

  return (
    <div className="dnd-container">
      <p>Select the JSON file to import and create a diagram</p>
      <div {...dropzone.getRootProps({ style })}>
        <input {...dropzone.getInputProps()} />
        {dropzone.isDragAccept ? (
          <p className="dnd-text">Drop your JSON file here</p>
        ) : (
          <>
            <div>
              <button
                type="button"
                className="button button-primary button-small"
              >
                Select JSON file
              </button>
              <p className="dnd-text">Or drop your JSON file here</p>
            </div>
          </>
        )}
      </div>
      {files.length > 0 && (
        <>
          <ul className="dropped-files">
            {files.map((file, i) => (
              <li key={i}>{file.name}</li>
            ))}
          </ul>

          <button
            onClick={handleCreate}
            className="button button-small button-primary"
          >
            Create Diagram
          </button>
        </>
      )}
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
