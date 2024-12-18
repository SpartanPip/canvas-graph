import React, { useEffect, useRef, useState } from "react";
import { calculateNodePositions } from "../utils/calculateNodePositions";

const CanvasGraph = ({ nodes = [], edges = [], viewport, setViewport, expandedWidth, expandedHeight }) => {
    const canvasRef = useRef(null);
    const [positionedNodes, setPositionedNodes] = useState([]);

    const draw = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(-viewport.x, -viewport.y);

        // Draw edges
        edges.forEach((edge) => {
            const fromNode = positionedNodes.find((node) => node.id === edge.from);
            const toNode = positionedNodes.find((node) => node.id === edge.to);

            if (fromNode && toNode) {
                ctx.beginPath();
                ctx.moveTo(fromNode.x, fromNode.y);
                ctx.lineTo(toNode.x, toNode.y);
                ctx.strokeStyle = "#000";
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        });

        // Draw nodes
        positionedNodes.forEach((node) => {
            if (
                node.x >= viewport.x &&
                node.x <= viewport.x + viewport.width &&
                node.y >= viewport.y &&
                node.y <= viewport.y + viewport.height
            ) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
                ctx.fillStyle = "#3498db";
                ctx.fill();
                ctx.strokeStyle = "#2c3e50";
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.fillStyle = "#fff";
                ctx.font = "14px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(node.label || node.id, node.x, node.y);
            }
        });

        ctx.restore();
    };

    const handleKeyDown = (e) => {
        e.preventDefault();

        const scrollAmount = 20;
        setViewport((prevViewport) => {
            const newViewport = { ...prevViewport };

            switch (e.key) {
                case "ArrowUp":
                    newViewport.y = Math.max(0, prevViewport.y - scrollAmount) - 50;
                    break;
                case "ArrowDown":
                    newViewport.y = Math.min(expandedHeight - viewport.height, prevViewport.y + scrollAmount) + 50;
                    break;
                case "ArrowLeft":
                    newViewport.x = Math.max(0, prevViewport.x - scrollAmount) - 50;
                    break;
                case "ArrowRight":
                    newViewport.x = Math.min(expandedWidth - viewport.width, prevViewport.x + scrollAmount) + 50;
                    break;
                default:
                    return prevViewport;
            }

            return newViewport;
        });
    };

    useEffect(() => {
        const updatedNodes = calculateNodePositions([...nodes], [...edges], expandedWidth, expandedHeight);
        setPositionedNodes(updatedNodes);
    }, [nodes, edges, expandedWidth, expandedHeight]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        draw();
    }, [positionedNodes, viewport]);

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
