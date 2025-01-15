import React, { memo, useEffect, useRef, useState, useMemo, useCallback } from "react";
import { calculateNodePositions } from "../utils/calculateNodePositions";
import NodeInteractionManager from "../utils/nodeInteractionManager"; // Import NodeInteractionManager

const CanvasGraph = ({ nodes = [], edges = [], viewport, setViewport, expandedWidth, expandedHeight }) => {
    const canvasRef = useRef(null);
    const positionedNodesRef = useRef([]); // UseRef to store node positions
    const edgesRef = useRef(edges);
    const nodeSize = 20;

    // Instantiate the NodeInteractionManager
    const interactionManager = useMemo(() => new NodeInteractionManager(nodes, edgesRef.current, nodeSize), []);

    const cursorPosition = useRef({ x: 0, y: 0 }); // Store the current cursor position

    // Use a ref to store the current viewport value
    const viewportRef = useRef(viewport);

    // Update the ref every time viewport changes
    useEffect(() => {
        viewportRef.current = viewport;
    }, [viewport]);

    const draw = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
    
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
    
        // --- Draw edges ---
        edgesRef.current.forEach((edge) => {
            const fromNode = positionedNodesRef.current.find((node) => node.id === edge.from);
            const toNode = positionedNodesRef.current.find((node) => node.id === edge.to);
    
            if (fromNode && toNode) {
                // Adjust node positions relative to the viewportRef.current
                const fromX = fromNode.x - viewportRef.current.x;
                const fromY = fromNode.y - viewportRef.current.y;
                const toX = toNode.x - viewportRef.current.x;
                const toY = toNode.y - viewportRef.current.y;
    
                // Draw the edge
                ctx.beginPath();
                ctx.moveTo(fromX, fromY);
                ctx.lineTo(toX, toY);
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#2c3e50";
                ctx.stroke();
            }
        });
    
        // --- Draw nodes ---
        positionedNodesRef.current.forEach((node) => {
            // Adjust node position relative to the viewportRef.current
            const adjustedX = node.x - viewportRef.current.x;
            const adjustedY = node.y - viewportRef.current.y;
    
            // Only draw nodes that are within the viewportRef.current
            if (
                adjustedX >= 0 &&
                adjustedX <= viewportRef.current.width &&
                adjustedY >= 0 &&
                adjustedY <= viewportRef.current.height &&
                !interactionManager.activeNodes.includes(node) &&
                !interactionManager.adjacentNodes.includes(node)
            ) {
                // Draw the node
                ctx.beginPath();
                ctx.arc(adjustedX, adjustedY, nodeSize, 0, Math.PI * 2);
                ctx.fillStyle = "#3498db"; // Default node color
                ctx.fill();
                ctx.strokeStyle = "#2c3e50";
                ctx.lineWidth = 2;
                ctx.stroke();
    
                // Draw the node label
                ctx.fillStyle = "#fff";
                ctx.font = "12px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(node.label || node.id, adjustedX, adjustedY - nodeSize - 5);
            }
        });
    
        // --- Draw adjacent nodes ---
        interactionManager.adjacentNodes.forEach((node) => {
            const adjustedX = node.x - viewportRef.current.x;
            const adjustedY = node.y - viewportRef.current.y;
    
            if (
                adjustedX >= 0 &&
                adjustedX <= viewportRef.current.width &&
                adjustedY >= 0 &&
                adjustedY <= viewportRef.current.height
            ) {
                // Draw adjacent nodes
                ctx.beginPath();
                ctx.arc(adjustedX, adjustedY, nodeSize, 0, Math.PI * 2);
                ctx.fillStyle = "#02e0bf"; // Lighter blue for adjacent nodes
                ctx.fill();
                ctx.strokeStyle = "#2c3e50";
                ctx.lineWidth = 2;
                ctx.stroke();
    
                // Draw the label for adjacent nodes
                ctx.fillStyle = "#fff";
                ctx.font = "bold 12px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(node.label || node.id, adjustedX, adjustedY - nodeSize - 5);
            }
        });
    
        // --- Draw active nodes ---
        interactionManager.activeNodes.forEach((node) => {
            const adjustedX = node.x - viewportRef.current.x;
            const adjustedY = node.y - viewportRef.current.y;
    
            if (
                adjustedX >= 0 &&
                adjustedX <= viewportRef.current.width &&
                adjustedY >= 0 &&
                adjustedY <= viewportRef.current.height
            ) {
                // Draw active nodes
                ctx.beginPath();
                ctx.arc(adjustedX, adjustedY, nodeSize, 0, Math.PI * 2);
                ctx.fillStyle = "#ffffff"; // White for active nodes
                ctx.fill();
                ctx.strokeStyle = "#2c3e50";
                ctx.lineWidth = 2;
                ctx.stroke();
    
                // Draw the label for active nodes
                ctx.fillStyle = "#fff";
                ctx.font = "bold 12px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(node.label || node.id, adjustedX, adjustedY - nodeSize - 5);
            }
        });
    
        ctx.restore();
    };
    

    const updateCursorPosition = () => {
        interactionManager.updateCursorPosition(cursorPosition.current.x, cursorPosition.current.y);
        draw();
        requestAnimationFrame(updateCursorPosition); // Continuously update
    };

    const handleMouseMove = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        cursorPosition.current = {
            x: e.clientX - rect.left + viewport.x,
            y: e.clientY - rect.top + viewport.y,
        };
    };

    const handleKeyDown = (e) => {
        e.preventDefault();

        console.log("Key pressed:", e.key);
        console.log("Old viewport:", viewportRef.current);

        const scrollAmount = 20;
        let newViewport = { ...viewportRef.current };

        switch (e.key) {
            case "ArrowUp":
                newViewport.y = Math.max(0, newViewport.y - scrollAmount);
                break;
            case "ArrowDown":
                newViewport.y = Math.min(expandedHeight - viewport.height, newViewport.y + scrollAmount);
                break;
            case "ArrowLeft":
                newViewport.x = Math.max(0, newViewport.x - scrollAmount);
                break;
            case "ArrowRight":
                newViewport.x = Math.min(expandedWidth - viewport.width, newViewport.x + scrollAmount);
                break;
        }

        console.log("New viewport:", newViewport);
        setViewport(newViewport);
    };

    useEffect(() => {
        const updatedNodes = calculateNodePositions(
            [...nodes],
            [...edges],
            expandedWidth,
            expandedHeight,
            500, // Pass the default number of iterations
            nodeSize // Pass the nodeSize argument
        );
        if (updatedNodes.length !== 0) {
            positionedNodesRef.current = updatedNodes;
            edgesRef.current = edges;
            interactionManager.nodes = updatedNodes; // Sync nodes with the interaction manager
            interactionManager.edges = edges; // Sync edges with the interaction manager
            draw(); // Initial draw
        }
    }, [nodes, edges, expandedWidth, expandedHeight]);


    useEffect(() => {
        draw(); // Trigger redraw on viewport change
    }, [viewport]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("mousemove", handleMouseMove);
        requestAnimationFrame(updateCursorPosition); // Start the animation loop

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={viewport.width}
            height={viewport.height}
            style={{
                border: "none",
                display: "block",
                position: "absolute",
                top: 0,
                left: 0,
            }}
        />
    );
};

export default memo(CanvasGraph);
