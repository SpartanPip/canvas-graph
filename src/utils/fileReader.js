export const traverseFileTree = async (entry, setGraph) => {
    const readEntries = (directoryReader) =>
        new Promise((resolve, reject) => {
            directoryReader.readEntries((entries) => resolve(entries), reject);
        });

    const readFileContent = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });

    const tempNodes = [];
    const tempEdges = [];

    const addNode = (nodeName) => {
        // Check if nodeName is null or undefined
        if (!nodeName) {
            console.warn("Attempted to add a node with null or undefined name.");
            return;
        }
        
        // Avoid adding duplicate nodes
        if (!tempNodes.some((node) => node.id === nodeName)) {
            tempNodes.push({ id: nodeName, label: nodeName });
        }
    };
    

    const addEdge = (from, to) => {
        if (!tempNodes.some((node) => node.id === from) || !tempNodes.some((node) => node.id === to)) {
            console.warn(`Invalid edge detected`);
            return; // Skip invalid edges
        }
        if (!tempEdges.some((edge) => edge.from === from && edge.to === to)) {
            tempEdges.push({ from, to });
        }
    };

    const traverse = async (entry) => {
        if (entry.isFile) {
            const file = await new Promise((resolve, reject) => entry.file(resolve, reject));
            const content = await readFileContent(file);

            // Extract @CallExternalSub instances
            const regex = /@CallExternalSub\([^,]+,([^,]+),/g;
            let match;

            while ((match = regex.exec(content)) !== null) {
                const calledFileName = match[1];

                const sanitizedNodeName = file.name.replace(/\.focus$/, '');
                // Add nodes for the current file and the called file
                addNode(sanitizedNodeName);
                addNode(calledFileName);

                // Add an edge between the two files
                addEdge(sanitizedNodeName, calledFileName);
            }
        } else if (entry.isDirectory) {
            const directoryReader = entry.createReader();
            const entries = await readEntries(directoryReader);
            for (const nestedEntry of entries) {
                await traverse(nestedEntry);
            }
        }
    };

    await traverse(entry);

    // Update the graph state once after processing
    console.log("setting graph")
    setGraph({ nodes: tempNodes, edges: tempEdges });
};
