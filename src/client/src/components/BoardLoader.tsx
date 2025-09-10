import React, { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../core/utils/api-fetch';
import { Button } from '../ui/components/Button';
import { styled } from '@mirohq/design-system';

const Skeleton = styled('div', {
  backgroundColor: 'var(--colors-gray-200)',
  color: 'transparent',
  height: 'var(--space-250)',
  marginBottom: 'var(--space-100)',
});

interface BoardLoaderProps {
  readonly boardId: string;
}

interface ShapeSnapshot {
  readonly id: string | number;
  readonly [key: string]: unknown;
}

/**
 * Loads cached board shapes while displaying placeholder skeletons.
 */
export function BoardLoader({ boardId }: BoardLoaderProps): JSX.Element {
  const [shapes, setShapes] = useState<ShapeSnapshot[]>([]);
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(true);

  const SkeletonRow = (): JSX.Element => <Skeleton data-testid='skeleton' />;

  const fetchShapes = useCallback(
    async (since: number): Promise<void> => {
      const res = await apiFetch(
        `/api/boards/${boardId}/shapes?since=${since}`,
      );
      if (!res.ok) {
        setShapes([]);
        return;
      }
      const data = (await res.json()) as {
        shapes: ShapeSnapshot[];
        version: number;
      };
      setShapes(data.shapes);
      setVersion(data.version);
    },
    [boardId],
  );

  const load = useCallback(
    async (since: number): Promise<void> => {
      await Promise.all([
        fetchShapes(since),
        new Promise(resolve => setTimeout(resolve, 350)),
      ]);
      setLoading(false);
    },
    [fetchShapes],
  );

  useEffect(() => {
    void load(version);
  }, [load, version]);

  const refresh = async (): Promise<void> => {
    await apiFetch(`/api/boards/${boardId}/shapes/refresh`, { method: 'POST' });
    setLoading(true);
    setVersion(0);
    await load(0);
  };

  if (loading) {
    return (
      <div className='board-loader'>
        {Array.from({ length: 3 }, (_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (shapes.length === 0) {
    return (
      <div className='board-loader'>
        <div>No items yet. Create shapes or import.</div>
        <Button onClick={refresh}>Refresh board</Button>
      </div>
    );
  }

  return (
    <div className='board-loader'>
      <ul>
        {shapes.map(s => (
          <li key={String(s.id)}>{String(s.id)}</li>
        ))}
      </ul>
      <Button onClick={refresh}>Refresh board</Button>
    </div>
  );
}

export default BoardLoader;
