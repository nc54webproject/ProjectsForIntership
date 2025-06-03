"use client"

import { Handle, Position } from "@xyflow/react"
import { Route } from "lucide-react"

export const RouterNode = ({ data, selected }) => {
  const routes = data.routes || []

  // Generate colors for different routes
  const getRouteColor = (index) => {
    const colors = [
      "#ef4444", // red
      "#f97316", // orange
      "#eab308", // yellow
      "#22c55e", // green
      "#3b82f6", // blue
      "#8b5cf6", // purple
      "#ec4899", // pink
      "#06b6d4", // cyan
    ]
    return colors[index % colors.length]
  }
  console.log("RouterNode", data.routes)
  return (
    <div style={{
      padding: "10px",
      borderRadius: "5px",
      border: selected ? "2px solid #6366f1" : "1px solid #ddd",
      backgroundColor: "white",
      boxShadow: selected ? "0 0 10px rgba(99, 102, 241, 0.3)" : "none",
      position: "relative",
      minWidth: "200px"
    }}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        style={{ background: "#6366f1", width: 12, height: 12 }}
      />

      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        marginBottom: "8px",
        color: "#6366f1",
        fontWeight: "bold"
      }}>
        <Route size={16} />
        <span>{data.label}</span>
      </div>

      <div style={{
        padding: "8px",
        backgroundColor: "#f8f9fa",
        borderRadius: "4px",
        fontSize: "14px"
      }}>
        <div style={{ marginBottom: "8px" }}>Routes: {routes.length}</div>
        {routes.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {routes.map((route, index) => (
              <div key={index} style={{ color: getRouteColor(index) }}>
                {route}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dynamic Output Handles for each route */}
      {routes.map((route, index) => {
        // Position handles around the bottom and sides
        let position = Position.Bottom
        const style = { background: getRouteColor(index), width: 12, height: 12 }

        if (routes.length > 3) {
          // For more routes, distribute around bottom, left, and right
          if (index < Math.ceil(routes.length / 3)) {
            position = Position.Bottom
          } else if (index < Math.ceil((routes.length * 2) / 3)) {
            position = Position.Right
          } else {
            position = Position.Left
          }
        }

        return (
          <Handle
            key={`route-${index}`}
            type="source"
            position={position}
            id={`route-${index}`}
            style={{
              ...style,
              [position === Position.Bottom ? "left" : position === Position.Right ? "top" : "top"]:
                position === Position.Bottom
                  ? `${20 + (index % Math.ceil(routes.length / 3)) * 25}%`
                  : position === Position.Right
                    ? `${20 + ((index - Math.ceil(routes.length / 3)) % Math.ceil(routes.length / 3)) * 25}%`
                    : `${20 + (index - Math.ceil((routes.length * 2) / 3)) * 25}%`,
            }}
          />
        )
      })}

      {/* Route labels */}
      <div style={{
        position: "absolute",
        bottom: "-25px",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        flexWrap: "wrap"
      }}>
        {routes.map((route, index) => (
          <span 
            key={index} 
            style={{ 
              color: getRouteColor(index),
              fontSize: "10px",
              backgroundColor: "white",
              padding: "2px 4px",
              borderRadius: "4px",
              border: `1px solid ${getRouteColor(index)}`
            }}
          >
            {route.length > 8 ? route.substring(0, 8) + "..." : route}
          </span>
        ))}
      </div>
    </div>
  )
}