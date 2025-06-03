import { doc, updateDoc, getDoc } from "firebase/firestore"
import { db } from "../firebase"

// Analyze flow to generate metadata
export const analyzeFlow = (nodes, edges) => {
  const nodeTypes = nodes.reduce((acc, node) => {
    acc[node.type] = (acc[node.type] || 0) + 1
    return acc
  }, {})

  const targetNodeIds = new Set(edges.map((edge) => edge.target))
  const sourceNodeIds = new Set(edges.map((edge) => edge.source))

  const startNodes = nodes.filter((node) => !targetNodeIds.has(node.id))
  const endNodes = nodes.filter(
    (node) => !sourceNodeIds.has(node.id) || node.type === "endChat"
  )

  return {
    hasStartNode: startNodes.length > 0,
    hasEndNode: endNodes.some((node) => node.type === "endChat"),
    totalQuestions: nodeTypes.question || 0,
    totalRouters: nodeTypes.router || 0,
    totalConditionals: nodeTypes.conditional || 0,
    totalTextMessages: nodeTypes.textMessage || 0,
    totalEndChats: nodeTypes.endChat || 0,
  }
}

// Save flow to Firestore
export const saveFlowToFirestore = async (chatbotId, nodes, edges, additionalData = {}) => {
  try {
    const now = new Date()
    const flowMetadata = analyzeFlow(nodes, edges)

    const flowData = {
      nodes: nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          lastModified: now.toISOString(),
        },
      })),
      edges: edges.map((edge) => ({
        ...edge,
        lastModified: now.toISOString(),
      })),
      lastModified: now.toISOString(),
      nodeCount: nodes.length,
      edgeCount: edges.length,
      flowMetadata,
    }

    const docRef = doc(db, "webchat", chatbotId)
    const docSnap = await getDoc(docRef)
    const currentData = docSnap.exists() ? docSnap.data() : {}

    const updateData = {
      ...currentData,
      flowData,
      updatedAt: now,
      version: (currentData.version || 0) + 1,
      ...additionalData,
    }

    await updateDoc(docRef, updateData)

    console.log("Flow saved successfully to Firestore:", {
      chatbotId,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      flowMetadata,
    })

    return true
  } catch (error) {
    console.error("Error saving flow to Firestore:", error)
    throw error
  }
}

// Load flow from Firestore
export const loadFlowFromFirestore = async (chatbotId) => {
  try {
    const docRef = doc(db, "webchat", chatbotId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return data.flowData || null
    }

    return null
  } catch (error) {
    console.error("Error loading flow from Firestore:", error)
    throw error
  }
}

// Validate flow before saving
export const validateFlow = (nodes, edges) => {
  const errors = []

  const hasTextMessage = nodes.some((node) => node.type === "textMessage")
  if (!hasTextMessage) {
    errors.push("Flow must have at least one Text Message node")
  }

  const hasEndChat = nodes.some((node) => node.type === "endChat")
  if (!hasEndChat) {
    errors.push("Flow must have at least one End Chat node")
  }

  if (edges.length === 0 && nodes.length > 1) {
    errors.push("Flow must have connections between nodes")
  }

  if (nodes.length > 1) {
    const connectedNodeIds = new Set([
      ...edges.map((edge) => edge.source),
      ...edges.map((edge) => edge.target),
    ])

    const orphanedNodes = nodes.filter((node) => !connectedNodeIds.has(node.id))
    if (orphanedNodes.length > 1) {
      errors.push(`Found ${orphanedNodes.length} disconnected nodes`)
    }
  }

  const questionNodes = nodes.filter((node) => node.type === "question")
  for (const questionNode of questionNodes) {
    if (!questionNode.data.options || questionNode.data.options.length === 0) {
      errors.push(`Question node "${questionNode.data.label}" must have at least one option`)
    }
  }

  const routerNodes = nodes.filter((node) => node.type === "router")
  for (const routerNode of routerNodes) {
    if (!routerNode.data.routes || routerNode.data.routes.length === 0) {
      errors.push(`Router node "${routerNode.data.label}" must have at least one route`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Export flow data for backup/sharing
export const exportFlowData = (nodes, edges, chatbotInfo) => {
  const flowData = {
    chatbotInfo: {
      title: chatbotInfo.title,
      description: chatbotInfo.description,
      exportedAt: new Date().toISOString(),
    },
    flowData: {
      nodes,
      edges,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      flowMetadata: analyzeFlow(nodes, edges),
    },
  }

  return JSON.stringify(flowData, null, 2)
}
