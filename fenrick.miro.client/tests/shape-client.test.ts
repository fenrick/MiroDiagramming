import { beforeEach, expect, vi } from "vitest";
import { ShapeClient ShapeData } from "../src/core/utils/shape-client";

vi.stubGlobal("fetch", vi.fn());

beforeEach(() => (fetch as unknown as vi.Mock).mockReset());

test("createShape sends single payload",
  async () => {
    const api = new ShapeClient("b1", "/api");
    const shape: ShapeData = { shape: "rect", x: 0, y: 0, width: 1, height: 1 };
    await api.createShape(shape);
    expect((fetch as vi.Mock).mock.calls).toHaveLength(1);
    expect(JSON.parse((fetch as vi.Mock).mock.calls[0][1].body))
      .toHaveLength(1);
  });

test("createShapes posts all shapes in one request",
  async () => {
    const api = new ShapeClient("b1", "/api");
    const shapes = Array.from({ length: 25 },
    (_, i) => ({
      shape: "r",
      x: i,
      y: 0,
      width: 1,
      height: 1,
    }));
    await api.createShapes(shapes);
    expect((fetch as vi.Mock).mock.calls).toHaveLength(1);
    expect(JSON.parse((fetch as vi.Mock).mock.calls[0][1].body))
      .toHaveLength(25);
  });

test("updateShape sends PUT request",
  async () => {
    const api = new ShapeClient("b2", "/api");
    const shape: ShapeData = { shape: "rect", x: 0, y: 0, width: 1, height: 1 };
    await api.updateShape("s1", shape);
    const call = (fetch as vi.Mock).mock.calls[0];
    expect(call[0]).toBe("/api/b2/shapes/s1");
    expect(call[1].method).toBe("PUT");
  });

test("deleteShape sends DELETE request",
  async () => {
    const api = new ShapeClient("b3", "/api");
    await api.deleteShape("s2");
    const call = (fetch as vi.Mock).mock.calls[0];
    expect(call[0]).toBe("/api/b3/shapes/s2");
    expect(call[1].method).toBe("DELETE");
  });
