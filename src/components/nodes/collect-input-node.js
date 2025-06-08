import { Handle, Position } from "@xyflow/react";
import { FileText } from "lucide-react";

export const CollectInputNode = ({ data, selected }) => {
  return (
    <div className={`custom-node collect-input-node ${selected ? "selected" : ""}`}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        style={{ background: "#6366f1", width: 12, height: 12 }}
      />

      <div className="node-header">
        <FileText className="node-icon" size={16} />
        <span className="node-label">{data.label}</span>
      </div>
      
      <div className="node-body">
        <div className="input-field">
          <strong>Prompt:</strong> {data.prompt || "Enter your response..."}
        </div>
        <div className="input-type">
          <strong>Type:</strong> {data.inputType || "text"}
        </div>
        {data.variable && (
          <div className="variable-name">
            <strong>Save to:</strong> {data.variable}
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