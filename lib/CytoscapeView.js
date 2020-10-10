
import JSON5 from 'json5';
import fs from 'fs';
import path from 'path';
import util from 'util';
import querystring from 'querystring';
import _ from 'lodash';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import cola from 'cytoscape-cola';
import coseBilkent from 'cytoscape-cose-bilkent';
import { el, mount, setChildren } from 'redom';
import * as bgdom from 'bg-dom';
import { BGAtomView } from 'bg-atom-utils'
import { sprintf } from 'sprintf-js'



// This class is the editor pane that opens on a graph network data file. Its created by the workspace.opener callback registered
// in the <plugin>.activate method when the file being opened is recognized to be a graph network data file.
// It uses cytoscape.js to render the graph network.
export class CytoscapeView extends BGAtomView {
	constructor(uri,plugin) {
		super(uri, plugin, {defaultLocation: 'right',allowedLocations: ['left', 'right', 'bottom']}, '$div.bg-atom-cytoscape');
		this.filename = path.basename(this.uri);
		this.dirname = path.dirname(this.uri);
		this.saveFilename = this.uri;
		if (this.uri.lastIndexOf('.withPos.') == -1)
			this.saveFilename = this.uri.substr(0, this.uri.lastIndexOf('.')) + '.withPos.bgDeps';

		this.title = this.filename || 'cytoscape';

		// Create a control bar across the top
		this.mount([
			new bgdom.Panel({
				name:'cntrPanel',
				content: [
					new bgdom.Button(        "btnEditTxt:Edit Text",   () => {this.onOpenInTextEditor()}),
					new bgdom.Button(        "btnRerun:Re-run Layout", () => {this.runLayout()}),
				//	new bgdom.LayoutSelector(                   (filename) => {this.applyLayout(filename)}),
					new bgdom.Button(        "btnReset:Reset",         () => {this.resetGraph()}),
					new bgdom.Button(        "btnEdgesOn:Edges On",    () => {this.showElements(this.cy.edges())}),
					new bgdom.Button(        "btnEdgesOff:Edges Off",  () => {this.hideElements(this.cy.edges())}),

					new bgdom.Component("nodeClickToolDetails:div")
				]
			}),
			new bgdom.Component('cytoDiv:$div#cy.atom-cyto-view')
		]);

		// this.nodeClickToolBar = new bgdom.MutexToolGroup(
		// 	"nodeClickToolBar",
		// 	(selectedTool) => {this.onToolChanged(selectedTool)},
		// 	[	{id: "togEdges",    label: "In/Out Edges"},
		// 		{id: "togEdgesOut", label: "Out Edges"},
		// 		{id: "togEdgesIn",  label: "In Edges"},
		// 		{id: "nodeDetails", label: "Node Details"},
		//
		//
		// 	],
		// 	"togEdges"
		// );
		// this.cntrPanel.add(el("br"));
		// this.cntrPanel.add(el("label", {for: this.nodeClickToolBar.name}, "Click Tools"));
		// this.cntrPanel.add(this.nodeClickToolBar);


		// TODO: add config option to enable more layout extensions
		cytoscape.use( fcose );
		cytoscape.use( cola );
		cytoscape.use( coseBilkent );
	}

	onToolChanged(selectedTool) {
		console.log("selected node click tool changed to '"+selectedTool+"'  '"+this.nodeClickToolBar.value+"'");
		setChildren(this.cntrPanel.nodeClickToolDetails, []);
		switch(this.nodeClickToolBar.value) {
			case "togEdges":
				this.cntrPanel.nodeClickToolDetails.textContent = "Click on a node to toggle all of its edges going in and out ";
				break;
			case "togEdgesOut":
				this.cntrPanel.nodeClickToolDetails.textContent = "Click on a node to toggle all of its edges coming out ";
				break;
			case "togEdgesIn":
				this.cntrPanel.nodeClickToolDetails.textContent = "Click on a node to toggle all of its edges going in ";
				break;
			case "layout":
				this.cntrPanel.nodeClickToolDetails.textContent = "Click on a file or project to layout its contents ";
				break;
			case "nodeDetails":
				this.cntrPanel.nodeClickToolDetails.textContent = "Click on a node to see its details";
				break;
			default:
		}
		this.cy.resize();
	}

