import React, { useState } from "react";
import DirectoryDrop from "./components/DirectoryDrop";
import CanvasGraph from "./components/CanvasGraph";

const App = () => {
    const [graph, setGraph] = useState({ nodes: [], edges: [] });
    const [viewport, setViewport] = useState({
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight,
    });

    // Define expanded area dimensions
    const expandedWidth = viewport.width;
    const expandedHeight = viewport.height;

    return (
      <div style={{ position: "relative", width: "100%", height: "100vh", color: "gray", margin: 0, padding: 0 }}>
          <h1
              style={{
                  textAlign: "center",
                  position: "absolute", // Ensure it layers above the canvas
                  top: "0", // Position it at the top of the screen
                  left: "0",
                  width: "100%", // Span the entire width
                  zIndex: 10, // Render above the canvas
                  backgroundColor: "rgba(0, 0, 0, 0.75)", // Partially transparent black background
                  color: "white", // White text color for contrast
                  padding: "10px 0", // Add vertical padding
                  margin: "0", // Remove any default margin
                  textShadow: "2px 2px 4px black", // Black text shadow for emphasis
                  boxSizing: "border-box", // Include padding in width calculation
              }}
          >
              Drag In Code Directory
              <br />
              <span style={{ fontSize: "16px", color: "lightgray" }}>
                  Viewport: ({viewport.x}, {viewport.y})
              </span>
          </h1>
          <CanvasGraph
              nodes={graph.nodes}
              edges={graph.edges}
              viewport={viewport}
              setViewport={setViewport}
              expandedWidth={expandedWidth}
              expandedHeight={expandedHeight}
          />
          <DirectoryDrop setGraph={setGraph} />
      </div>
  );  
  
};

export default App;
