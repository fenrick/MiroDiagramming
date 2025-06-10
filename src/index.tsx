import '/assets/style.css';
import { useEffect } from 'preact/hooks';
import SidePanel from './ui/SidePanel';
import { parseGraph } from './logic/inputParser';
import { runLayout } from './logic/layoutEngine';
import { renderNodes } from './logic/shapeRenderer';
import { renderEdges } from './logic/edgeRenderer';

const sampleData = {
  nodes: [
    { id: 'n1', label: 'Node 1' },
    { id: 'n2', label: 'Node 2' },
  ],
  edges: [{ id: 'e1', source: 'n1', target: 'n2', label: 'Edge 1' }],
};

async function main() {
  const graph = parseGraph(sampleData);
  const layout = await runLayout(graph);
  const widgets = await renderNodes(layout.nodes);
  await renderEdges(layout.edges, widgets);
}

export default function App() {
  useEffect(() => {
    main();
  }, []);

  return (
    <div id="root">
      <SidePanel />
    </div>
  );
}
