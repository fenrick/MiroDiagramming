export interface NodeData {
  id: string;
  label: string;
  type?: string;
}

export interface EdgeData {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: NodeData[];
  edges: EdgeData[];
}

const readFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target) {
        reject('Failed to load file');
        return;
      }
      resolve(e.target.result as string);
    };
    reader.onerror = () => reject('Failed to load file');
    reader.readAsText(file, 'utf-8');
  });

export const loadGraph = async (file: File): Promise<GraphData> => {
  const text = await readFile(file);
  return JSON.parse(text) as GraphData;
};
