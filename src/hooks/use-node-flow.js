"use client"

import { useCallback, useMemo } from "react"
import { addEdge, useNodesState, useEdgesState } from "@xyflow/react"

export const useNodeFlow = () => {
  // Default initial nodes
  const defaultNodes = useMemo(
    () => [
      {
        id: "start",
        type: "textMessage",
        position: { x: 250, y: 100 },
        data: {
          label: "Welcome Message",
          message: "Hello! Welcome to our chatbot. How can I help you today?",
        },
        deletable: true,
        selectable: true,
      },
    ],
    []
  )

  // ReactFlow state management
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

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
      case "router":
        return {
          label: "Router",
          routes: ["Route 1", "Route 2"],
        }
      case "delay":
        return {
          label: "Delay",
          duration: 2,
        }
      case "collectInput":
        return {
          label: "Collect Input",
          prompt: "Please enter your response:",
          inputType: "text",
          variable: "user_input",
          required: true,
        }
      case "apiIntegration":
        return {
          label: "API Integration",
          url: "",
          method: "GET",
          description: "API call description",
          headers: "",
          body: "",
        }
      case "broadcast":
        return {
          label: "Broadcast",
          message: "Broadcast message to users",
          audience: "all",
          tags: [],
        }
      case "tag":
        return {
          label: "Tag User",
          action: "add",
          tags: ["new_tag"],
        }
      case "endChat":
        return { label: "End Chat", message: "Thank you for chatting with us. Have a great day!" }
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
        deletable: true,
        selectable: true,
      }
      setNodes((nds) => [...nds, newNode])
    },
    [setNodes]
  )

  const updateNodeData = useCallback(
    (nodeId, newData) => {
      setNodes((nds) =>
        nds.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node))
      )
    },
    [setNodes]
  )

  const deleteNode = useCallback(
    (nodeId) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId))
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))
    },
    [setNodes, setEdges]
  )

  const onConnect = useCallback(
    (params) => {
      console.log("Connection params:", params)

      // Prevent self-connections
      if (params.source === params.target) {
        return
      }

      // Create edge with custom styling based on source handle
      let edgeStyle = {}
      let edgeLabel = ""

      if (params.sourceHandle === "true") {
        edgeStyle = { stroke: "#22c55e", strokeWidth: 2 }
        edgeLabel = "TRUE"
      } else if (params.sourceHandle === "false") {
        edgeStyle = { stroke: "#ef4444", strokeWidth: 2 }
        edgeLabel = "FALSE"
      } else if (params.sourceHandle === "success") {
        edgeStyle = { stroke: "#22c55e", strokeWidth: 2 }
        edgeLabel = "SUCCESS"
      } else if (params.sourceHandle === "error") {
        edgeStyle = { stroke: "#ef4444", strokeWidth: 2 }
        edgeLabel = "ERROR"
      } else if (params.sourceHandle?.startsWith("route-")) {
        // For router handles, use different colors
        const routeIndex = parseInt(params.sourceHandle.split("-")[1])
        const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4"]
        edgeStyle = { stroke: colors[routeIndex % colors.length], strokeWidth: 2 }
        edgeLabel = `Route ${routeIndex + 1}`
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
        deletable: true,
        selectable: true,
      }

      setEdges((eds) => addEdge(newEdge, eds))
    },
    [setEdges]
  )

  return {
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
  }
}