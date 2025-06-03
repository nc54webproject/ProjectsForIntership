import React from "react";
import { Handle, Position } from "@xyflow/react";
import { XCircle } from "lucide-react";

const EndChatNode = ({ data, selected }) => {
  return (
    <div 
      className={`custom-node end-chat-node ${selected ? "selected" : ""}`}
      style={{
        padding: "10px",
        borderRadius: "5px",
        border: selected ? "2px solid #6366f1" : "1px solid #ddd",
        backgroundColor: "white",
        boxShadow: selected ? "0 0 10px rgba(99, 102, 241, 0.3)" : "none"
      }}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        style={{ background: "#6366f1", width: 12, height: 12 }}
      />

      <div 
        className="node-header"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          marginBottom: "8px",
          color: "#6366f1",
          fontWeight: "bold"
        }}
      >
        <XCircle className="node-icon" size={16} />
        <span className="node-label">{data.label}</span>
      </div>
      <div 
        className="node-body"
        style={{
          padding: "8px",
          backgroundColor: "#f8f9fa",
          borderRadius: "4px",
          fontSize: "14px"
        }}
      >
        {data.message || "Chat session ended"}
      </div>
    </div>
  );
};

export default EndChatNode;