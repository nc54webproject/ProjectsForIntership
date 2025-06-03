"use client"

import { useEffect, useState } from "react"
import { Settings, Plus, Trash2, RefreshCw } from "lucide-react"

export const PropertiesPanel = ({ selectedNode, onUpdateNode, onDeleteNode, nodes, edges }) => {
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

  const addRoute = () => {
    const newRoutes = [...(localData.routes || []), `Route ${(localData.routes?.length || 0) + 1}`]
    handleUpdate("routes", newRoutes)
  }

  const removeRoute = (index) => {
    const newRoutes = localData.routes.filter((_, i) => i !== index)
    handleUpdate("routes", newRoutes)
  }

  const updateRoute = (index, value) => {
    const newRoutes = [...localData.routes]
    newRoutes[index] = value
    handleUpdate("routes", newRoutes)
  }

  const syncWithConnectedQuestion = () => {
    if (!selectedNode || selectedNode.type !== "router") return

    const incomingEdge = edges.find((edge) => edge.target === selectedNode.id)
    if (!incomingEdge) return

    const sourceNode = nodes.find((node) => node.id === incomingEdge.source)
    if (!sourceNode || sourceNode.type !== "question") return

    const questionOptions = sourceNode.data.options || []
    handleUpdate("routes", [...questionOptions])
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
            <div className="guide-item"><div className="handle-demo input"></div><span>Input (Blue)</span></div>
            <div className="guide-item"><div className="handle-demo output"></div><span>Output (Purple)</span></div>
            <div className="guide-item"><div className="handle-demo true"></div><span>True (Green)</span></div>
            <div className="guide-item"><div className="handle-demo false"></div><span>False (Red)</span></div>
            <div className="guide-item"><div className="handle-demo router"></div><span>Router (Colors)</span></div>
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

        {selectedNode.type === "router" && (
          <div className="property-group">
            <div className="options-header">
              <label>Route Paths</label>
              <div className="router-controls">
                <button onClick={syncWithConnectedQuestion} className="sync-routes-btn" title="Sync with connected question">
                  <RefreshCw size={16} />
                </button>
                <button onClick={addRoute} className="add-option-btn">
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <p className="helper-text">Each route corresponds to a question option</p>
            <div className="options-list">
              {(localData.routes || []).map((route, index) => (
                <div key={index} className="option-input">
                  <input
                    type="text"
                    value={route}
                    onChange={(e) => updateRoute(index, e.target.value)}
                    placeholder={`Route ${index + 1}`}
                    className="property-input"
                  />
                  <button onClick={() => removeRoute(index)} className="remove-option-btn">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedNode.type === "conditional" && (
          <>
            <div className="property-group">
              <label>Condition Variable</label>
              <input
                type="text"
                value={localData.condition || ""}
                onChange={(e) => handleUpdate("condition", e.target.value)}
                placeholder="e.g., user_input"
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

        {selectedNode.type === "endChat" && (
          <div className="property-group">
            <label>End Message</label>
            <textarea
              value={localData.message || ""}
              onChange={(e) => handleUpdate("message", e.target.value)}
              placeholder="Enter end chat message..."
              rows={4}
              className="property-textarea"
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
