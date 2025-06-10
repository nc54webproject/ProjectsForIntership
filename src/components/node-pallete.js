'use client';

import React from 'react';
import {
  Zap,
  MessageSquare,
  CircleHelp,
  GitBranch,
  XCircle,
  Route,
  Lightbulb,
  Clock4,
  FileText,
  Globe,
  Radio,
  Tag,
} from 'lucide-react';

export const NodePalette = ({ onDragStart, onNodeClick }) => {
  return (
    <div className="node-palette">
      <div className="palette-container">
        <div className="palette-header">
          <Zap />
          <h1>Node Palette</h1>
        </div>

        {/* Basic Nodes */}
        <div className="palette-section">
          <h3>Basic Nodes</h3>

          <div
            className="palette-item text-message"
            draggable
            onDragStart={(e) => onDragStart(e, 'textMessage')}
            onClick={() => onNodeClick('textMessage')}
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
            onDragStart={(e) => onDragStart(e, 'question')}
            onClick={() => onNodeClick('question')}
          >
            <CircleHelp />
            <div className="palette-item-content">
              <h3>Question</h3>
              <p>Ask the question with multiple choice options</p>
            </div>
          </div>

          <div
            className="palette-item collect-input"
            draggable
            onDragStart={(e) => onDragStart(e, 'collectInput')}
            onClick={() => onNodeClick('collectInput')}
          >
            <FileText />
            <div className="palette-item-content">
              <h3>Collect Input</h3>
              <p>Collect user input and save to variable</p>
            </div>
          </div>
        </div>

        {/* Flow Control */}
        <div className="palette-section">
          <h3>Flow Control</h3>

          <div
            className="palette-item router"
            draggable
            onDragStart={(e) => onDragStart(e, 'router')}
            onClick={() => onNodeClick('router')}
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
            onDragStart={(e) => onDragStart(e, 'conditional')}
            onClick={() => onNodeClick('conditional')}
          >
            <GitBranch />
            <div className="palette-item-content">
              <h3>Condition</h3>
              <p>Simple true/false branching logic</p>
            </div>
          </div>

          <div
            className="palette-item delay"
            draggable
            onDragStart={(e) => onDragStart(e, 'delay')}
            onClick={() => onNodeClick('delay')}
          >
            <Clock4 />
            <div className="palette-item-content">
              <h3>Delay</h3>
              <p>Add a time delay before next action</p>
            </div>
          </div>
        </div>

        {/* Advanced Nodes */}
        <div className="palette-section">
          <h3>Advanced</h3>

          <div
            className="palette-item api-integration"
            draggable
            onDragStart={(e) => onDragStart(e, 'apiIntegration')}
            onClick={() => onNodeClick('apiIntegration')}
          >
            <Globe />
            <div className="palette-item-content">
              <h3>API Integration</h3>
              <p>Connect to external APIs and services</p>
            </div>
          </div>

          <div
            className="palette-item broadcast"
            draggable
            onDragStart={(e) => onDragStart(e, 'broadcast')}
            onClick={() => onNodeClick('broadcast')}
          >
            <Radio />
            <div className="palette-item-content">
              <h3>Broadcast</h3>
              <p>Send messages to multiple users</p>
            </div>
          </div>

          <div
            className="palette-item tag"
            draggable
            onDragStart={(e) => onDragStart(e, 'tag')}
            onClick={() => onNodeClick('tag')}
          >
            <Tag />
            <div className="palette-item-content">
              <h3>Tag User</h3>
              <p>Add or remove tags from users</p>
            </div>
          </div>

          <div
            className="palette-item end-chat"
            draggable
            onDragStart={(e) => onDragStart(e, 'endChat')}
            onClick={() => onNodeClick('endChat')}
          >
            <XCircle />
            <div className="palette-item-content">
              <h3>End Chat</h3>
              <p>End the chat session</p>
            </div>
          </div>
        </div>
      </div>

      <div className="palette-tip">
        <Lightbulb />
        <p>
          Tip: Use <strong>Router</strong> after Questions with multiple
          options. Use <strong>Condition</strong> for simple true/false logic.
          <strong>Collect Input</strong> to gather user data.
        </p>
      </div>
    </div>
  );
};
