import { parseGraph } from './inputParser';
import { runLayout } from './layoutEngine';
import { renderNodes } from './shapeRenderer';
import { renderEdges } from './edgeRenderer';

/**
 * Parse a JSON graph description and render it on the Miro board.
 *
 * @param json - Raw object containing nodes and edges.
 * @returns Promise that resolves when rendering has completed.
 */
export async function processJson(json: unknown): Promise<void> {
  try {
    if (typeof json !== 'object' || json === null) {
      throw new Error('Input must be an object');
    }
    const graph = parseGraph(json);
    const layout = await runLayout(graph);
    const widgets = await renderNodes(layout.nodes);
    await renderEdges(layout.edges, widgets);
  } catch (err) {
    console.error('Failed to process JSON', err);
  }
}

/**
 * Enable handling of file drops on the window.
 *
 * @returns Function to remove the registered event listeners.
 */
export function setupDragAndDrop(): () => void {
  const onDrop = async (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith('.json')) {
        console.error(
          `Unsupported file type "${fileName}". Supported file types: .json`,
          fileName
        );
        return;
      }
      const text = await file.text();
      try {
        processJson(JSON.parse(text));
      } catch (err) {
        console.error('Invalid JSON', err);
      }
    }
  };

  const onDragOver = (e: DragEvent) => e.preventDefault();

  window.addEventListener('dragover', onDragOver);
  window.addEventListener('drop', onDrop);

  // Return a cleanup function as expected by the test
  return () => {
    window.removeEventListener('dragover', onDragOver);
    window.removeEventListener('drop', onDrop);
  };
}

/**
 * Process a file selected through an HTML file input element.
 *
 * @param e - Change event fired by the input element.
 */
export async function handleFileInput(e: Event): Promise<void> {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith('.json')) {
    console.error(
      `Unsupported file type "${fileName}". Supported file types: .json`,
      fileName
    );
    return;
  }

  try {
    const text = await file.text();
    try {
      await processJson(JSON.parse(text));
    } catch (err) {
      console.error('Invalid JSON', err);
    }
  } catch (err) {
    console.error('Unable to read file', err);
  }
}
