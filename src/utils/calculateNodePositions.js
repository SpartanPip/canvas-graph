import CanvasGraph from "../components/CanvasGraph";

export const calculateNodePositions = (nodes, edges, expandedWidth, expandedHeight, iterations = 500, nodeSize) => {
  const kRepulsion = 2000; // Repulsion constant
  const kSpring = 0.03; // Spring constant
  const linkLength = nodeSize*8; // Desired length between connected nodes

  // Initialize node positions randomly within expanded bounds
  nodes.forEach((node) => {
    node.x = Math.random() * expandedWidth;
    node.y = Math.random() * expandedHeight;
    node.vx = 0; // Velocity in x
    node.vy = 0; // Velocity in y
  });

  for (let step = 0; step < iterations; step++) {
    // Apply repulsive forces
    for (let i = 0; i < nodes.length; i++) {
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue; // Skip self
        const nodeA = nodes[i];
        const nodeB = nodes[j];

        const dx = nodeA.x - nodeB.x;
        const dy = nodeA.y - nodeB.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 0.01 - 2 * nodeSize; // Avoid division by zero

        // Adjusted repulsive force formula
        const repulsiveForce = kRepulsion / Math.pow(Math.max(distance, 10), 2);

        // Apply repulsive force
        nodeA.vx += (dx / distance) * repulsiveForce;
        nodeA.vy += (dy / distance) * repulsiveForce;
      }
    }

    // Apply attractive forces
    edges.forEach((edge) => {
      const fromNode = nodes.find((node) => node.id === edge.from);
      const toNode = nodes.find((node) => node.id === edge.to);

      const dx = toNode.x - fromNode.x;
      const dy = toNode.y - fromNode.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 0.01; // Avoid division by zero

      const attractiveForce = kSpring * (distance - linkLength);

      // Apply attractive force
      const fx = (dx / distance) * attractiveForce;
      const fy = (dy / distance) * attractiveForce;

      fromNode.vx += fx;
      fromNode.vy += fy;
      toNode.vx -= fx;
      toNode.vy -= fy;
    });

    // Update positions based on velocity
    nodes.forEach((node) => {
      node.x += node.vx;
      node.y += node.vy;

      // Apply friction to reduce velocity over time
      node.vx *= 0.9;
      node.vy *= 0.9;

      // Keep nodes within expanded bounds
      node.x = Math.max(20, Math.min(expandedWidth - 20, node.x));
      node.y = Math.max(20, Math.min(expandedHeight - 20, node.y));
    });
  }

  return nodes;
};
