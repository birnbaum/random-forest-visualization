import {branchColor, branchThickness, generateTreeElements, leafColor, leafSize} from "../logic/tree_utils";
import PropTypes from "prop-types";
import React from "react";
import PieChart from "../components/pie/PieChart";


export default class Tree extends React.Component {
    static propTypes = {
        displayNode: PropTypes.any.isRequired,
        displayDepth: PropTypes.number.isRequired,
        trunkLength: PropTypes.number.isRequired,
        branchColor: PropTypes.string.isRequired,
        leafColor: PropTypes.string.isRequired,

        returnValidSVG: PropTypes.bool,

        renderSubtree: PropTypes.func,
        hoverBranch: PropTypes.func,
        hoverLeaf: PropTypes.func,
        hoverBunch: PropTypes.func,
        unhover: PropTypes.func,
    };

    static defaultProps = {
        returnValidSVG: false,
    };

    render() {
        const width = Math.max(500, window.innerWidth - 632);
        const height = Math.max(500, window.innerHeight - 45);

        const {branches, leafs, bunches} = generateTreeElements(
            this.props.displayNode,
            this.props.displayDepth,
            width,
            height,
            this.props.trunkLength,
            0);

        const renderedBranches = branches.map((branch, i) =>
            <line key={i}
                  x1={branch.x}
                  y1={branch.y}
                  x2={branch.x2}
                  y2={branch.y2}
                  style={{
                      strokeWidth: branchThickness(branch, this.props.displayNode.samples),
                      stroke: branchColor(this.props.branchColor, branch),
                  }}
                  onClick={() => this.props.renderSubtree(branch)}
                  onMouseEnter={() => this.props.hoverBranch(branch)}
                  onMouseLeave={this.props.unhover} />
        );

        const renderedLeafs = leafs.map((leaf, i) =>
            <circle key={i}
                    cx={leaf.x}
                    cy={leaf.y}
                    r={leafSize(leaf, this.props.displayNode.samples)}
                    style={{
                        fill: leafColor(this.props.leafColor, leaf),
                    }}
                    onMouseEnter={() => this.props.hoverLeaf(leaf)}
                    onMouseLeave={this.props.unhover} />
        );

        const renderedBunches = bunches.map((bunch, i) =>
            <PieChart key={i}
                      bunch={bunch}
                      radius={leafSize(bunch, this.props.displayNode.samples)}
                      leafColorType={this.props.leafColor} />
        );

        if (this.props.returnValidSVG) {
            return (
                <svg xmlns="http://www.w3.org/2000/svg"
                     version="1.1"
                     width={width}
                     height={height}>
                    {renderedBranches}
                    {renderedLeafs}
                    {renderedBunches}
                </svg>
            );
        } else {
            return (
                <svg className="Tree"
                     style={{
                         width: width + "px",
                         height: height + "px",
                     }}>
                    {renderedBranches}
                    {renderedLeafs}
                    {renderedBunches}
                </svg>
            );
        }
    }
}