import { Handle, Position } from "@xyflow/react";
import { Globe } from "lucide-react";

export const ApiIntegrationNode = ({ data, selected }) => {
  return (
    <div className={`custom-node api-integration-node ${selected ? "selected" : ""}`}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        style={{ background: "#6366f1", width: 12, height: 12 }}
      />

      <div className="node-header">
        <Globe className="node-icon" size={16} />
        <span className="node-label">{data.label}</span>
      </div>
      
      <div className="node-body">
        <div className="api-method">
          <strong>{data.method || "GET"}</strong> {data.url || "API URL"}
        </div>
        {data.description && (
          <div className="api-description">{data.description}</div>
        )}
      </div>

      {/* Output Handles */}
      <Handle
        type="source"
        position={Position.Left}
        id="success"
        style={{ background: "#22c55e", width: 12, height: 12 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="error"
        style={{ background: "#ef4444", width: 12, height: 12 }}
      />

      {/* Labels */}
      <div className="api-labels">
        <span className="success-label">SUCCESS</span>
        <span className="error-label">ERROR</span>
      </div>
    </div>
  );
};