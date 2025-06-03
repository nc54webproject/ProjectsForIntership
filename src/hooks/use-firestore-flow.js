"use client"

import { useState, useCallback } from "react"
import {
  saveFlowToFirestore,
  loadFlowFromFirestore,
  validateFlow,
  analyzeFlow,
} from "../utils/firestore-helpers"

export const useFirestoreFlow = (chatbotId) => {
  const [saveStatus, setSaveStatus] = useState("idle") // "idle" | "saving" | "saved" | "error"
  const [loadStatus, setLoadStatus] = useState("idle") // "idle" | "loading" | "loaded" | "error"
  const [lastSavedTime, setLastSavedTime] = useState(null)
  const [validationErrors, setValidationErrors] = useState([])

  // Save flow with validation
  const saveFlow = useCallback(
    async (nodes, edges, additionalData) => {
      try {
        setSaveStatus("saving")
        setValidationErrors([])

        // Validate flow before saving
        const validation = validateFlow(nodes, edges)
        if (!validation.isValid) {
          setValidationErrors(validation.errors)
          setSaveStatus("error")
          return false
        }

        // Save to Firestore
        await saveFlowToFirestore(chatbotId, nodes, edges, additionalData)

        setLastSavedTime(new Date())
        setSaveStatus("saved")

        setTimeout(() => {
          setSaveStatus("idle")
        }, 2000)

        return true
      } catch (error) {
        console.error("Error saving flow:", error)
        setSaveStatus("error")

        setTimeout(() => {
          setSaveStatus("idle")
        }, 3000)

        return false
      }
    },
    [chatbotId],
  )

  // Load flow from Firestore
  const loadFlow = useCallback(async () => {
    try {
      setLoadStatus("loading")

      const flowData = await loadFlowFromFirestore(chatbotId)

      setLoadStatus("loaded")
      return flowData
    } catch (error) {
      console.error("Error loading flow:", error)
      setLoadStatus("error")
      throw error
    }
  }, [chatbotId])

  // Auto-save functionality
  const autoSave = useCallback(
    async (nodes, edges, debounceMs = 2000) => {
      const timeoutId = setTimeout(async () => {
        try {
          await saveFlowToFirestore(chatbotId, nodes, edges, {
            autoSaved: true,
            autoSavedAt: new Date(),
          })
          console.log("Auto-saved flow")
        } catch (error) {
          console.error("Auto-save failed:", error)
        }
      }, debounceMs)

      return () => clearTimeout(timeoutId)
    },
    [chatbotId],
  )

  // Get flow statistics
  const getFlowStats = useCallback((nodes, edges) => {
    return analyzeFlow(nodes, edges)
  }, [])

  return {
    saveFlow,
    loadFlow,
    autoSave,
    getFlowStats,
    saveStatus,
    loadStatus,
    lastSavedTime,
    validationErrors,
  }
}
