import { useCallback, useEffect, useMemo, useState } from 'react';
import { ShapeClient, type ShapeSnapshot } from '../core/utils/shape-client';

const SKELETON_MS = 350;

interface BoardLoaderProps {
  /** Identifier of the board to load. */
  boardId: string;
}

/**
 * Load cached shapes for a board with a brief skeleton placeholder.
 *
 * Shapes are retrieved from the server cache so the vendor is never
 * contacted unless the user explicitly refreshes. A skeleton of grey
 * boxes is shown for a short period before rendering the cached snapshot.
 */
export function BoardLoader({ boardId }: BoardLoaderProps): JSX.Element {
  const [snapshot, setSnapshot] = useState<ShapeSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const client = useMemo(() => new ShapeClient(boardId), [boardId]);

  const load = useCallback(
    async (refresh = false) => {
      const snap = await client.getShapes(snapshot?.version, refresh);
      setSnapshot(snap);
    },
    [client, snapshot?.version],
  );

  const hydrate = useCallback(
    async (refresh = false) => {
      setLoading(true);
      await load(refresh);
      setTimeout(() => setLoading(false), SKELETON_MS);
    },
    [load],
  );

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (loading) {
    return (
      <div data-testid='skeleton'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            style={{ width: 80, height: 40, background: '#eee', margin: 4 }}
          />
        ))}
      </div>
    );
  }

  const shapes = snapshot?.shapes ?? [];

  return (
    <div>
      <button
        type='button'
        onClick={() => void hydrate(true)}>
        Refresh board
      </button>
      {shapes.length === 0 ? (
        <div>No items yet. Create shapes or import.</div>
      ) : (
        <ul>
          {shapes.map((s, i) => (
            <li key={(s as { id?: string }).id ?? String(i)}>
              {(s as { text?: string }).text ??
                (s as { id?: string }).id ??
                'shape'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
