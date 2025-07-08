import '@testing-library/cypress/add-commands';
import 'cypress-axe';

Cypress.Commands.add('undo', () => {
  cy.window().then((w) => {
    w.dispatchEvent(new KeyboardEvent('keydown', { metaKey: true, key: 'z' }));
  });
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      undo(): Chainable<void>;
    }
  }
}
