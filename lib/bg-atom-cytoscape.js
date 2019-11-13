'use babel';

import BgAtomCytoscapeView from './bg-atom-cytoscape-view';
import { CompositeDisposable } from 'atom';

export default {

  bgAtomCytoscapeView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.bgAtomCytoscapeView = new BgAtomCytoscapeView(state.bgAtomCytoscapeViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.bgAtomCytoscapeView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'bg-atom-cytoscape:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.bgAtomCytoscapeView.destroy();
  },

  serialize() {
    return {
      bgAtomCytoscapeViewState: this.bgAtomCytoscapeView.serialize()
    };
  },

  toggle() {
    console.log('BgAtomCytoscape was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
