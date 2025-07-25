describe("tabs",
  () => {
    test("includes dummy tab in test env",
      () => {
        expect(TAB_DATA.some(t => t[1] === "dummy")).toBe(true);
      });

    test("tab data sorted by order",
      () => {
        const orders = TAB_DATA.map(t => t[0]);
        const sorted = [...orders].sort((a, b) => a - b);
        expect(orders).toEqual(sorted);
      });
  });
