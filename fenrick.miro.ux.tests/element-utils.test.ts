import { buildShapeStyle } from '../fenrick.miro.ux/src/board/element-utils';
import { templateManager } from '../fenrick.miro.ux/src/board/templates';

describe('buildShapeStyle', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('merges existing style with template style', () => {
    jest
      .spyOn(templateManager, 'resolveStyle')
      .mockImplementation((style) => style);
    const result = buildShapeStyle(
      { borderWidth: 1 },
      { style: { fillColor: '#fff' } },
    );
    expect(result.borderWidth).toBe(1);
    expect(result.fillColor).toBe('#fff');
  });

  test('applies fill when fillColor missing', () => {
    jest
      .spyOn(templateManager, 'resolveStyle')
      .mockImplementation((style) => style);
    const result = buildShapeStyle(undefined, { fill: '#abc', style: {} });
    expect(result.fillColor).toBe('#abc');
  });
});
