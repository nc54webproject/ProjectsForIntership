import React from "react";
import { Zap, MessageSquare, CircleHelp, GitBranch, Clock4, Lightbulb } from "lucide-react";

export const NodePalette = ({ onDragStart, onNodeClick }) => {
  return (
    <div className="node-palette">
      <div className="palette-container">
        <div className="palette-header">
          <Zap />
          <h1>Node Palette</h1>
        </div>

        <div
          className="palette-item text-message"
          draggable
          onDragStart={(e) => onDragStart(e, "textMessage")}
          onClick={() => onNodeClick("textMessage")}
        >
          <MessageSquare />
          <div className="palette-item-content">
            <h3>Text Message</h3>
            <p>Send a text message to the user</p>
          </div>
        </div>

        <div
          className="palette-item question"
          draggable
          onDragStart={(e) => onDragStart(e, "question")}
          onClick={() => onNodeClick("question")}
        >
          <CircleHelp />
          <div className="palette-item-content">
            <h3>Question</h3>
            <p>Ask the question with multiple choice options</p>
          </div>
        </div>

        <div
          className="palette-item conditional"
          draggable
          onDragStart={(e) => onDragStart(e, "conditional")}
          onClick={() => onNodeClick("conditional")}
        >
          <GitBranch />
          <div className="palette-item-content">
            <h3>Condition</h3>
            <p>Branch the flow based on the condition</p>
          </div>
        </div>

        <div
          className="palette-item delay"
          draggable
          onDragStart={(e) => onDragStart(e, "delay")}
          onClick={() => onNodeClick("delay")}
        >
          <Clock4 />
          <div className="palette-item-content">
            <h3>Delay</h3>
            <p>Add a delay before the next message</p>
          </div>
        </div>
      </div>

      <div className="palette-tip">
        <Lightbulb />
        <p>Tip: Drag nodes onto the canvas or click to add them. Drag from connection handles to create flows.</p>
      </div>
    </div>
  );
};