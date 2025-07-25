{
  Frame
}
from;
"@mirohq/websdk-types";
import { BoardBuilder } from "../src/board/board-builder";
import { clearActiveFrame, registerFrame } from "../src/board/frame-utils";

describe("frame-utils",
  () => {
    test("registerFrame creates frame and records it",
      async () => {
        const builder = {
          createFrame: jest.fn().mockResolvedValue({ id: "f" }),
          setFrame: jest.fn(),
        } as unknown as BoardBuilder;
        const list = [] as unknown as Array<Frame>;
        const frame = await registerFrame(
          builder,
          list,
          10,
          20,
          { x: 1, y: 2 },
          "t",
        );
        expect(builder.createFrame).toHaveBeenCalledWith(10, 20, 1, 2, "t");
        expect(frame).toEqual({ id: "f" });
        expect(list).toContain(frame);
      });

    test("clearActiveFrame resets builder state",
      () => {
        const builder = { setFrame: jest.fn() } as unknown as BoardBuilder;
        clearActiveFrame(builder);
        expect(builder.setFrame).toHaveBeenCalledWith(undefined);
      });
  });
