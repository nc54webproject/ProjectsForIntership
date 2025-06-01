"use client";

import React from "react";
import PropTypes from "prop-types";
import { Handle, Position } from "@xyflow/react";
import { GitBranch } from "lucide-react";

export const ConditionalNode = ({ data, selected }) => {
  return (
    <div className={`custom-node conditional-node ${selected ? "selected" : ""}`}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        style={{ background: "#6366f1", width: 12, height: 12 }}
      />

      <div className="node-header">
        <GitBranch className="node-icon" size={16} />
        <span className="node-label">{data.label}</span>
      </div>

      <div className="node-body">
        <div>If {data.condition || "condition"}</div>
        <div>
          {data.operator || "equals"} "{data.value || "value"}"
        </div>
      </div>

      {/* True Handle */}
      <Handle
        type="source"
        position={Position.Left}
        id="true"
        style={{ background: "#22c55e", width: 12, height: 12 }}
      />

      {/* False Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        style={{ background: "#ef4444", width: 12, height: 12 }}
      />

      {/* Labels */}
      <div className="conditional-labels">
        <span className="true-label">TRUE</span>
        <span className="false-label">FALSE</span>
      </div>
    </div>
  );
};

ConditionalNode.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
    condition: PropTypes.string,
    operator: PropTypes.string,
    value: PropTypes.string,
  }).isRequired,
  selected: PropTypes.bool.isRequired,
};
