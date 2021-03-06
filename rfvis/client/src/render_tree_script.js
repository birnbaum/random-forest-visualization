/**
 * Utility script for rendering a SVG tree.
 * This is called by the `rfvis cli <forest_json>` command to directly generate SVGs via the command line.
 *
 * USAGE: node render_tree_script.js <options>
 *
 * Where <options> is a escaped JSON which specifies the rendering options including the outpath.
 * The data is fed in via `stdin` and directly written to disc after being processed.
 * */

import fs from "fs";
import path from "path";

import React from "react";
import ReactDOMServer from 'react-dom/server';
import Tree from "./components/Tree";

import createForest from "./utils/parser"

const options = JSON.parse(process.argv[2]);
const outpath = process.argv[3];

process.stdin.resume();
process.stdin.setEncoding('utf8');

const inputChunks = [];
process.stdin.on('data', function (chunk) {
    inputChunks.push(chunk);
});

process.stdin.on('end', () => {
    const forest_content = inputChunks.join("");
    const forest_json = JSON.parse(forest_content);
    const forest = createForest(forest_json);
    forest.trees.forEach((tree, id) => {
        const svg_content = ReactDOMServer.renderToString(
            <Tree returnValidSVG={true}
                  displayNode={tree.baseNode}
                  displayDepth={options.displayDepth}
                  trunkLength={options.trunkLength}
                  branchColor={options.branchColor}
                  leafColor={options.leafColor}
                  width={options.width}
                  height={options.height} />
        );
        const svg_path = path.join(outpath, `tree-${id}.svg`)
        fs.writeFile(svg_path, svg_content, err => {
            if (err) {
                console.error(err);
            } else {
                console.log(`>> Exported "${svg_path}"`)
            }
        });
    });
});
