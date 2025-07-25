import { AddressInfo } from "node:net";
import { afterAll, beforeAll, expect, vi } from "vitest";
import { AuthClient, registerCurrentUser } from "../src/user-auth";

let server: Server;
let url: string;

beforeAll(async () => {
    server = http.createServer((req, res) => {
      if (req.method === "POST" && req.url === "/api/users") {
        req.resume();
        res.writeHead(202).end();
        return;
      }
      res.writeHead(404).end();
    });
    await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
    const addr = server.address() as AddressInfo;
    url = `http://127.0.0.1:${addr.port}/api/users`;
  },
  30000);

afterAll(async () => {
  await new Promise<void>(resolve => server.close(() => resolve()));
});

test("registerCurrentUser sends token to server",
  async () => {
    (global as unknown as { miro: unknown }).miro = {
      board: {
        getIdToken: vi.fn().mockResolvedValue("tok"),
        getUserInfo: vi.fn().mockResolvedValue({ id: "u1", name: "Alice" }),
      },
    };
    const client = new AuthClient(url);
    const originalFetch = global.fetch;
    let status = 0;
    global.fetch = async (...args) => {
      const r = await originalFetch(...args);
      status = r.status;
      return r;
    };
    await registerCurrentUser(client);
    expect(status).toBe(202);
    global.fetch = originalFetch;
  });
