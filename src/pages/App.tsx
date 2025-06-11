import '/src/assets/style.css';
import { useEffect } from 'preact/hooks';
import SidePanel from '../components/SidePanel';
import { setupDragAndDrop, handleFileInput } from '../logic/indexHelpers';

/**
 * Root application component. When mounted it loads a small sample graph,
 * runs the layout engine and renders the result to the board while also
 * displaying the side panel UI.
 *
 * @returns Preact element containing the plugin UI.
 */
export default function App() {
  useEffect(() => setupDragAndDrop(), []);

  return (
    <div id="root">
      <input type="file" accept="application/json" onChange={handleFileInput} />
      <SidePanel />
    </div>
  );
}
