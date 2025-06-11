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
export async function processJson(json: any) {
  try {
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
export function setupDragAndDrop() {
  const onDragOver = (e: DragEvent) => e.preventDefault();
  const onDrop = async (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      const text = await file.text();
      try {
        processJson(JSON.parse(text));
      } catch (err) {
        console.error('Invalid JSON', err);
      }
    }
  };
  window.addEventListener('dragover', onDragOver);
  window.addEventListener('drop', onDrop);
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
export function handleFileInput(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  file
    .text()
    .then((text) => {
      try {
        processJson(JSON.parse(text));
      } catch (err) {
        console.error('Invalid JSON', err);
      }
    })
    .catch((err) => console.error('Unable to read file', err));
}
