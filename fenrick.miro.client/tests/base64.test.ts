import { decodeBase64, encodeBase64 } from "../src/core/utils/base64";

function expected(input: string): string {
  return Buffer.from(input, "utf8")
    .toString("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

describe("encodeBase64",
  () =>
  test.each([
    "hello",
    "https://миру",
    "https://example.com/тест+file/?q=a/b+c",
  ])("encodes %s", value => expect(encodeBase64(value)).toBe(expected(value))));

describe("decodeBase64",
  () =>
  test.each(["hello", "привет"])("round trip %s",
    value => {
      const encoded = encodeBase64(value);
      expect(decodeBase64(encoded)).toBe(value);
    }));
