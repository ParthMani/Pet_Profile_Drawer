declare const cy: any;
declare const describe: any;
declare const beforeEach: any;
declare const it: any;

describe('Pet Profile Happy Path', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('searches for a client, opens drawer, edits weight, and saves', () => {
    cy.get('input[placeholder*="Search"]').type('Sarah');
    cy.contains('Sarah Jenkins').should('be.visible');

    cy.contains('Luna').click();
    cy.contains('Details').should('be.visible');

    cy.contains('Actions').click();
    cy.contains('Edit').click();

    cy.get('input[name="weightKg"]').clear().type('26.75');

    cy.contains('Save Changes').click();

    cy.contains('Pet profile updated successfully').should('be.visible');

    cy.contains('26.75 kg').should('be.visible');
  });
});