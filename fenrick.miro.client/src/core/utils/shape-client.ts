/** Data describing a Miro shape widget. */
import { apiFetch } from './api-fetch';

export interface ShapeData {
  shape: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  text?: string;
  style?: Record<string, unknown>;
}

/**
 * Minimal HTTP client for the shapes API. The server performs
 * any necessary chunking when forwarding to Miro.
 * TODO: add shims for additional board endpoints so the client relies solely on
 *       this API layer.
 * TODO: align with a typed .NET client on the server side once a suitable
 *       library or code generator is chosen.
 */
export class ShapeClient {
  public constructor(
    private readonly boardId: string,
    private readonly baseUrl = '/api/boards',
  ) {}

  private get url(): string {
    return `${this.baseUrl}/${this.boardId}/shapes`;
  }

  /**
   * Create a single shape widget.
   *
   * @param shape - Shape definition.
   * @returns The created shape description.
   */
  public async createShape(
    shape: ShapeData,
  ): Promise<Record<string, unknown> | undefined> {
    const res = await this.createShapes([shape]);
    return res[0];
  }

  /**
   * Create multiple shapes in one request.
   *
   * @param shapes - Shape definitions to create.
   * @returns Created shape descriptions.
   */
  public async createShapes(
    shapes: ShapeData[],
  ): Promise<Record<string, unknown>[]> {
    if (typeof fetch !== 'function') {
      return [];
    }
    const res = await apiFetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shapes),
    });
    const data = (await res.json()) as Array<{ body: string }>;
    return data.map(r => JSON.parse(r.body) as Record<string, unknown>);
  }

  /** Update an existing shape. */
  public async updateShape(id: string, shape: ShapeData): Promise<void> {
    if (typeof fetch !== 'function') {
      return;
    }
    await apiFetch(`${this.url}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shape),
    });
  }

  /** Delete a shape widget from the board. */
  public async deleteShape(id: string): Promise<void> {
    if (typeof fetch !== 'function') {
      return;
    }
    await apiFetch(`${this.url}/${id}`, { method: 'DELETE' });
  }

  /** Retrieve a shape widget by identifier. */
  public async getShape(
    id: string,
  ): Promise<Record<string, unknown> | undefined> {
    if (typeof fetch !== 'function') {
      return undefined;
    }
    const res = await apiFetch(`${this.url}/${id}`);
    if (!res.ok) {
      return undefined;
    }
    return (await res.json()) as Record<string, unknown>;
  }
}
