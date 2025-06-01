import { Handle, Position } from "@xyflow/react";
import { CircleHelp } from "lucide-react";

export const QuestionNode = ({ data, selected }) => {
  return (
    <div className={`custom-node question-node ${selected ? "selected" : ""}`}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        style={{ background: "#6366f1", width: 12, height: 12 }}
      />

      <div className="node-header">
        <CircleHelp className="node-icon" size={16} />
        <span className="node-label">{data.label}</span>
      </div>
      
      <div className="node-body">{data.question || "No question set"}</div>
      
      {data.options && data.options.length > 0 && (
        <div className="node-options">
          {data.options.map((option, index) => (
            <div key={index} className="node-option">
              {option}
            </div>
          ))}
        </div>
      )}

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