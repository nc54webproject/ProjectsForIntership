"use client";

import React from "react";
import {
  Zap,
  MessageSquare,
  CircleHelp,
  GitBranch,
  XCircle,
  Route,
  Lightbulb,
} from "lucide-react";

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
          className="palette-item router"
          draggable
          onDragStart={(e) => onDragStart(e, "router")}
          onClick={() => onNodeClick("router")}
        >
          <Route />
          <div className="palette-item-content">
            <h3>Router</h3>
            <p>Branch to multiple paths based on selection</p>
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
            <p>Simple true/false branching logic</p>
          </div>
        </div>

        <div
          className="palette-item end-chat"
          draggable
          onDragStart={(e) => onDragStart(e, "endChat")}
          onClick={() => onNodeClick("endChat")}
        >
          <XCircle />
          <div className="palette-item-content">
            <h3>End Chat</h3>
            <p>End the chat session</p>
          </div>
        </div>
      </div>

      <div className="palette-tip">
        <Lightbulb />
        <p>
          Tip: Use <strong>Router</strong> after Questions with multiple
          options. Use <strong>Condition</strong> for simple true/false logic.
        </p>
      </div>
    </div>
  );
};
