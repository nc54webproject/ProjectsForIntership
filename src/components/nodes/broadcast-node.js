import { Handle, Position } from "@xyflow/react";
import { Radio } from "lucide-react";

export const BroadcastNode = ({ data, selected }) => {
  return (
    <div className={`custom-node broadcast-node ${selected ? "selected" : ""}`}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        style={{ background: "#6366f1", width: 12, height: 12 }}
      />

      <div className="node-header">
        <Radio className="node-icon" size={16} />
        <span className="node-label">{data.label}</span>
      </div>
      
      <div className="node-body">
        <div className="broadcast-message">
          {data.message || "Broadcast message..."}
        </div>
        <div className="broadcast-audience">
          <strong>To:</strong> {data.audience || "All users"}
        </div>
        {data.tags && data.tags.length > 0 && (
          <div className="broadcast-tags">
            <strong>Tags:</strong> {data.tags.join(", ")}
          </div>
        )}
      </div>

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