import { Handle, Position } from "@xyflow/react";
import { MessageSquare } from "lucide-react";

export const TextMessageNode = ({ data, selected }) => {
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
  );
};