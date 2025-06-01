import React, { useEffect, useState, useCallback } from "react";
import { ReactFlow, MiniMap, Controls, Background, BackgroundVariant, Panel } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "../styles/NodeFlow.css";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

import { nodeTypes } from "../components/nodes";
import { PropertiesPanel } from "../components/properties-panel";
import { NodePalette } from "../components/node-pallete";
import { FlowControls } from "../components/flow-controls";
import { useNodeFlow } from "../hooks/use-node-flow";

function NodeFlowEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [chatbot, setChatbot] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedData, setLastSavedData] = useState({ nodes: [], edges: [] });
  const [lastSavedTime, setLastSavedTime] = useState(null);

  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    updateNodeData,
    deleteNode,
    defaultNodes,
  } = useNodeFlow();

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
        navigate("/dashboard");
      }
    } else {
      navigate("/dashboard");
    }
  };

  // Load chatbot data and flow from Firestore
  useEffect(() => {
    const fetchBot = async () => {
      try {
        setIsLoading(true);
        const docRef = doc(db, "webchat", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setChatbot(data);

          // Load flow data if it exists
          if (data.flowData && data.flowData.nodes && data.flowData.edges) {
            console.log("Loading existing flow data:", data.flowData);
            setNodes(data.flowData.nodes);
            setEdges(data.flowData.edges);
            setLastSavedData({
              nodes: data.flowData.nodes,
              edges: data.flowData.edges,
            });
            if (data.flowData.lastModified) {
              setLastSavedTime(new Date(data.flowData.lastModified));
            }
          } else {
            console.log("No existing flow data, using default nodes");
            setLastSavedData({
              nodes: defaultNodes,
              edges: [],
            });
          }
        } else {
          console.log("No such chatbot!");
          alert("Chatbot not found!");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching chatbot:", error);
        alert("Error loading chatbot");
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchBot();
    }
  }, [id, navigate, setNodes, setEdges, defaultNodes]);

  // Track unsaved changes
  useEffect(() => {
    if (!isLoading) {
      const currentData = JSON.stringify({ nodes, edges });
      const savedData = JSON.stringify({ nodes: lastSavedData.nodes, edges: lastSavedData.edges });
      setHasUnsavedChanges(currentData !== savedData);
    }
  }, [nodes, edges, lastSavedData, isLoading]);

  // ReactFlow event handlers
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onEdgeClick = useCallback(
    (event, edge) => {
      if (window.confirm("Delete this connection?")) {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      }
    },
    [setEdges]
  );

  // Drag and drop from palette
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = {
        x: event.clientX - event.currentTarget.getBoundingClientRect().left - 100,
        y: event.clientY - event.currentTarget.getBoundingClientRect().top - 50,
      };

      addNode(type, position);
    },
    [addNode]
  );

  const handlePaletteItemDrag = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const handlePaletteItemClick = (type) => {
    const position = {
      x: Math.random() * 400 + 200,
      y: Math.random() * 300 + 200,
    };
    addNode(type, position);
  };

  const handleNodeDelete = (nodeId) => {
    deleteNode(nodeId);
    setSelectedNode(null);
  };

  // Save flow to Firestore
  const handleSaveFlow = async () => {
    try {
      setSaveStatus("saving");

      const now = new Date();
      const flowData = {
        nodes,
        edges,
        lastModified: now.toISOString(),
        nodeCount: nodes.length,
        edgeCount: edges.length,
      };

      const docRef = doc(db, "webchat", id);
      await updateDoc(docRef, {
        flowData: flowData,
        updatedAt: now,
      });
      console.log(JSON.stringify(flowData));

      // Update local state
      setLastSavedData({ nodes, edges });
      setLastSavedTime(now);
      setSaveStatus("saved");

      console.log("Flow saved successfully!");

      // Reset status after 2 seconds
      setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
    } catch (error) {
      console.error("Error saving flow:", error);
      setSaveStatus("error");
      alert("Error saving flow. Please try again.");

      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus("idle");
      }, 3000);
    }
  };

  // Format time for display
  const formatTime = (date) => {
    if (!date) return "Never";
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="NodeFlowEditor">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading flow builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="NodeFlowEditor">
      <FlowControls
        chatbotTitle={chatbot?.title}
        hasUnsavedChanges={hasUnsavedChanges}
        saveStatus={saveStatus}
        onBackClick={handleBackClick}
        onSaveFlow={handleSaveFlow}
      />

      <div className="NodeFlow-container">
        <NodePalette onDragStart={handlePaletteItemDrag} onNodeClick={handlePaletteItemClick} />

        <div className="reactflow-wrapper">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
            connectionLineStyle={{ stroke: "#3b82f6", strokeWidth: 2 }}
            defaultEdgeOptions={{
              style: { strokeWidth: 2, stroke: "#6b7280" },
              type: "smoothstep",
            }}
          >
            <Controls />
            <MiniMap
              nodeStrokeColor={(n) => {
                if (n.type === "textMessage") return "#2563eb";
                if (n.type === "question") return "#16a34a";
                if (n.type === "conditional") return "#9333ea";
                if (n.type === "delay") return "#ea580c";
                return "#6b7280";
              }}
              nodeColor={(n) => {
                if (n.type === "textMessage") return "#eff6ff";
                if (n.type === "question") return "#f0fdf4";
                if (n.type === "conditional") return "#faf5ff";
                if (n.type === "delay") return "#fff7ed";
                return "#f9fafb";
              }}
            />
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            <Panel position="bottom-right">
              <div className="canvas-info">
                <div>
                  Nodes: {nodes.length} | Connections: {edges.length}
                </div>
                <div>Last saved: {formatTime(lastSavedTime)}</div>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        <div className="node-property">
          <PropertiesPanel selectedNode={selectedNode} onUpdateNode={updateNodeData} onDeleteNode={handleNodeDelete} />
        </div>
      </div>
    </div>
  );
}

export default NodeFlowEdit;