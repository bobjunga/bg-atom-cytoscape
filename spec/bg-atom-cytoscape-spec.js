'use babel';

import BgAtomCytoscape from '../lib/bg-atom-cytoscape';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('BgAtomCytoscape', () => {
  let workspaceElement, activationPromise;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    activationPromise = atom.packages.activatePackage('bg-atom-cytoscape');
  });

  describe('when the bg-atom-cytoscape:toggle event is triggered', () => {
    it('hides and shows the modal panel', () => {
      // Before the activation event the view is not on the DOM, and no panel
      // has been created
      expect(workspaceElement.querySelector('.bg-atom-cytoscape')).not.toExist();

      // This is an activation event, triggering it will cause the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'bg-atom-cytoscape:toggle');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        expect(workspaceElement.querySelector('.bg-atom-cytoscape')).toExist();

        let bgAtomCytoscapeElement = workspaceElement.querySelector('.bg-atom-cytoscape');
        expect(bgAtomCytoscapeElement).toExist();

        let bgAtomCytoscapePanel = atom.workspace.panelForItem(bgAtomCytoscapeElement);
        expect(bgAtomCytoscapePanel.isVisible()).toBe(true);
        atom.commands.dispatch(workspaceElement, 'bg-atom-cytoscape:toggle');
        expect(bgAtomCytoscapePanel.isVisible()).toBe(false);
      });
    });

    it('hides and shows the view', () => {
      // This test shows you an integration test testing at the view level.

      // Attaching the workspaceElement to the DOM is required to allow the
      // `toBeVisible()` matchers to work. Anything testing visibility or focus
      // requires that the workspaceElement is on the DOM. Tests that attach the
      // workspaceElement to the DOM are generally slower than those off DOM.
      jasmine.attachToDOM(workspaceElement);

      expect(workspaceElement.querySelector('.bg-atom-cytoscape')).not.toExist();

      // This is an activation event, triggering it causes the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'bg-atom-cytoscape:toggle');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        // Now we can test for view visibility
        let bgAtomCytoscapeElement = workspaceElement.querySelector('.bg-atom-cytoscape');
        expect(bgAtomCytoscapeElement).toBeVisible();
        atom.commands.dispatch(workspaceElement, 'bg-atom-cytoscape:toggle');
        expect(bgAtomCytoscapeElement).not.toBeVisible();
      });
    });
  });
});
