"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import "../styles/NodeFlowEditor.css"
import { ArrowLeft, HelpCircle as CircleHelp, Clock4, GitBranch, Lightbulb, MessageSquare, Save, Settings, Zap, Plus, Trash2 } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "../firebase"

// Node component for rendering individual nodes
const FlowNode = ({
  node,
  selected,
  onSelect,
  onDragStart,
  onConnectionStart,
  onConnectionEnd,
  isConnecting,
  tempConnection,
}) => {
  const nodeIcons = {
    textMessage: MessageSquare,
    question: CircleHelp,
    conditional: GitBranch,
    delay: Clock4,
  }

  const Icon = nodeIcons[node.type] || MessageSquare

  const handleMouseDown = (event) => {
    event.preventDefault()
    onSelect(node)
    onDragStart(node, event)
  }

  const handleClick = (event) => {
    event.stopPropagation()
    onSelect(node)
  }

  const handleConnectionPointMouseDown = (event, handle) => {
    event.stopPropagation()
    event.preventDefault()
    onConnectionStart(node.id, handle, event)
  }

  const handleConnectionPointMouseUp = (event, handle) => {
    event.stopPropagation()
    if (isConnecting) {
      onConnectionEnd(node.id, handle)
    }
  }

  return (
    <div
      className={`flow-node ${node.type} ${selected ? "selected" : ""}`}
      style={{
        left: node.position.x,
        top: node.position.y,
        zIndex: selected ? 10 : 5,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <div className="node-content">
        <div className="node-header">
          <Icon className="node-icon" size={16} />
          <span className="node-label">{node.data.label}</span>
        </div>

        {node.type === "textMessage" && <div className="node-body">{node.data.message || "No message set"}</div>}
        

        {node.type === "question" && (
          <>
            <div className="node-body">{node.data.question || "No question set"}</div>
            {node.data.options && node.data.options.length > 0 && (
              <div className="node-options">
                {node.data.options.map((option, index) => (
                  <div key={index} className="node-option">
                    {option}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {node.type === "conditional" && (
          <div className="node-body">
            <div>If {node.data.condition || "condition"}</div>
            <div>
              {node.data.operator || "equals"} "{node.data.value || "value"}"
            </div>
          </div>
        )}

        {node.type === "delay" && <div className="node-body">Wait {node.data.duration || 2} seconds</div>}
        
      </div>

      {/* Connection points */}
      <div
        className="connection-point top input"
        onMouseDown={(e) => handleConnectionPointMouseDown(e, "input")}
        onMouseUp={(e) => handleConnectionPointMouseUp(e, "input")}
        title="Input connection"
      ></div>

      <div
        className="connection-point bottom output"
        onMouseDown={(e) => handleConnectionPointMouseDown(e, "output")}
        onMouseUp={(e) => handleConnectionPointMouseUp(e, "output")}
        title="Output connection"
      ></div>

      {node.type === "conditional" && (
        <>
          <div
            className="connection-point left true"
            onMouseDown={(e) => handleConnectionPointMouseDown(e, "true")}
            onMouseUp={(e) => handleConnectionPointMouseUp(e, "true")}
            title="True condition"
          ></div>
          <div
            className="connection-point right false"
            onMouseDown={(e) => handleConnectionPointMouseDown(e, "false")}
            onMouseUp={(e) => handleConnectionPointMouseUp(e, "false")}
            title="False condition"
          ></div>
        </>
      )}
    </div>
  )
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
  const [nodes, setNodes] = useState([
    {
      id: "start",
      type: "textMessage",
      position: { x: 250, y: 100 },
      data: {
        label: "Welcome Message",
        message: "Hello! Welcome to our chatbot. How can I help you today?",
      },
    },
  ])
  const [edges, setEdges] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [draggedNode, setDraggedNode] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStart, setConnectionStart] = useState(null)
  const [tempConnection, setTempConnection] = useState(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isSaving, setIsSaving] = useState(false)
  const canvasRef = useRef(null)

  const handleBackClick = () => {
    navigate("/dashboard")
  }

  useEffect(() => {
    const fetchBot = async () => {
      try {
        const docRef = doc(db, "webchat", id)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          const data = docSnap.data()
          setChatbot(data)
          
          if (data.flowData) {
            setNodes(data.flowData.nodes || [])
            setEdges(data.flowData.edges || [])
          }
        } else {
          console.error("No such chatbot!")
        }
      } catch (error) {
        console.error("Error fetching chatbot:", error)
      }
    }

    if (id) {
      fetchBot()
    }
  }, [id])

  const handleSaveFlow = async () => {
    if (!id || isSaving) return

    setIsSaving(true)
    try {
      const flowData = {
        nodes,
        edges,
        updatedAt: new Date().toISOString()
      }

      const docRef = doc(db, "webchat", id)
      await updateDoc(docRef, {
        flowData
      })

      alert("Flow saved successfully!")
    } catch (error) {
      console.error("Error saving flow:", error)
      alert("Error saving flow. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

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

  const addNode = useCallback((type, position) => {
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: getDefaultNodeData(type),
    }
    setNodes((nds) => [...nds, newNode])
  }, [])

  const updateNodeData = useCallback((nodeId, newData) => {
    setNodes((nds) => nds.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node)))
  }, [])

  const deleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId))
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))
    setSelectedNode(null)
  }, [])

  const handleNodeSelect = useCallback((node) => {
    setSelectedNode(node)
  }, [])

  const handleNodeDragStart = useCallback(
    (node, event) => {
      if (isConnecting) return

      const rect = event.currentTarget.getBoundingClientRect()
      setDraggedNode(node)
      setDragOffset({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      })
    },
    [isConnecting],
  )

  const handleNodeDrag = useCallback(
    (event) => {
      if (!draggedNode || !canvasRef.current || isConnecting) return

      const canvasRect = canvasRef.current.getBoundingClientRect()
      const newPosition = {
        x: event.clientX - canvasRect.left - dragOffset.x,
        y: event.clientY - canvasRect.top - dragOffset.y,
      }

      setNodes((nds) => nds.map((node) => (node.id === draggedNode.id ? { ...node, position: newPosition } : node)))
    },
    [draggedNode, dragOffset, isConnecting],
  )

  const handleNodeDragEnd = useCallback(() => {
    setDraggedNode(null)
    setDragOffset({ x: 0, y: 0 })
  }, [])

  const handleConnectionStart = useCallback((nodeId, handle, event) => {
    event.stopPropagation()
    setIsConnecting(true)
    setConnectionStart({ nodeId, handle })

    const canvasRect = canvasRef.current.getBoundingClientRect()
    setMousePosition({
      x: event.clientX - canvasRect.left,
      y: event.clientY - canvasRect.top,
    })
  }, [])

  const handleConnectionEnd = useCallback(
    (targetNodeId, targetHandle) => {
      if (!connectionStart || connectionStart.nodeId === targetNodeId) {
        setIsConnecting(false)
        setConnectionStart(null)
        setTempConnection(null)
        return
      }

      const isValidConnection =
        (connectionStart.handle === "output" && targetHandle === "input") ||
        (connectionStart.handle === "true" && targetHandle === "input") ||
        (connectionStart.handle === "false" && targetHandle === "input")

      if (isValidConnection) {
        const newEdge = {
          id: `edge-${Date.now()}`,
          source: connectionStart.nodeId,
          target: targetNodeId,
          sourceHandle: connectionStart.handle,
          targetHandle: targetHandle,
        }

        setEdges((eds) => [
          ...eds.filter(
            (edge) => !(edge.source === connectionStart.nodeId && edge.sourceHandle === connectionStart.handle),
          ),
          newEdge,
        ])
      }

      setIsConnecting(false)
      setConnectionStart(null)
      setTempConnection(null)
    },
    [connectionStart],
  )

  const handleCanvasMouseMove = useCallback(
    (event) => {
      if (isConnecting && canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect()
        setMousePosition({
          x: event.clientX - canvasRect.left,
          y: event.clientY - canvasRect.top,
        })
      }
    },
    [isConnecting],
  )

  const handleCanvasMouseUp = useCallback(() => {
    if (isConnecting) {
      setIsConnecting(false)
      setConnectionStart(null)
      setTempConnection(null)
    }
  }, [isConnecting])

  const handleCanvasDrop = useCallback(
    (event) => {
      event.preventDefault()
      const nodeType = event.dataTransfer.getData("application/nodeType")
      if (!nodeType || !canvasRef.current) return

      const canvasRect = canvasRef.current.getBoundingClientRect()
      const position = {
        x: event.clientX - canvasRect.left - 100,
        y: event.clientY - canvasRect.top - 50,
      }

      addNode(nodeType, position)
    },
    [addNode],
  )

  const handleCanvasDragOver = useCallback((event) => {
    event.preventDefault()
  }, [])

  const handlePaletteItemDrag = (event, nodeType) => {
    event.dataTransfer.setData("application/nodeType", nodeType)
    event.dataTransfer.effectAllowed = "move"
  }

  const handlePaletteItemClick = (type) => {
    const position = {
      x: Math.random() * 400 + 200,
      y: Math.random() * 300 + 200,
    }
    addNode(type, position)
  }

  const deleteEdge = useCallback((edgeId) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId))
  }, [])

  const getConnectionPointPosition = (nodeId, handle) => {
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return { x: 0, y: 0 }

    const nodeWidth = 200
    const nodeHeight = 80

    switch (handle) {
      case "input":
        return { x: node.position.x + nodeWidth / 2, y: node.position.y }
      case "output":
        return { x: node.position.x + nodeWidth / 2, y: node.position.y + nodeHeight }
      case "true":
        return { x: node.position.x, y: node.position.y + nodeHeight / 2 }
      case "false":
        return { x: node.position.x + nodeWidth, y: node.position.y + nodeHeight / 2 }
      default:
        return { x: node.position.x + nodeWidth / 2, y: node.position.y + nodeHeight / 2 }
    }
  }

  const getBezierPath = (start, end, sourceHandle) => {
    const midY = (start.y + end.y) / 2
    let cp1x, cp1y, cp2x, cp2y

    if (sourceHandle === "true" || sourceHandle === "false") {
      const midX = (start.x + end.x) / 2
      cp1x = midX
      cp1y = start.y
      cp2x = midX
      cp2y = end.y
    } else {
      const offset = Math.abs(end.y - start.y) / 2
      cp1x = start.x
      cp1y = start.y + offset
      cp2x = end.x
      cp2y = end.y - offset
    }

    return `M ${start.x},${start.y} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${end.x},${end.y}`
  }

  return (
    <div className="NodeFlowEditor">
      <div className="flow-controls">
        <span className="flow-title">WebChat Flow Builder</span>
        <span className="chatbot-title">{chatbot?.title || "Untitled WebChat"}</span>
        <div className="control-buttons">
          <div className="control-button" onClick={handleBackClick}>
            <ArrowLeft />
            <span>Back</span>
          </div>
          <div 
            className={`control-button ${isSaving ? 'saving' : ''}`} 
            onClick={handleSaveFlow}
            disabled={isSaving}
          >
            <Save />
            <span>{isSaving ? 'Saving...' : 'Save Flow'}</span>
          </div>
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
            <p>
              Tip: Drag nodes onto the canvas or click to add them. Click and drag connection points to create flows.
            </p>
          </div>
        </div>

        <div
          className="drag-drop-palette"
          ref={canvasRef}
          onDrop={handleCanvasDrop}
          onDragOver={handleCanvasDragOver}
          onMouseMove={draggedNode ? handleNodeDrag : handleCanvasMouseMove}
          onMouseUp={draggedNode ? handleNodeDragEnd : handleCanvasMouseUp}
          onClick={() => setSelectedNode(null)}
        >
          <svg className="connections-svg">
            {edges.map((edge) => {
              const sourcePos = getConnectionPointPosition(edge.source, edge.sourceHandle)
              const targetPos = getConnectionPointPosition(edge.target, edge.targetHandle)
              const path = getBezierPath(sourcePos, targetPos, edge.sourceHandle)

              return (
                <g key={edge.id}>
                  <path
                    d={path}
                    stroke={
                      edge.sourceHandle === "true"
                        ? "#22c55e"
                        : edge.sourceHandle === "false"
                        ? "#ef4444"
                        : "#6b7280"
                    }
                    strokeWidth="2"
                    fill="none"
                    className="connection-line"
                    onClick={() => deleteEdge(edge.id)}
                  />
                  <circle
                    cx={sourcePos.x}
                    cy={sourcePos.y}
                    r="4"
                    fill={
                      edge.sourceHandle === "true"
                        ? "#22c55e"
                        : edge.sourceHandle === "false"
                        ? "#ef4444"
                        : "#6b7280"
                    }
                    className="connection-endpoint"
                  />
                  <circle
                    cx={targetPos.x}
                    cy={targetPos.y}
                    r="4"
                    fill="#6b7280"
                    className="connection-endpoint"
                  />
                  {(edge.sourceHandle === "true" || edge.sourceHandle === "false") && (
                    <text
                      x={(sourcePos.x + targetPos.x) / 2}
                      y={(sourcePos.y + targetPos.y) / 2 - 10}
                      fill={edge.sourceHandle === "true" ? "#22c55e" : "#ef4444"}
                      fontSize="12"
                      textAnchor="middle"
                      className="connection-label"
                    >
                      {edge.sourceHandle}
                    </text>
                  )}
                </g>
              )
            })}

            {isConnecting && connectionStart && (
              <path
                d={getBezierPath(
                  getConnectionPointPosition(connectionStart.nodeId, connectionStart.handle),
                  mousePosition,
                  connectionStart.handle
                )}
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="5,5"
                fill="none"
                className="temp-connection"
              />
            )}
          </svg>

          {nodes.map((node) => (
            <FlowNode
              key={node.id}
              node={node}
              selected={selectedNode?.id === node.id}
              onSelect={handleNodeSelect}
              onDragStart={handleNodeDragStart}
              onConnectionStart={handleConnectionStart}
              onConnectionEnd={handleConnectionEnd}
              isConnecting={isConnecting}
              tempConnection={tempConnection}
            />
          ))}

          <div className="canvas-info">
            Nodes: {nodes.length} | Connections: {edges.length}
            {isConnecting && <div>Creating connection...</div>}
            
          </div>
        </div>

        <div className="node-property">
          <PropertiesPanel selectedNode={selectedNode} onUpdateNode={updateNodeData} onDeleteNode={deleteNode} />
        </div>
      </div>
    </div>
  )
}

export default NodeFlowEdit