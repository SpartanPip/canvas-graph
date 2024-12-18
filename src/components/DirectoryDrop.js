import React, { useState } from "react";
import { traverseFileTree } from "../utils/fileReader";

const DirectoryDrop = ({ setGraph }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false); // Hide overlay on drop
        const items = e.dataTransfer.items;

        for (const item of items) {
            const entry = item.webkitGetAsEntry();
            if (entry) {
                await traverseFileTree(entry, setGraph);
            }
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // Necessary to allow drop
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        setIsDragging(true); // Show overlay on drag enter
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false); // Hide overlay on drag leave
    };

    return (
        <>
            {isDragging && (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(51, 51, 51, 0.8)", // Semi-transparent dark gray
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10, // Ensure it's above the graph
                        color: "#fff",
                        fontSize: "18px",
                        border: "2px dashed #ccc",
                    }}
                >
                    Drag and drop a directory here to build the graph
                </div>
            )}
            <div
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDrop={handleDrop}
                style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                }}
            >
                {/* This is a placeholder div to catch drag events */}
            </div>
        </>
    );
};

export default DirectoryDrop;
