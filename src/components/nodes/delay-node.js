import { Handle, Position } from "@xyflow/react";
import { Clock4 } from "lucide-react";

export const DelayNode = ({ data, selected }) => {
  return (
    <div className={`custom-node delay-node ${selected ? "selected" : ""}`}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        style={{ background: "#6366f1", width: 12, height: 12 }}
      />

      <div className="node-header">
        <Clock4 className="node-icon" size={16} />
        <span className="node-label">{data.label}</span>
      </div>
      <div className="node-body">Wait {data.duration || 2} seconds</div>

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