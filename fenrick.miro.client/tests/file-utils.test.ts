import { fileUtils } from "../src/core/utils/file-utils";

interface ReaderEvent {
  target: { result?: string | null } | null;
}

describe("file utils",
  () => {
    afterEach(() => {
      jest.restoreAllMocks();
      delete (global as { FileReader?: unknown }).FileReader;
    });

    test("readFileAsText uses text method when available",
      async () => {
        const file = {
          name: "file.txt",
          text: jest.fn().mockResolvedValue("abc"),
        } as unknown as File;
        const result = await fileUtils.readFileAsText(file);
        expect(result).toBe("abc");
        expect(file.text).toHaveBeenCalled();
      });

    test("readFileAsText falls back to FileReader",
      async () => {
        class FR {
          onload: ((e: ReaderEvent) => void) | null = null;
          onerror: (() => void) | null = null;

          readAsText() {
            if (this.onload) {
              const evt = { target: { result: "def" } } as ReaderEvent;
              this.onload(evt);
            }
          }
        }

        (global as { FileReader?: unknown }).FileReader = FR;
        const result = await fileUtils.readFileAsText({
          name: "f.txt",
        } as unknown as File);
        expect(result).toBe("def");
      });

    test("validateFile throws on invalid object",
      () =>
      expect(() => fileUtils.validateFile(null as unknown as File)).toThrow(
        "Invalid file",
      ));
  });
