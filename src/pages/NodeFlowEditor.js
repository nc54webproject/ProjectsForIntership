'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  Panel,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '../styles/NodeFlow.css';
import '../styles/chatbot-tester.css';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Play, Download } from 'lucide-react';

import { nodeTypes } from '../components/nodes';
import { PropertiesPanel } from '../components/properties-panel';
import { NodePalette } from '../components/node-pallete';
import { FlowControls } from '../components/flow-controls';
import { ChatbotTester } from '../components/chatbot-tester';
import { TemplateGallery } from '../components/template-system/template-gallery';
import { ChatWidget } from '../components/web-chat-widget/chat-widget';
import { useNodeFlow } from '../hooks/use-node-flow';
import { useFirestoreFlow } from '../hooks/use-firestore-flow';
import { exportFlowData } from '../utils/firestore-helpers';

// Main ReactFlow component wrapped separately to avoid destroy issues
const ReactFlowWrapper = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onEdgeClick,
  onPaneClick,
  onDrop,
  onDragOver,
  flowStats,
  lastSavedTime,
  validationErrors,
  onTestClick,
  onExportClick,
  onTemplateClick,
  onAnalyticsClick,
  onWebChatClick,
}) => {
  const reactFlowWrapper = useRef(null);

  const formatTime = (date) => {
    if (!date) return 'Never';
    return date.toLocaleString();
  };

  return (
    <div className="reactflow-wrapper" ref={reactFlowWrapper}>
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
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
        }}
        attributionPosition="bottom-left"
        connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
        defaultEdgeOptions={{
          style: { strokeWidth: 2, stroke: '#6b7280' },
          type: 'smoothstep',
        }}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode={['Meta', 'Ctrl']}
        panOnScroll={true}
        panOnScrollMode="free"
        selectionOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={true}
        panOnDrag={[1, 2]}
        selectionMode="partial"
      >
        <Controls
          position="top-left"
          showZoom={true}
          showFitView={true}
          showInteractive={true}
        />
        <MiniMap
          nodeStrokeColor={(n) => {
            if (n.type === 'textMessage') return '#2563eb';
            if (n.type === 'question') return '#16a34a';
            if (n.type === 'conditional') return '#9333ea';
            if (n.type === 'router') return '#ea580c';
            if (n.type === 'endChat') return '#b91c1c';
            if (n.type === 'delay') return '#d97706';
            if (n.type === 'collectInput') return '#a21caf';
            if (n.type === 'apiIntegration') return '#059669';
            if (n.type === 'broadcast') return '#dc2626';
            if (n.type === 'tag') return '#d97706';
            return '#6b7280';
          }}
          nodeColor={(n) => {
            if (n.type === 'textMessage') return '#eff6ff';
            if (n.type === 'question') return '#f0fdf4';
            if (n.type === 'conditional') return '#faf5ff';
            if (n.type === 'router') return '#fed7aa';
            if (n.type === 'endChat') return '#fee2e2';
            if (n.type === 'delay') return '#fff7ed';
            if (n.type === 'collectInput') return '#fef7ff';
            if (n.type === 'apiIntegration') return '#ecfdf5';
            if (n.type === 'broadcast') return '#fef2f2';
            if (n.type === 'tag') return '#fffbeb';
            return '#f9fafb';
          }}
          position="bottom-left"
          pannable
          zoomable
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#e5e7eb"
        />
        <Panel position="bottom-right">
          <div className="canvas-info">
            <div className="flow-stats">
              <div>
                Nodes: {nodes.length} | Connections: {edges.length}
              </div>
              {flowStats && (
                <div className="detailed-stats">
                  <div>📝 Messages: {flowStats.totalTextMessages}</div>
                  <div>❓ Questions: {flowStats.totalQuestions}</div>
                  <div>🔀 Routers: {flowStats.totalRouters}</div>
                  <div>⏱️ Delays: {flowStats.totalDelays || 0}</div>
                  <div>📊 Inputs: {flowStats.totalCollectInputs || 0}</div>
                  <div>🔚 End Points: {flowStats.totalEndChats}</div>
                </div>
              )}
            </div>
            <div>Last saved: {formatTime(lastSavedTime)}</div>
            <div className="canvas-actions">
              <button className="webchat-button" onClick={onWebChatClick}>
                <Play size={16} />
                Test Web Chat
              </button>
              <button className="export-flow-button" onClick={onExportClick}>
                <Download size={16} />
                Export (.json)
              </button>
            </div>
            {validationErrors.length > 0 && (
              <div className="validation-errors">
                <div className="error-title">⚠️ Issues found:</div>
                {validationErrors.map((error, index) => (
                  <div key={index} className="error-item">
                    {error}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

function NodeFlowEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [chatbot, setChatbot] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedData, setLastSavedData] = useState({ nodes: [], edges: [] });
  const [showChatbotTester, setShowChatbotTester] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showWebChat, setShowWebChat] = useState(false);
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
      if (
        window.confirm(
          'You have unsaved changes. Are you sure you want to leave?'
        )
      ) {
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  };

  // Load chatbot data and flow from Firestore
  useEffect(() => {
    const fetchBot = async () => {
      try {
        setIsLoading(true);
        const docRef = doc(db, 'webchat', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setChatbot(data);

          // Load flow data using the new hook
          try {
            const flowData = await loadFlow();
            if (flowData && flowData.nodes && flowData.edges) {
              console.log('Loading existing flow data:', flowData);
              setNodes(flowData.nodes);
              setEdges(flowData.edges);
              setLastSavedData({
                nodes: flowData.nodes,
                edges: flowData.edges,
              });

              // Update flow stats
              setFlowStats(getFlowStats(flowData.nodes, flowData.edges));
            } else {
              console.log('No existing flow data, using default nodes');
              setLastSavedData({
                nodes: defaultNodes,
                edges: [],
              });
              setFlowStats(getFlowStats(defaultNodes, []));
            }
          } catch (flowError) {
            console.error('Error loading flow data:', flowError);
            // Use default nodes if flow loading fails
            setLastSavedData({
              nodes: defaultNodes,
              edges: [],
            });
            setFlowStats(getFlowStats(defaultNodes, []));
          }
        } else {
          console.log('No such chatbot!');
          alert('Chatbot not found!');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching chatbot:', error);
        alert('Error loading chatbot');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      // Use void operator to prevent returning the Promise
      void fetchBot();
    }
  }, [id, navigate, setNodes, setEdges, defaultNodes, loadFlow, getFlowStats]);

  // Track unsaved changes and update flow stats
  useEffect(() => {
    if (!isLoading) {
      const currentData = JSON.stringify({ nodes, edges });
      const savedData = JSON.stringify({
        nodes: lastSavedData.nodes,
        edges: lastSavedData.edges,
      });
      setHasUnsavedChanges(currentData !== savedData);

      // Update flow stats
      setFlowStats(getFlowStats(nodes, edges));
    }
  }, [nodes, edges, lastSavedData, isLoading, getFlowStats]);

  // Auto-save functionality
  useEffect(() => {
    if (!isLoading && hasUnsavedChanges) {
      const timer = autoSave(nodes, edges, 30000); // Auto-save every 30 seconds
      return () => {
        if (timer) {
          clearTimeout(timer);
        }
      };
    }
  }, [nodes, edges, hasUnsavedChanges, isLoading, autoSave]);

  // ReactFlow event handlers
  const onNodeClick = useCallback((event, node) => {
    event.stopPropagation();
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback((event) => {
    event.stopPropagation();
    setSelectedNode(null);
  }, []);

  const onEdgeClick = useCallback(
    (event, edge) => {
      event.stopPropagation();
      if (window.confirm('Delete this connection?')) {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      }
    },
    [setEdges]
  );

  // Drag and drop from palette
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const reactFlowBounds = event.target
        .closest('.reactflow-wrapper')
        ?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const position = {
        x: event.clientX - reactFlowBounds.left - 100,
        y: event.clientY - reactFlowBounds.top - 50,
      };

      addNode(type, position);
    },
    [addNode]
  );

  const handlePaletteItemDrag = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
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

  // Save flow to Firestore with enhanced data
  const handleSaveFlow = async () => {
    try {
      const success = await saveFlow(nodes, edges, {
        title: chatbot?.title,
        description: chatbot?.description,
        isActive: true,
      });

      if (success) {
        // Update local state
        setLastSavedData({ nodes, edges });
        console.log('Flow saved successfully with all data!');
      } else {
        // Show validation errors if any
        if (validationErrors.length > 0) {
          alert('Validation errors:\n' + validationErrors.join('\n'));
        } else {
          alert('Error saving flow. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error saving flow:', error);
      alert('Error saving flow. Please try again.');
    }
  };

  // Export flow data
  const handleExportFlow = () => {
    try {
      const exportData = exportFlowData(nodes, edges, chatbot);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${chatbot?.title || 'chatbot'}-flow.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting flow:', error);
      alert('Error exporting flow');
    }
  };

  // Toggle chatbot tester
  const toggleChatbotTester = () => {
    setShowChatbotTester(!showChatbotTester);
  };

  // Handle test button click
  const handleTestClick = () => {
    if (validationErrors.length === 0) {
      toggleChatbotTester();
    } else {
      alert(
        'Please fix the following issues before testing:\n' +
          validationErrors.join('\n')
      );
    }
  };

  // Template system handlers
  const handleTemplateClick = () => {
    setShowTemplateGallery(true);
  };

  const handleSelectTemplate = (template) => {
    if (window.confirm('This will replace your current flow. Are you sure?')) {
      setNodes(template.nodes);
      setEdges(template.edges);
      setSelectedNode(null);
    }
  };

  // Analytics handlers
  const handleAnalyticsClick = () => {
    setShowAnalytics(true);
  };

  // Web Chat handlers
  const handleWebChatClick = () => {
    setShowWebChat(true);
  };

  if (isLoading || loadStatus === 'loading') {
    return (
      <div className="NodeFlowEditor">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading flow builder...</p>
        </div>
      </div>
    );
  }

  // Show analytics dashboard
  if (showAnalytics) {
    return (
      <div className="NodeFlowEditor">
        <FlowControls
          chatbotTitle={chatbot?.title}
          hasUnsavedChanges={hasUnsavedChanges}
          saveStatus={saveStatus}
          onBackClick={() => setShowAnalytics(false)}
          onSaveFlow={handleSaveFlow}
        />
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div className="NodeFlowEditor">
        <FlowControls
          chatbotTitle={chatbot?.title}
          hasUnsavedChanges={hasUnsavedChanges}
          saveStatus={saveStatus}
          onBackClick={handleBackClick}
          onSaveFlow={handleSaveFlow}
        />

        <div className="NodeFlow-container">
          <NodePalette
            onDragStart={handlePaletteItemDrag}
            onNodeClick={handlePaletteItemClick}
          />

          <ReactFlowWrapper
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
            flowStats={flowStats}
            lastSavedTime={lastSavedTime}
            validationErrors={validationErrors}
            onTestClick={handleTestClick}
            onExportClick={handleExportFlow}
            onTemplateClick={handleTemplateClick}
            onAnalyticsClick={handleAnalyticsClick}
            onWebChatClick={handleWebChatClick}
          />

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

        {showChatbotTester && (
          <ChatbotTester
            nodes={nodes}
            edges={edges}
            onClose={toggleChatbotTester}
          />
        )}

        {showTemplateGallery && (
          <TemplateGallery
            onClose={() => setShowTemplateGallery(false)}
            onSelectTemplate={handleSelectTemplate}
          />
        )}

        {showWebChat && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px',
            }}
          >
            <div
              style={{
                width: '400px',
                height: '600px',
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              <ChatWidget
                chatbotId={id}
                nodes={nodes}
                edges={edges}
                isEmbedded={true}
                onClose={() => setShowWebChat(false)}
              />
            </div>
          </div>
        )}
      </div>
    </ReactFlowProvider>
  );
}

export default NodeFlowEdit;
