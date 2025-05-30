"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import  {ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  Panel,
  Handle,
  Position,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import "../styles/NodeFlow.css"
import {
  ArrowLeft,
  CircleHelp,
  Clock4,
  GitBranch,
  Lightbulb,
  MessageSquare,
  Save,
  Settings,
  Zap,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "../firebase"

// Custom Node Components for ReactFlow with Handles
const TextMessageNode = ({ data, selected }) => {
  return (
    <div className={`custom-node text-message-node ${selected ? "selected" : ""}`}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        style={{ background: "#6366f1", width: 12, height: 12 }}
      />

      <div className="node-header">
        <MessageSquare className="node-icon" size={16} />
        <span className="node-label">{data.label}</span>
      </div>
      <div className="node-body">{data.message || "No message set"}</div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        style={{ background: "#8b5cf6", width: 12, height: 12 }}
      />
    </div>
  )
}

const QuestionNode = ({ data, selected }) => {
  return (
    <div className={`custom-node question-node ${selected ? "selected" : ""}`}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        style={{ background: "#6366f1", width: 12, height: 12 }}
      />

      <div className="node-header">
        <CircleHelp className="node-icon" size={16} />
        <span className="node-label">{data.label}</span>
      </div>
      <div className="node-body">{data.question || "No question set"}</div>
      {data.options && data.options.length > 0 && (
        <div className="node-options">
          {data.options.map((option, index) => (
            <div key={index} className="node-option">
              {option}
            </div>
          ))}
        </div>
      )}

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        style={{ background: "#8b5cf6", width: 12, height: 12 }}
      />
    </div>
  )
}

const ConditionalNode = ({ data, selected }) => {
  return (
    <div className={`custom-node conditional-node ${selected ? "selected" : ""}`}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        style={{ background: "#6366f1", width: 12, height: 12 }}
      />

      <div className="node-header">
        <GitBranch className="node-icon" size={16} />
        <span className="node-label">{data.label}</span>
      </div>
      <div className="node-body">
        <div>If {data.condition || "condition"}</div>
        <div>
          {data.operator || "equals"} "{data.value || "value"}"
        </div>
      </div>

      {/* True Handle (Left) */}
      <Handle
        type="source"
        position={Position.Left}
        id="true"
        style={{ background: "#22c55e", width: 12, height: 12 }}
      />

      {/* False Handle (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        style={{ background: "#ef4444", width: 12, height: 12 }}
      />

      {/* Labels for conditional handles */}
      <div className="conditional-labels">
        <span className="true-label">TRUE</span>
        <span className="false-label">FALSE</span>
      </div>
    </div>
  )
}

const DelayNode = ({ data, selected }) => {
  return (
    <div className={`custom-node delay-node ${selected ? "selected" : ""}`}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        style={{ background: "#6366f1", width: 12, height: 12 }}
      />

      <div className="node-header">
        <Clock4 className="node-icon" size={16} />
        <span className="node-label">{data.label}</span>
      </div>
      <div className="node-body">Wait {data.duration || 2} seconds</div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        style={{ background: "#8b5cf6", width: 12, height: 12 }}
      />
    </div>
  )
}

// Node types for ReactFlow
const nodeTypes = {
  textMessage: TextMessageNode,
  question: QuestionNode,
  conditional: ConditionalNode,
  delay: DelayNode,
}

// Properties panel component
const PropertiesPanel = ({ selectedNode, onUpdateNode, onDeleteNode }) => {
  const [localData, setLocalData] = useState({})

  useEffect(() => {
    if (selectedNode) {
      setLocalData(selectedNode.data)
    }
  }, [selectedNode])

  const handleUpdate = (field, value) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    if (selectedNode) {
      onUpdateNode(selectedNode.id, newData)
    }
  }

  const addOption = () => {
    const newOptions = [...(localData.options || []), `Option ${(localData.options?.length || 0) + 1}`]
    handleUpdate("options", newOptions)
  }

  const removeOption = (index) => {
    const newOptions = localData.options.filter((_, i) => i !== index)
    handleUpdate("options", newOptions)
  }

  const updateOption = (index, value) => {
    const newOptions = [...localData.options]
    newOptions[index] = value
    handleUpdate("options", newOptions)
  }

  const handleDeleteNode = () => {
    if (selectedNode && window.confirm("Are you sure you want to delete this node?")) {
      onDeleteNode(selectedNode.id)
    }
  }

  if (!selectedNode) {
    return (
      <div className="properties-panel">
        <div className="properties-header">
          <div>
            <Settings size={20} />
            <h2>Properties</h2>
          </div>
        </div>
        <div className="properties-body">
          <p className="no-selection">Select a node to edit its properties</p>
          <div className="connection-guide">
            <h3>Connection Guide:</h3>
            <div className="guide-item">
              <div className="handle-demo input"></div>
              <span>Input (Blue) - Where connections come in</span>
            </div>
            <div className="guide-item">
              <div className="handle-demo output"></div>
              <span>Output (Purple) - Where connections go out</span>
            </div>
            <div className="guide-item">
              <div className="handle-demo true"></div>
              <span>True (Green) - Conditional true path</span>
            </div>
            <div className="guide-item">
              <div className="handle-demo false"></div>
              <span>False (Red) - Conditional false path</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="properties-panel">
      <div className="properties-header">
        <div>
          <Settings size={20} />
          <h2>Properties</h2>
        </div>
        <p className="editing-type">Editing: {selectedNode.type}</p>
      </div>
      <div className="properties-body">
        <div className="property-group">
          <label>Node Label</label>
          <input
            type="text"
            value={localData.label || ""}
            onChange={(e) => handleUpdate("label", e.target.value)}
            placeholder="Enter node label..."
            className="property-input"
          />
        </div>

        {selectedNode.type === "textMessage" && (
          <div className="property-group">
            <label>Message</label>
            <textarea
              value={localData.message || ""}
              onChange={(e) => handleUpdate("message", e.target.value)}
              placeholder="Enter your message..."
              rows={4}
              className="property-textarea"
            />
          </div>
        )}

        {selectedNode.type === "question" && (
          <>
            <div className="property-group">
              <label>Question</label>
              <textarea
                value={localData.question || ""}
                onChange={(e) => handleUpdate("question", e.target.value)}
                placeholder="Enter your question..."
                rows={3}
                className="property-textarea"
              />
            </div>

            <div className="property-group">
              <div className="options-header">
                <label>Answer Options</label>
                <button onClick={addOption} className="add-option-btn">
                  <Plus size={16} />
                </button>
              </div>
              <div className="options-list">
                {(localData.options || []).map((option, index) => (
                  <div key={index} className="option-input">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="property-input"
                    />
                    <button onClick={() => removeOption(index)} className="remove-option-btn">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {selectedNode.type === "conditional" && (
          <>
            <div className="property-group">
              <label>Condition Variable</label>
              <input
                type="text"
                value={localData.condition || ""}
                onChange={(e) => handleUpdate("condition", e.target.value)}
                placeholder="e.g., user_input, user_name"
                className="property-input"
              />
            </div>

            <div className="property-group">
              <label>Operator</label>
              <select
                value={localData.operator || "equals"}
                onChange={(e) => handleUpdate("operator", e.target.value)}
                className="property-select"
              >
                <option value="equals">Equals</option>
                <option value="contains">Contains</option>
                <option value="starts_with">Starts with</option>
                <option value="ends_with">Ends with</option>
                <option value="greater_than">Greater than</option>
                <option value="less_than">Less than</option>
              </select>
            </div>

            <div className="property-group">
              <label>Value</label>
              <input
                type="text"
                value={localData.value || ""}
                onChange={(e) => handleUpdate("value", e.target.value)}
                placeholder="Enter comparison value..."
                className="property-input"
              />
            </div>
          </>
        )}

        {selectedNode.type === "delay" && (
          <div className="property-group">
            <label>Delay Duration (seconds)</label>
            <input
              type="number"
              value={localData.duration || 2}
              onChange={(e) => handleUpdate("duration", Number.parseInt(e.target.value) || 2)}
              min="1"
              max="60"
              className="property-input"
            />
          </div>
        )}

        <div className="property-group">
          <button onClick={handleDeleteNode} className="delete-node-btn">
            <Trash2 size={16} />
            Delete Node
          </button>
        </div>
      </div>
    </div>
  )
}

function NodeFlowEdit() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [chatbot, setChatbot] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState("idle") // idle, saving, saved, error
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSavedData, setLastSavedData] = useState({ nodes: [], edges: [] })
  const [lastSavedTime, setLastSavedTime] = useState(null)

  // Default initial nodes
  const defaultNodes = useMemo(() => [
    {
      id: "start",
      type: "textMessage",
      position: { x: 250, y: 100 },
      data: {
        label: "Welcome Message",
        message: "Hello! Welcome to our chatbot. How can I help you today?",
      },
    },
  ], []);

  // ReactFlow state management
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
        navigate("/dashboard")
      }
    } else {
      navigate("/dashboard")
    }
  }

  // Load chatbot data and flow from Firestore
  useEffect(() => {
    const fetchBot = async () => {
      try {
        setIsLoading(true)
        const docRef = doc(db, "webchat", id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          setChatbot(data)

          // Load flow data if it exists
          if (data.flowData && data.flowData.nodes && data.flowData.edges) {
            console.log("Loading existing flow data:", data.flowData)
            setNodes(data.flowData.nodes)
            setEdges(data.flowData.edges)
            setLastSavedData({
              nodes: data.flowData.nodes,
              edges: data.flowData.edges,
            })
            if (data.flowData.lastModified) {
              setLastSavedTime(new Date(data.flowData.lastModified))
            }
          } else {
            console.log("No existing flow data, using default nodes")
            setLastSavedData({
              nodes: defaultNodes,
              edges: [],
            })
          }
        } else {
          console.log("No such chatbot!")
          alert("Chatbot not found!")
          navigate("/dashboard")
        }
      } catch (error) {
        console.error("Error fetching chatbot:", error)
        alert("Error loading chatbot")
        navigate("/dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchBot()
    }
  }, [id, navigate, setNodes, setEdges , defaultNodes])

  // Track unsaved changes
  useEffect(() => {
    if (!isLoading) {
      const currentData = JSON.stringify({ nodes, edges })
      const savedData = JSON.stringify({ nodes: lastSavedData.nodes, edges: lastSavedData.edges })
      setHasUnsavedChanges(currentData !== savedData)
    }
  }, [nodes, edges, lastSavedData, isLoading])

  const getDefaultNodeData = (type) => {
    switch (type) {
      case "textMessage":
        return { label: "Text Message", message: "Enter your message here..." }
      case "question":
        return {
          label: "Question",
          question: "What would you like to know?",
          options: ["Option 1", "Option 2"],
        }
      case "conditional":
        return {
          label: "Conditional",
          condition: "user_input",
          operator: "equals",
          value: "",
        }
      case "delay":
        return { label: "Delay", duration: 2 }
      default:
        return { label: "Node" }
    }
  }

  const addNode = useCallback(
    (type, position) => {
      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: getDefaultNodeData(type),
      }
      setNodes((nds) => [...nds, newNode])
    },
    [setNodes],
  )

  const updateNodeData = useCallback(
    (nodeId, newData) => {
      setNodes((nds) =>
        nds.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node)),
      )
    },
    [setNodes],
  )

  const deleteNode = useCallback(
    (nodeId) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId))
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))
      setSelectedNode(null)
    },
    [setNodes, setEdges],
  )

  // ReactFlow event handlers
  const onConnect = useCallback(
    (params) => {
      console.log("Connection params:", params)

      // Create edge with custom styling based on source handle
      let edgeStyle = {}
      let edgeLabel = ""

      if (params.sourceHandle === "true") {
        edgeStyle = { stroke: "#22c55e", strokeWidth: 2 }
        edgeLabel = "TRUE"
      } else if (params.sourceHandle === "false") {
        edgeStyle = { stroke: "#ef4444", strokeWidth: 2 }
        edgeLabel = "FALSE"
      } else {
        edgeStyle = { stroke: "#6b7280", strokeWidth: 2 }
      }

      const newEdge = {
        ...params,
        id: `edge-${Date.now()}`,
        style: edgeStyle,
        label: edgeLabel,
        labelStyle: {
          fill: edgeStyle.stroke,
          fontWeight: 600,
          fontSize: 12,
        },
        labelBgStyle: {
          fill: "white",
          fillOpacity: 0.8,
        },
      }

      setEdges((eds) => addEdge(newEdge, eds))
    },
    [setEdges],
  )

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const onEdgeClick = useCallback(
    (event, edge) => {
      if (window.confirm("Delete this connection?")) {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id))
      }
    },
    [setEdges],
  )

  // Drag and drop from palette
  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()

      const type = event.dataTransfer.getData("application/reactflow")
      if (typeof type === "undefined" || !type) {
        return
      }

      const position = {
        x: event.clientX - event.currentTarget.getBoundingClientRect().left - 100,
        y: event.clientY - event.currentTarget.getBoundingClientRect().top - 50,
      }

      addNode(type, position)
    },
    [addNode],
  )

  const handlePaletteItemDrag = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType)
    event.dataTransfer.effectAllowed = "move"
  }

  const handlePaletteItemClick = (type) => {
    const position = {
      x: Math.random() * 400 + 200,
      y: Math.random() * 300 + 200,
    }
    addNode(type, position)
  }

  // Save flow to Firestore
  const handleSaveFlow = async () => {
    try {
      setSaveStatus("saving")

      const now = new Date()
      const flowData = {
        nodes,
        edges,
        lastModified: now.toISOString(),
        nodeCount: nodes.length,
        edgeCount: edges.length,
      }

      const docRef = doc(db, "webchat", id)
      await updateDoc(docRef, {
        flowData: flowData,
        updatedAt: now,
      })

      // Update local state
      setLastSavedData({ nodes, edges })
      setLastSavedTime(now)
      setSaveStatus("saved")

      console.log("Flow saved successfully!")

      // Reset status after 2 seconds
      setTimeout(() => {
        setSaveStatus("idle")
      }, 2000)
    } catch (error) {
      console.error("Error saving flow:", error)
      setSaveStatus("error")
      alert("Error saving flow. Please try again.")

      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus("idle")
      }, 3000)
    }
  }

  // Format time for display
  const formatTime = (date) => {
    if (!date) return "Never"
    return date.toLocaleString()
  }

  // Get save button content based on status
  const getSaveButtonContent = () => {
    switch (saveStatus) {
      case "saving":
        return (
          <>
            <div className="spinner"></div>
            <span>Saving...</span>
          </>
        )
      case "saved":
        return (
          <>
            <CheckCircle size={16} />
            <span>Saved!</span>
          </>
        )
      case "error":
        return (
          <>
            <AlertCircle size={16} />
            <span>Error!</span>
          </>
        )
      default:
        return (
          <>
            <Save size={16} />
            <span>Save Flow</span>
          </>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="NodeFlowEditor">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading flow builder...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="NodeFlowEditor">
      <div className="flow-controls">
        <div className="flow-info">
          <span className="flow-title">WebChat Flow Builder</span>
          <span className="chatbot-title">{chatbot?.title || "Untitled WebChat"}</span>
          <div className={`flow-status ${hasUnsavedChanges ? "unsaved" : ""}`}>
            <div className="flow-status-dot"></div>
            <span>{hasUnsavedChanges ? "Unsaved changes" : "All changes saved"}</span>
          </div>
        </div>

        <div className="control-buttons">
          <button className="control-button" onClick={handleBackClick}>
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <button
            className={`control-button ${saveStatus}`}
            onClick={handleSaveFlow}
            disabled={saveStatus === "saving"}
          >
            {getSaveButtonContent()}
          </button>
        </div>
      </div>

      <div className="NodeFlow-container">
        <div className="node-palette">
          <div className="palette-container">
            <div className="palette-header">
              <Zap />
              <h1>Node Palette</h1>
            </div>

            <div
              className="palette-item text-message"
              draggable
              onDragStart={(e) => handlePaletteItemDrag(e, "textMessage")}
              onClick={() => handlePaletteItemClick("textMessage")}
            >
              <MessageSquare />
              <div className="palette-item-content">
                <h3>Text Message</h3>
                <p>Send a text message to the user</p>
              </div>
            </div>

            <div
              className="palette-item question"
              draggable
              onDragStart={(e) => handlePaletteItemDrag(e, "question")}
              onClick={() => handlePaletteItemClick("question")}
            >
              <CircleHelp />
              <div className="palette-item-content">
                <h3>Question</h3>
                <p>Ask the question with multiple choice options</p>
              </div>
            </div>

            <div
              className="palette-item conditional"
              draggable
              onDragStart={(e) => handlePaletteItemDrag(e, "conditional")}
              onClick={() => handlePaletteItemClick("conditional")}
            >
              <GitBranch />
              <div className="palette-item-content">
                <h3>Condition</h3>
                <p>Branch the flow based on the condition</p>
              </div>
            </div>

            <div
              className="palette-item delay"
              draggable
              onDragStart={(e) => handlePaletteItemDrag(e, "delay")}
              onClick={() => handlePaletteItemClick("delay")}
            >
              <Clock4 />
              <div className="palette-item-content">
                <h3>Delay</h3>
                <p>Add a delay before the next message</p>
              </div>
            </div>
          </div>

          <div className="palette-tip">
            <Lightbulb />
            <p>Tip: Drag nodes onto the canvas or click to add them. Drag from connection handles to create flows.</p>
          </div>
        </div>

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
                if (n.type === "textMessage") return "#2563eb"
                if (n.type === "question") return "#16a34a"
                if (n.type === "conditional") return "#9333ea"
                if (n.type === "delay") return "#ea580c"
                return "#6b7280"
              }}
              nodeColor={(n) => {
                if (n.type === "textMessage") return "#eff6ff"
                if (n.type === "question") return "#f0fdf4"
                if (n.type === "conditional") return "#faf5ff"
                if (n.type === "delay") return "#fff7ed"
                return "#f9fafb"
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
          <PropertiesPanel selectedNode={selectedNode} onUpdateNode={updateNodeData} onDeleteNode={deleteNode} />
        </div>
      </div>
    </div>
  )
}

export default NodeFlowEdit
