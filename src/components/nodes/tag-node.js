import { Handle, Position } from "@xyflow/react";
import { Tag } from "lucide-react";

export const TagNode = ({ data, selected }) => {
  return (
    <div className={`custom-node tag-node ${selected ? "selected" : ""}`}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        style={{ background: "#6366f1", width: 12, height: 12 }}
      />

      <div className="node-header">
        <Tag className="node-icon" size={16} />
        <span className="node-label">{data.label}</span>
      </div>
      
      <div className="node-body">
        <div className="tag-action">
          <strong>Action:</strong> {data.action || "Add Tag"}
        </div>
        {data.tags && data.tags.length > 0 && (
          <div className="tag-list">
            {data.tags.map((tag, index) => (
              <span key={index} className="tag-item">
                {tag}
              </span>
            ))}
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