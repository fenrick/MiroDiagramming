import type {
  BaseItem,
  Connector,
  ConnectorStyle,
  Group,
  TextAlignVertical,
} from '@mirohq/websdk-types'

import type { EdgeData, EdgeHint } from '../core/graph'

import type { ConnectorTemplate } from './templates'

/**
 * Build caption objects for a connector label.
 *
 * When an edge provides a label the template caption settings are applied
 * to the returned object. The position and vertical alignment values are
 * optional and omitted when not present on the template.
 *
 * @param edge - Edge data potentially containing a `label`.
 * @param template - Connector template describing caption defaults.
 * @returns The caption array expected by the Miro SDK or `undefined` when
 *   the edge has no label.
 */
function buildCaptions(edge: EdgeData, template?: ConnectorTemplate): Connector['captions'] {
  const meta = edge.metadata as
    | { caption?: unknown; captions?: unknown; label?: unknown }
    | undefined

  const fromMetaSingle =
    (typeof meta?.caption === 'string' && meta?.caption) ||
    (typeof meta?.label === 'string' && meta?.label)

  // Prefer explicit captions array if provided in metadata
  const fromMetaArray = Array.isArray(meta?.captions) ? (meta?.captions as unknown[]) : undefined

  let captions: Connector['captions'] | undefined

  if (fromMetaArray) {
    // Accept [string] or [{ content, position?, textAlignVertical? }]
    const mapped = fromMetaArray
      .map((c) => {
        if (typeof c === 'string') {
          return { content: c }
        }
        if (
          c &&
          typeof c === 'object' &&
          typeof (c as { content?: unknown }).content === 'string'
        ) {
          const obj = c as {
            content: string
            position?: number
            textAlignVertical?: TextAlignVertical
          }
          return {
            content: obj.content,
            position: obj.position,
            textAlignVertical: obj.textAlignVertical as TextAlignVertical,
          }
        }
        return undefined
      })
      .filter(Boolean) as NonNullable<Connector['captions']>
    captions = mapped.length ? mapped : undefined
  } else {
    const text = (typeof edge.label === 'string' && edge.label) || fromMetaSingle
    if (typeof text === 'string' && text.trim()) {
      captions = [
        {
          content: text,
          position: template?.caption?.position,
          textAlignVertical: template?.caption?.textAlignVertical as TextAlignVertical,
        },
      ]
    }
  }

  return captions
}

function mergeStyle(connector: Connector, template?: ConnectorTemplate): void {
  if (template?.style) {
    connector.style = {
      ...connector.style,
      ...template.style,
    } as ConnectorStyle
  }
  connector.shape = template?.shape ?? connector.shape
}

function applyHint(connector: Connector, hint?: EdgeHint): void {
  if (hint?.startPosition) {
    connector.start = {
      ...(connector.start ?? {}),
      position: hint.startPosition,
    } as Connector['start']
  }
  if (hint?.endPosition) {
    connector.end = {
      ...(connector.end ?? {}),
      position: hint.endPosition,
    } as Connector['end']
  }
}

/**
 * Update an existing connector with style, label and positional data.
 *
 * The connector's current style is merged with the template while label
 * captions are created when the edge specifies one. Start and end positions
 * are adjusted using the optional hint parameter.
 *
 * @param connector - The connector widget to update in place.
 * @param edge - Edge data providing label and metadata.
 * @param template - Connector template describing style defaults.
 * @param hint - Optional hint for start and end positions.
 */
export function updateConnector(
  connector: Connector,
  edge: EdgeData,
  template?: ConnectorTemplate,
  hint?: EdgeHint,
): void {
  const captions = buildCaptions(edge, template)
  if (captions) {
    connector.captions = captions
  }
  mergeStyle(connector, template)
  applyHint(connector, hint)
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
  const captions = buildCaptions(edge, template)
  const payload: Record<string, unknown> = {
    start: { item: from.id, position: hint?.startPosition },
    end: { item: to.id, position: hint?.endPosition },
    shape: template?.shape ?? 'curved',
    style: template?.style as ConnectorStyle | undefined,
  }
  if (captions) {
    payload.captions = captions
  }
  const connector = (await miro.board.createConnector(payload)) as Connector
  return connector
}
