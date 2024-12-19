import React, { useEffect, useRef, useState, useMemo } from "react";
import { calculateNodePositions } from "../utils/calculateNodePositions";
import NodeInteractionManager from "../utils/nodeInteractionManager"; // Import NodeInteractionManager

const CanvasGraph = ({ nodes = [], edges = [], viewport, setViewport, expandedWidth, expandedHeight }) => {
    const canvasRef = useRef(null);
    const positionedNodesRef = useRef([]); // UseRef to store node positions
    const edgesRef = useRef(edges);
    const nodeSize = 20;

    // Instantiate the NodeInteractionManager
    const interactionManager = useMemo(() => new NodeInteractionManager(nodes, edges), []);

    const cursorPosition = useRef({ x: 0, y: 0 }); // Store the current cursor position

    const draw = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(-viewport.x, -viewport.y);
    
        // Draw edges
        edgesRef.current.forEach((edge) => {
            const fromNode = positionedNodesRef.current.find((node) => node.id === edge.from);
            const toNode = positionedNodesRef.current.find((node) => node.id === edge.to);
            if (fromNode && toNode) {
                ctx.beginPath();
                ctx.moveTo(fromNode.x, fromNode.y);
                ctx.lineTo(toNode.x, toNode.y);
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#2c3e50";
                ctx.stroke();
            }
            
        });

        // Draw default nodes and labels
        // Draw all nodes first
        positionedNodesRef.current.forEach((node) => {
          if (
              node.x >= viewport.x &&
              node.x <= viewport.x + viewport.width &&
              node.y >= viewport.y &&
              node.y <= viewport.y + viewport.height
          ) {
              ctx.beginPath();
              ctx.arc(node.x, node.y, nodeSize, 0, Math.PI * 2);

              // Determine the fill color based on node state
              if (interactionManager.activeNodes.includes(node)) {
                  ctx.fillStyle = "#ffffff"; // Active node color
              } else if (interactionManager.adjacentNodes.includes(node)) {
                  ctx.fillStyle = "#87CEEB"; // Adjacent node color
              } else {
                  ctx.fillStyle = "#3498db"; // Default node color
              }

              ctx.fill();
              ctx.strokeStyle = "#2c3e50";
              ctx.lineWidth = 2;
              ctx.stroke();
          }
        });

        // Draw all labels after the nodes
        positionedNodesRef.current.forEach((node) => {
          if (
              node.x >= viewport.x &&
              node.x <= viewport.x + viewport.width &&
              node.y >= viewport.y &&
              node.y <= viewport.y + viewport.height
          ) {
              ctx.fillStyle = interactionManager.activeNodes.includes(node)
                  ? "#000" // Black text for active nodes
                  : "#fff"; // White text for other nodes
              ctx.font = "12px Arial";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(node.label || node.id, node.x, node.y - nodeSize - 5);
          }
        });


        // Draw adjacent nodes and labels
        interactionManager.adjacentNodes.forEach((node) => {
            if (
                node.x >= viewport.x &&
                node.x <= viewport.x + viewport.width &&
                node.y >= viewport.y &&
                node.y <= viewport.y + viewport.height
            ) {
                // Draw adjacent nodes
                ctx.beginPath();
                ctx.arc(node.x, node.y, nodeSize, 0, Math.PI * 2);
                ctx.fillStyle = "#87CEEB"; // Lighter blue for adjacent nodes
                ctx.fill();
                ctx.strokeStyle = "#2c3e50";
                ctx.lineWidth = 2;
                ctx.stroke();

                // Draw labels
                ctx.fillStyle = "#fff";
                ctx.font = "12px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(node.label || node.id, node.x, node.y - nodeSize - 5);
            }
        });

        // Draw active nodes and labels
        interactionManager.activeNodes.forEach((node) => {
            if (
                node.x >= viewport.x &&
                node.x <= viewport.x + viewport.width &&
                node.y >= viewport.y &&
                node.y <= viewport.y + viewport.height
            ) {
                // Draw active nodes
                ctx.beginPath();
                ctx.arc(node.x, node.y, nodeSize, 0, Math.PI * 2);
                ctx.fillStyle = "#ffffff"; // White for active nodes
                ctx.fill();
                ctx.strokeStyle = "#2c3e50";
                ctx.lineWidth = 2;
                ctx.stroke();

                // Draw labels
                ctx.fillStyle = "#000"; // Black text for active nodes
                ctx.font = "12px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(node.label || node.id, node.x, node.y - nodeSize - 5);
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
  
      const scrollAmount = 20; // Amount to move the viewport
      setViewport((prevViewport) => {
          const newViewport = { ...prevViewport };
  
          switch (e.key) {
              case "ArrowUp":
                  newViewport.y = Math.max(0, prevViewport.y - scrollAmount) - 150;
                  break;
              case "ArrowDown":
                  newViewport.y = Math.min(expandedHeight - viewport.height, prevViewport.y + scrollAmount) + 150;
                  break;
              case "ArrowLeft":
                  newViewport.x = Math.max(0, prevViewport.x - scrollAmount) - 150;
                  break;
              case "ArrowRight":
                  newViewport.x = Math.min(expandedWidth - viewport.width, prevViewport.x + scrollAmount) + 150;
                  break;
              default:
                  return prevViewport; // No change for other keys
          }
  
          return newViewport;
      });
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
        if (updatedNodes.length !== 0){
          positionedNodesRef.current = updatedNodes;
          edgesRef.current = edges;
          interactionManager.nodes = updatedNodes; // Sync nodes with the interaction manager
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

export default CanvasGraph;
