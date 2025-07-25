{
  LayoutNode
}
from;
"../src/core/layout/elk-preprocessor";
import { prepareForElk } from "../src/core/layout/elk-preprocessor";

describe("prepareForElk",
  () => {
    test("assigns algorithm and inserts spacer",
      () => {
        const root: LayoutNode = { id: "r", children: [{ id: "c" }] };
        prepareForElk(root, 10, 50);
        expect(root.layoutOptions?.["elk.algorithm"]).toBe(
          "org.eclipse.elk.rectpacking",
        );
        expect(root.children?.[0].id).toBe("spacer_r");
        expect(root.children).toHaveLength(2);
      });

    test("avoids duplicate spacers",
      () => {
        const root: LayoutNode = {
          id: "r",
          children: [
            {
              id: "spacer_r",
              width: 50,
              height: 10,
              properties: { invisible: true },
            },
            { id: "c" },
          ],
        };
        prepareForElk(root, 10, 50);
        const spacerCount =
          root.children?.filter(n => n.id === "spacer_r").length;
        expect(spacerCount).toBe(1);
      });

    test("recurses into nested children",
      () => {
        const root: LayoutNode = {
          id: "r",
          children: [{ id: "p", children: [{ id: "c" }] }],
        };
        prepareForElk(root);
        const parent = root.children?.find(n => n.id === "p") as LayoutNode;
        expect(parent.layoutOptions?.["elk.algorithm"]).toBe(
          "org.eclipse.elk.rectpacking",
        );
        expect(parent.children?.[0].id).toBe("spacer_p");
      });

    test("uses parent width when available",
      () => {
        const root: LayoutNode =
          { id: "r", width: 80, children: [{ id: "c" }] };
        prepareForElk(root, 10, 50);
        const spacer = root.children?.[0] as LayoutNode;
        expect(spacer.width).toBe(80);
      });
  });
