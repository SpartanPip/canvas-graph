class NodeInteractionManager {
    constructor(nodes, edges) {
        this.nodes = nodes; // Array of nodes with x, y, size (radius), and id
        this.edges = edges; // Array of edges with { from, to } structure
        this.activeNodes = []; // List of currently active nodes
        this.adjacentNodes = []; // List of adjacent nodes
    }

    // Check if the cursor is over a node
    isCursorOverNode(cursorX, cursorY, node) {
        const dx = cursorX - node.x;
        const dy = cursorY - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= node.size; // True if the cursor is within the node radius
    }

    // Update active and adjacent nodes based on cursor position
    updateCursorPosition(cursorX, cursorY) {
        let foundActiveNode = null;

        // Check for active nodes
        for (const node of this.nodes) {
            if (this.isCursorOverNode(cursorX, cursorY, node)) {
                foundActiveNode = node;
                break;
            }
        }

        // If a node is found, update active and adjacent nodes
        if (foundActiveNode) {
            if (this.activeNodes.length === 0 || this.activeNodes[0] !== foundActiveNode) {
                // Update active nodes
                this.activeNodes = [foundActiveNode];

                // Update adjacent nodes
                const neighbors = this.edges
                    .filter((edge) => edge.from === foundActiveNode.id || edge.to === foundActiveNode.id)
                    .map((edge) => {
                        const neighborId = edge.from === foundActiveNode.id ? edge.to : edge.from;
                        return this.nodes.find((node) => node.id === neighborId);
                    })
                    .filter(Boolean); // Remove any undefined nodes

                this.adjacentNodes = neighbors;
            }
        } else {
            // Clear lists if no active node
            this.activeNodes = [];
            this.adjacentNodes = [];
        }
    }
}

export default NodeInteractionManager;
