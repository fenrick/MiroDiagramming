import { COMMANDS } from '../src/ui/pages/tab-definitions';

describe('tab-definitions', () => {
  test('includes edit-metadata command', () => {
    expect(COMMANDS).toContainEqual({
      id: 'edit-metadata',
      label: 'Edit Metadata',
      shortcut: 'Ctrl+Alt+M',
    });
  });
});
