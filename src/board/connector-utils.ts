import type {
  BaseItem,
  Connector,
  ConnectorStyle,
  Group,
  TextAlignVertical,
} from '@mirohq/websdk-types';
import type { ConnectorTemplate } from './templates';
import type { EdgeData, EdgeHint } from '../core/graph';
import { STRUCT_GRAPH_KEY } from './meta-constants';

const META_KEY = STRUCT_GRAPH_KEY;

/**
 * Update an existing connector with style, label and hint data.
 *
 * @param connector - The connector widget to update.
 * @param edge - Edge data providing label and metadata.
 * @param template - Connector template describing style defaults.
 * @param hint - Optional hint for start and end positions.
 */
function buildCaptions(
  edge: EdgeData,
  template?: ConnectorTemplate,
): Connector['captions'] {
  if (!edge.label) return undefined;
  return [
    {
      content: edge.label,
      position: template?.caption?.position,
      textAlignVertical: template?.caption
        ?.textAlignVertical as TextAlignVertical,
    },
  ];
}

function mergeStyle(connector: Connector, template?: ConnectorTemplate): void {
  if (template?.style) {
    connector.style = {
      ...connector.style,
      ...template.style,
    } as ConnectorStyle;
  }
  connector.shape = template?.shape ?? connector.shape;
}

function applyHint(connector: Connector, hint?: EdgeHint): void {
  if (hint?.startPosition) {
    connector.start = {
      ...(connector.start ?? {}),
      position: hint.startPosition,
    } as Connector['start'];
  }
  if (hint?.endPosition) {
    connector.end = {
      ...(connector.end ?? {}),
      position: hint.endPosition,
    } as Connector['end'];
  }
}

export function updateConnector(
  connector: Connector,
  edge: EdgeData,
  template?: ConnectorTemplate,
  hint?: EdgeHint,
): void {
  const captions = buildCaptions(edge, template);
  if (captions) connector.captions = captions;
  mergeStyle(connector, template);
  applyHint(connector, hint);
}

/**
 * Create a new connector between two widgets using template defaults.
 *
 * @param edge - Edge data providing labels and metadata.
 * @param from - Source widget.
 * @param to - Target widget.
 * @param hint - Optional positional hint.
 * @param template - Connector style template.
 * @returns The created connector widget.
 */
export async function createConnector(
  edge: EdgeData,
  from: BaseItem | Group,
  to: BaseItem | Group,
  hint: EdgeHint | undefined,
  template?: ConnectorTemplate,
): Promise<Connector> {
  const connector = await miro.board.createConnector({
    start: { item: from.id, position: hint?.startPosition },
    end: { item: to.id, position: hint?.endPosition },
    shape: template?.shape ?? 'curved',
    captions: buildCaptions(edge, template),
    style: template?.style as ConnectorStyle | undefined,
  });
  await connector.setMetadata(META_KEY, { from: edge.from, to: edge.to });
  return connector;
}