	onNodeClick(e) {
		switch(this.nodeClickToolBar.value) {
			case "togEdges":
				this.showNeighbors(e.target);
				break;
			case "togEdgesOut":
				this.showNeighbors(e.target, "out");
				break;
			case "togEdgesIn":
				this.showNeighbors(e.target, "in");
				break;

			case "nodeDetails":
				this.cntrPanel.nodeClickToolDetails.textContent = "";
				var absPos = e.target.position();
				var relPos = e.target.relativePosition();
				var dim = e.target.layoutDimensions();
				setChildren(this.cntrPanel.nodeClickToolDetails, [
					el("div", "Name: "+e.target.id()),
					el("div", "Type: "+e.target.data('nodeType')),
					el("div", "Classes: "+e.target.classes()),
					el("div", sprintf("position: (%d,%.0f) rel(%.0f,%.0f) size(%.0f,%.0f)", absPos.x,absPos.y, relPos.x,relPos.y, dim.w,dim.h)),
				])
				this.cy.resize();
				//this.cy.mount(this.cy.container());
				// mount(this.cntrPanel.nodeClickToolDetails,
				// 	el("div", "abs pos: ("+absPos.x+","+absPos.y+")")
				// );
				// 	el("div", "rel pos: ("+relPos.x+","+relPos.y+")"),
				// 	el("div", "dim: ("+dim.w+","+dim.h+")"),
				// ])
				break;
			default:
		}
	}

	runLayout(layoutInfo) {
		if (this.cyLayout)
			this.cyLayout.run();
	}

	applyLayout(layoutConfigFile) {
		fs.readFile(layoutConfigFile, (err, fileContents) => {
			try {
				if (err)
					throw err;
				console.log("applying layout from '"+layoutConfigFile+"'");
				layoutInfo=JSON5.parse(fileContents.toString());
				this.cyLayout = this.cy.layout(layoutInfo);
				this.cyLayout.run();
				console.log("applied layout");
			} catch(e) {
				console.error(e);
				this.showError(e);
			}
		});
	}















































	resetGraph() {
		console.log("resetGraph: showing all");
		this.cy.elements().removeClass('hidden');
	}

	hideElements(eles) {
		if (!eles)
			eles = this.cy.$(':selected');
		if (eles) {
			console.log("hideElements: hiding "+eles.size()+" elements");
			eles.addClass('hidden');
		}
	}

	showElements(eles) {
		if (!eles)
			eles = this.cy.$(':selected');
		if (eles) {
			console.log("showElements: showing "+eles.size()+" elements");
			eles.removeClass('hidden');
		}
	}

	toggleElements(eles) {
		if (!eles) {
			eles = this.cy.$(':selected');
			console.log("toggleElements: operating on "+eles.size()+" selected elements");
		}

		if (!eles) {
			console.log("toggleElements: showing all");
			this.cy.elements().removeClass('hidden');
		} else {
			if (eles.filter(".hidden").size() > 0) {
				console.log("toggleElements: showing "+eles.size()+" elements");
				eles.removeClass('hidden');
			} else {
				console.log("toggleElements: hiding "+eles.size()+" elements");
				eles.addClass('hidden');
			}
		}
	}

	showNeighbors(node, edgeType) {
		var nodeID = node.id();
		console.log("toggling neighbors of " + nodeID);
		var nodeGrp = node.or(node.descendants());
		switch (edgeType) {
			case "in":
				this.toggleElements(nodeGrp.incomers('edge'));
				break;
			case "out":
				this.toggleElements(nodeGrp.outgoers('edge'));
				break;
			default:
				this.toggleElements( nodeGrp.neighborhood('edge'));
				break;
		}
	}


	save() {
		console.log('CytoscapeView save '+this.saveFilename);
		fs.writeFile(this.saveFilename, JSON.stringify(this.cy.json(),null,4), (err) => {
		  if (err) showError(err);
		  console.log('The file has been saved!');
		});
	}

	saveAs() {
		console.log('CytoscapeView saveAs');
	}


	showError(err) {
		if (!err) {
			this.errorBar.innerText = "";
		} else {
			this.errorBar.innerText = err.toString();
		}
	}

	getPath ()   {return this.dirname;}


	onOpenInTextEditor() {
		atom.workspace.open(this.uri+"?editor=text");
		console.log("open in text editor");
	}


	// load the file and init cyto
	// cytoscape can not be initialized before the DIV that it uses is realized in the DOM and therefore has a non-zero size.
	// atom does not seem to fire any event after it adds the view object returned by the opener callback to the DOM so this
	// onLoad event is currently being generated by a trick with a temporary iframe using postMessage to let us know when its loaded.
	onDomReady() {

		try {
			this.cy = cytoscape({
				container : this.cytoDiv,
			});

		} catch(e) {
			console.error(e);
			this.showError(e);
		}

		fs.readFile(this.uri, (err, fileContents) => {
			if (err) {
				console.error(err);
				return;
			}
			try {
				data=JSON5.parse(fileContents.toString());
				this.cy.json(data);
				console.log("added data to cyto");

				this.hideElements(this.cy.edges());

				this.cy.nodes().on('vclick', (e) => {if (e.seen) return; e.seen=true; this.onNodeClick(e)});
			} catch(e) {
				console.error(e);
				this.showError(e);
			}
		});
	}
}
