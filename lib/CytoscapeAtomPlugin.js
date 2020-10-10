import path from 'path';
import { CytoscapeView } from './CytoscapeView';
import { BGAtomPlugin }  from 'bg-atom-utils'


// Main Atom Plugin Class
// Class for bg-atom-cytoscape Atom plugin
// This registers an openner for graph network data files that will be opened with cytoscape.js
export class CytoscapeAtomPlugin extends BGAtomPlugin {
	constructor(state) {
		super('bg-atom-cytoscape', state, __filename);
	}

	onURIOpening(uri) {
		if (path.extname(uri) == '.cyjs')
			return new CytoscapeView(uri, this);
	}
};

export default BGAtomPlugin.Export(CytoscapeAtomPlugin);
