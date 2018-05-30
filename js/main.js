"use strict";

// Tree configuration
const da = 0.4; // Angle delta
const dl = 0.85; // Length delta (factor)
const maxDepth = 45;

let totalSamples = null;
const forest = loadForest();  // On load, construct the node structure
let treeId = 0;

function loadForest() {
    // Here is the only point we access the hacky global variable FOREST
    FOREST.trees.forEach(tree => transformNodesInPlace(tree))
    return FOREST;
}

/**
 * Messy function for transforming the list of node parameters to an actual tree data structure
 * @param {*} tree 
 */
function transformNodesInPlace(tree) {

	const baseNode = new Node(...tree.nodes[0]);
	totalSamples = baseNode.samples;
    let stack = [baseNode];

    for (let nodeParameters of tree.nodes.slice(1)) {
        // console.log(nodeParameters[0], "X".repeat(stack.length))
        let latest = stack[stack.length - 1];
        const node = new Node(...nodeParameters);
	
        if (node.height === latest.height + 1) {  // Child Node
            // Do nothing
        } else if (node.height === latest.height) {  // Sibling Node
            stack.pop();
        } else if (node.height < latest.height) {
            stack = stack.slice(0, node.height)
        } else {
            throw "No no no no no"
        }
        
        latest = stack[stack.length - 1];
        latest.add(node);
        stack.push(node);
    }

    // Modify object inplace
    delete tree.nodes;
    tree.baseNode = baseNode;
}

// Tree creation functions
function generateBranches(tree) {
	const branches = [];

	// recursive function that adds branch objects to "branches"
	function branch(node) {
		if (node.depth === maxDepth) return;
		
		const end = endPt(node);
		branches.push(node.toBranch());
		
		if (node.children.length === 0) return;

		let leftChild, rightChild;
		leftChild = node.children[0];
		rightChild = node.children[1];

		// Strategy for always drawing the mightier branch towards the sky
		/*
		const firstBiggerThanSecond = (node.children[0].samples / node.samples) >= 0.5;
		const leftBound = node.angle < 0;
		if (firstBiggerThanSecond && leftBound) {
			leftChild = node.children[1];
			rightChild = node.children[0];
		} else if (!firstBiggerThanSecond && leftBound) {
			leftChild = node.children[0];
			rightChild = node.children[1];
		} else if (firstBiggerThanSecond && !leftBound) {
			leftChild = node.children[0];
			rightChild = node.children[1];
		} else {
			leftChild = node.children[1];
			rightChild = node.children[0];
		}*/

		if (leftChild !== undefined) {
			leftChild.branchify(branches.length, end.x, end.y, node.angle - da, node.length * dl, node.depth + 1, node.index);
			branch(leftChild);
		}
		if (rightChild !== undefined) {
			rightChild.branchify(branches.length, end.x, end.y, node.angle + da, node.length * dl, node.depth + 1, node.index);
			branch(rightChild);
		}
	}
	// Start parameters: Index=0; starting point at 500,600 (middle of bottom line); 0° angle; 100px long; no parent branch
	tree.baseNode.branchify(0, 500, 800, 0, 100, 0, null)
	branch(tree.baseNode);

	return branches;
}

function endPt(b) {
	// Return endpoint of branch
	const x = b.x + b.length * Math.sin( b.angle );
	const y = b.y - b.length * Math.cos( b.angle );
	return {x: x, y: y};
}

/*
function highlightParents(d) {  
	const colour = d3.event.type === 'mouseover' ? 'green' : color(d.d);
	const depth = d.d;
	for(const i = 0; i <= depth; i++) {
		d3.select('#id-'+parseInt(d.i)).style('stroke', colour);
		d = branches[d.parent];
	}	
}*/
	
	// Linear scale that maps impurity values from 0 to 1 to colors from "green" to "brown"
const impurityColor = d3.scaleLinear()
	.domain([0, 1])
	.range(["green", "brown"]);

// Linear scale that maps the number of samples in a branch to a certain number of pixels
const thickness = d3.scaleLinear()
	.domain([1, totalSamples])
	.range([1, 15]);

// ------------------------------- //
// This is where the magic happens //
// ------------------------------- //
function drawTree(update=false) {
	const tree = forest.trees[treeId];
	const branches = generateBranches(tree);
	
	// Clear previous tree
	if (update) d3.select('#tree').selectAll('line').remove();

	d3.select('#tree')
		.selectAll('line')
		.data(branches)  // This is where we feed the data to the visualization
		.enter()
		.append('line')
		.attr('x1', d => d.x)
		.attr('y1', d => d.y)
		.attr('x2', d => endPt(d).x)
		.attr('y2', d => endPt(d).y)
		.style('stroke-width', d => thickness(d.samples) + 'px')
		.style('stroke', d => impurityColor(d.impurity))
		.attr('id', d => 'id-' + d.index);  // This attr is currently not used

	d3.select("#tree").append("image")
		.attr("xlink:href","images/leaf.svg")
		.attr("width", 100)
		.attr("height", 100)
}



d3.selectAll('.next').on('click', () => {
	if (treeId === forest.trees.length-1) return alert("Last");
	treeId++;
	drawTree(true);
});

d3.selectAll('.previous').on('click', () => {
	if (treeId === 0) return alert("First");
	treeId--;
	drawTree(true);
});

drawTree();