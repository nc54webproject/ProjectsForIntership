"use client";

import { useCallback, useMemo } from "react";
import { addEdge, useNodesState, useEdgesState } from "@xyflow/react";

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
      },
    ],
    []
  );

  // ReactFlow state management
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const getDefaultNodeData = (type) => {
    switch (type) {
      case "textMessage":
        return { label: "Text Message", message: "Enter your message here..." };
      case "question":
        return {
          label: "Question",
          question: "What would you like to know?",
          options: ["Option 1", "Option 2"],
        };
      case "conditional":
        return {
          label: "Conditional",
          condition: "user_input",
          operator: "equals",
          value: "",
        };
      case "delay":
        return { label: "Delay", duration: 2 };
      default:
        return { label: "Node" };
    }
  };

  const addNode = useCallback((type, position) => {
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: getDefaultNodeData(type),
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const updateNodeData = useCallback((nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      )
    );
  }, [setNodes]);

  const deleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  const onConnect = useCallback((params) => {
    console.log("Connection params:", params);

    let edgeStyle = {};
    let edgeLabel = "";

    if (params.sourceHandle === "true") {
      edgeStyle = { stroke: "#22c55e", strokeWidth: 2 };
      edgeLabel = "TRUE";
    } else if (params.sourceHandle === "false") {
      edgeStyle = { stroke: "#ef4444", strokeWidth: 2 };
      edgeLabel = "FALSE";
    } else {
      edgeStyle = { stroke: "#6b7280", strokeWidth: 2 };
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
    };

    setEdges((eds) => addEdge(newEdge, eds));
  }, [setEdges]);

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
  };
};
