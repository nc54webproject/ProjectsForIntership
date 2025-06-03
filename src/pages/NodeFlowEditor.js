"use client"

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ReactFlow, MiniMap, Controls, Background, BackgroundVariant, Panel } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "../styles/NodeFlow.css";
import "../styles/chatbot-tester.css";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Play, Download } from "lucide-react";

import { nodeTypes } from "../components/nodes";
import { PropertiesPanel } from "../components/properties-panel";
import { NodePalette } from "../components/node-pallete";
import { FlowControls } from "../components/flow-controls";
import { ChatbotTester } from "../components/chatbot-tester";
import { useNodeFlow } from "../hooks/use-node-flow";
import { useFirestoreFlow } from "../hooks/use-firestore-flow";
import { exportFlowData } from "../utils/firestore-helpers";

function NodeFlowEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [chatbot, setChatbot] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedData, setLastSavedData] = useState({ nodes: [], edges: [] });
  const [showChatbotTester, setShowChatbotTester] = useState(false);
  const [flowStats, setFlowStats] = useState(null);

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

  const {
    saveFlow,
    loadFlow,
    autoSave,
    getFlowStats,
    saveStatus,
    loadStatus,
    lastSavedTime,
    validationErrors,
  } = useFirestoreFlow(id);

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
        navigate("/dashboard");
      }
    } else {
      navigate("/dashboard");
    }
  };

  useEffect(() => {
    const fetchBot = async () => {
      try {
        setIsLoading(true);
        const docRef = doc(db, "webchat", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setChatbot(data);

          try {
            const flowData = await loadFlow();
            if (flowData && flowData.nodes && flowData.edges) {
              setNodes(flowData.nodes);
              setEdges(flowData.edges);
              setLastSavedData({ nodes: flowData.nodes, edges: flowData.edges });
              setFlowStats(getFlowStats(flowData.nodes, flowData.edges));
            } else {
              setLastSavedData({ nodes: defaultNodes, edges: [] });
              setFlowStats(getFlowStats(defaultNodes, []));
            }
          } catch {
            setLastSavedData({ nodes: defaultNodes, edges: [] });
            setFlowStats(getFlowStats(defaultNodes, []));
          }
        } else {
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

    if (id) fetchBot();
  }, [id, navigate, setNodes, setEdges, defaultNodes, loadFlow, getFlowStats]);

  useEffect(() => {
    if (!isLoading) {
      const currentData = JSON.stringify({ nodes, edges });
      const savedData = JSON.stringify({ nodes: lastSavedData.nodes, edges: lastSavedData.edges });
      setHasUnsavedChanges(currentData !== savedData);
      setFlowStats(getFlowStats(nodes, edges));
    }
  }, [nodes, edges, lastSavedData, isLoading, getFlowStats]);

  useEffect(() => {
    if (!isLoading && hasUnsavedChanges) {
      const cleanup = autoSave(nodes, edges, 30000);
      return cleanup;
    }
  }, [nodes, edges, hasUnsavedChanges, isLoading, autoSave]);

  const onNodeClick = useCallback((event, node) => setSelectedNode(node), []);
  const onPaneClick = useCallback(() => setSelectedNode(null), []);
  const onEdgeClick = useCallback(
    (event, edge) => {
      if (window.confirm("Delete this connection?")) {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      }
    },
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

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

  const handleSaveFlow = async () => {
    try {
      const success = await saveFlow(nodes, edges, {
        title: chatbot?.title,
        description: chatbot?.description,
        isActive: true,
      });

      if (success) {
        setLastSavedData({ nodes, edges });
      } else {
        if (validationErrors.length > 0) {
          alert("Validation errors:\n" + validationErrors.join("\n"));
        } else {
          alert("Error saving flow. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error saving flow:", error);
      alert("Error saving flow. Please try again.");
    }
  };

  const handleExportFlow = () => {
    try {
      const exportData = exportFlowData(nodes, edges, chatbot);
      const blob = new Blob([exportData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${chatbot?.title || "chatbot"}-flow.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting flow:", error);
      alert("Error exporting flow");
    }
  };

  const formatTime = (date) => (date ? date.toLocaleString() : "Never");
  const toggleChatbotTester = () => setShowChatbotTester((prev) => !prev);
  const handleTestClick = () => {
    if (validationErrors.length === 0) {
      toggleChatbotTester();
    } else {
      alert("Please fix the following issues before testing:\n" + validationErrors.join("\n"));
    }
  };

  if (isLoading || loadStatus === "loading") {
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
            defaultEdgeOptions={{ style: { strokeWidth: 2, stroke: "#6b7280" }, type: "smoothstep" }}
          >
            <Controls />
            <MiniMap
              nodeStrokeColor={(n) => {
                const colors = { textMessage: "#2563eb", question: "#16a34a", conditional: "#9333ea", router: "#ea580c", endChat: "#b91c1c" };
                return colors[n.type] || "#6b7280";
              }}
              nodeColor={(n) => {
                const fills = { textMessage: "#eff6ff", question: "#f0fdf4", conditional: "#faf5ff", router: "#fed7aa", endChat: "#fee2e2" };
                return fills[n.type] || "#f9fafb";
              }}
            />
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            <Panel position="bottom-right">
              <div className="canvas-info">
                <div className="flow-stats">
                  <div>Nodes: {nodes.length} | Connections: {edges.length}</div>
                  {flowStats && (
                    <div className="detailed-stats">
                      <div>📝 Messages: {flowStats.totalTextMessages}</div>
                      <div>❓ Questions: {flowStats.totalQuestions}</div>
                      <div>🔀 Routers: {flowStats.totalRouters}</div>
                      <div>🔚 End Points: {flowStats.totalEndChats}</div>
                    </div>
                  )}
                </div>
                <div>Last saved: {formatTime(lastSavedTime)}</div>
                <div className="canvas-actions">
                  <button className="test-flow-button" onClick={handleTestClick}>
                    <Play size={16} /> Test Chatbot
                  </button>
                  <button className="export-flow-button" onClick={handleExportFlow}>
                    <Download size={16} /> Export
                  </button>
                </div>
                {validationErrors.length > 0 && (
                  <div className="validation-errors">
                    <div className="error-title">⚠️ Issues found:</div>
                    {validationErrors.map((error, index) => (
                      <div key={index} className="error-item">{error}</div>
                    ))}
                  </div>
                )}
              </div>
            </Panel>
          </ReactFlow>
        </div>

        <div className="node-property">
          <PropertiesPanel
            selectedNode={selectedNode}
            onUpdateNode={updateNodeData}
            onDeleteNode={handleNodeDelete}
            nodes={nodes}
            edges={edges}
          />
        </div>
      </div>

      {showChatbotTester && <ChatbotTester nodes={nodes} edges={edges} onClose={toggleChatbotTester} />}
    </div>
  );
}

export default NodeFlowEdit;
