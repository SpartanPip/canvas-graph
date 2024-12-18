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
    const expandedWidth = viewport.width * 3;
    const expandedHeight = viewport.height * 3;

    return (
        <div style={{ position: "relative", width: "100%", height: "100vh"}}>
            <h1 style={{ textAlign: "center" }}>
                Drag In Code Directory
                <br />
                <span style={{ fontSize: "16px", color: "black" }}>
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
