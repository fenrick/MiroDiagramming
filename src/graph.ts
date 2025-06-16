import { getTemplate, ShapeTemplate } from './templates';

export interface GraphNode {
  template: string;
  children?: GraphNode[];
}

async function createShapeFromTemplate(
  template: ShapeTemplate,
  x: number,
  y: number
) {
  return miro.board.createShape({
    content: template.name,
    x,
    y,
    shape: template.shape as any,
    width: template.width,
    height: template.height,
    style: {
      fillColor: template.fillColor,
      color: template.color,
    },
  });
}

async function renderNode(node: GraphNode, x: number, y: number) {
  const tmpl = getTemplate(node.template);
  if (!tmpl) {
    throw new Error(`Template ${node.template} not found`);
  }

  const shape = await createShapeFromTemplate(tmpl, x, y);
  let items = [shape];

  if (node.children && node.children.length) {
    let offsetY = y + tmpl.height + 40;
    for (const child of node.children) {
      const childItems = await renderNode(child, x + tmpl.width + 40, offsetY);
      items.push(...childItems);
      offsetY += tmpl.height + 40;
    }
  }

  return items;
}

export async function renderGraph(root: GraphNode, x: number, y: number) {
  const items = await renderNode(root, x, y);
  if (items.length > 1) {
    await miro.board.createGroup({ items });
  }
}
