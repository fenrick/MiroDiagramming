import { miroViewports } from "../.storybook/preview";

describe("storybook viewport configuration",
  () => {
    it("provides a miro viewport",
      () =>
      expect(miroViewports.miro.styles.width).toBe("368px"));

    it("uses the miro viewport by default",
      () =>
      expect(preview.parameters?.viewport?.defaultViewport).toBe("miro"));
  });
