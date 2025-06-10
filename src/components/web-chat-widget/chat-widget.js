import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import "./chat-widget.css";

export const ChatWidget = ({ 
  chatbotId, 
  nodes = [], 
  edges = [], 
  isEmbedded = false,
  onClose 
}) => {
  const [isOpen, setIsOpen] = useState(!isEmbedded);
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  // eslint-disable-next-line 
  const [userVariables, setUserVariables] = useState({});
  const [isMinimized, setIsMinimized] = useState(false);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [currentInputNode, setCurrentInputNode] = useState(null);
  const messagesEndRef = useRef(null);

  // Initialize chat
  useEffect(() => {
    if (nodes.length > 0 && !currentNodeId) {
      const startNode = findStartNode(nodes, edges);
      if (startNode) {
        setCurrentNodeId(startNode.id);
        // Add welcome message
        setMessages([{
          id: Date.now(),
          type: "bot",
          content: "Chat started",
          timestamp: new Date(),
        }]);
      }
    }
  }, [nodes, edges, currentNodeId]);

  // Process current node
  useEffect(() => {
    if (!currentNodeId || chatEnded || waitingForInput) return;

    const currentNode = nodes.find((node) => node.id === currentNodeId);
    if (!currentNode) return;

    setIsTyping(true);

    const timer = setTimeout(() => {
      setIsTyping(false);
      processNode(currentNode);
    }, 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line 
  }, [currentNodeId, nodes, edges, chatEnded, waitingForInput]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const findStartNode = (nodes, edges) => {
    const targetNodeIds = new Set(edges.map((edge) => edge.target));
    const possibleStartNodes = nodes.filter((node) => !targetNodeIds.has(node.id));
    return possibleStartNodes.find((node) => node.type === "textMessage") || possibleStartNodes[0];
  };

  const processNode = (node) => {
    switch (node.type) {
      case "textMessage":
        addBotMessage(node.data.message || "No message set");
        moveToNextNode(node.id);
        break;
      
      case "question":
        addBotMessage(node.data.question || "No question set", node.data.options);
        break;
      
      case "collectInput":
        addBotMessage(node.data.prompt || "Please enter your response:");
        setWaitingForInput(true);
        setCurrentInputNode(node);
        break;
      
      case "delay":
        const duration = (node.data.duration || 2) * 1000;
        setTimeout(() => {
          moveToNextNode(node.id);
        }, duration);
        break;
      
      case "tag":
        addBotMessage(`✅ Tagged with: ${(node.data.tags || []).join(", ")}`);
        moveToNextNode(node.id);
        break;
      
      case "broadcast":
        addBotMessage(`📢 ${node.data.message || "Broadcast message"}`);
        moveToNextNode(node.id);
        break;
      
      case "apiIntegration":
        addBotMessage("🔄 Processing...");
        setTimeout(() => {
          addBotMessage("✅ Request completed!");
          moveToNextNode(node.id);
        }, 2000);
        break;
      
      case "endChat":
        addBotMessage(node.data.message || "Chat session ended");
        setChatEnded(true);
        break;
      
      default:
        moveToNextNode(node.id);
        break;
    }
  };

  const addBotMessage = (content, options = null) => {
    const message = {
      id: Date.now(),
      type: "bot",
      content,
      options,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const addUserMessage = (content) => {
    const message = {
      id: Date.now(),
      type: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const moveToNextNode = (currentNodeId) => {
    const nextNodeId = findNextNodeId(currentNodeId, edges);
    if (nextNodeId) {
      setCurrentNodeId(nextNodeId);
    }
  };

  const findNextNodeId = (currentNodeId, edges) => {
    const outgoingEdges = edges.filter((edge) => edge.source === currentNodeId);
    return outgoingEdges.length > 0 ? outgoingEdges[0].target : null;
  };

  const handleOptionSelect = (option) => {
    addUserMessage(option);
    
    const currentNode = nodes.find((node) => node.id === currentNodeId);
    if (!currentNode) return;

    // Handle routing based on node type
    const outgoingEdges = edges.filter((edge) => edge.source === currentNodeId);
    
    if (outgoingEdges.length > 0) {
      const nextNodeId = outgoingEdges[0].target;
      const nextNode = nodes.find((node) => node.id === nextNodeId);

      if (nextNode && nextNode.type === "router") {
        handleRouterLogic(nextNode, option);
      } else if (nextNode && nextNode.type === "conditional") {
        handleConditionalLogic(nextNode, option);
      } else {
        setCurrentNodeId(nextNodeId);
      }
    }
  };

  const handleRouterLogic = (routerNode, userInput) => {
    const routes = routerNode.data.routes || [];
    const routeIndex = routes.findIndex((route) => route === userInput);

    if (routeIndex !== -1) {
      const routeEdge = edges.find(
        (edge) => edge.source === routerNode.id && edge.sourceHandle === `route-${routeIndex}`
      );
      if (routeEdge) {
        setCurrentNodeId(routeEdge.target);
      }
    }
  };

  const handleConditionalLogic = (conditionalNode, userInput) => {
    const conditionValue = conditionalNode.data.value;
    const conditionOperator = conditionalNode.data.operator || "equals";

    let conditionMet = false;
    switch (conditionOperator) {
      case "equals":
        conditionMet = userInput === conditionValue;
        break;
      case "contains":
        conditionMet = userInput.includes(conditionValue);
        break;
      case "starts_with":
        conditionMet = userInput.startsWith(conditionValue);
        break;
      case "ends_with":
        conditionMet = userInput.endsWith(conditionValue);
        break;
      default:
        conditionMet = userInput === conditionValue;
    }

    const nextEdge = edges.find(
      (edge) => edge.source === conditionalNode.id && 
      edge.sourceHandle === (conditionMet ? "true" : "false")
    );
    
    if (nextEdge) {
      setCurrentNodeId(nextEdge.target);
    }
  };

  const handleTextInput = (e) => {
    e.preventDefault();
    if (!currentInput.trim() || !waitingForInput || !currentInputNode) return;

    addUserMessage(currentInput);

    // Save to variables if it's a collectInput node
    if (currentInputNode.data.variable) {
      setUserVariables(prev => ({
        ...prev,
        [currentInputNode.data.variable]: currentInput
      }));
    }

    setCurrentInput("");
    setWaitingForInput(false);
    setCurrentInputNode(null);
    moveToNextNode(currentInputNode.id);
  };

  const resetChat = () => {
    setMessages([]);
    setChatEnded(false);
    setUserVariables({});
    setCurrentInput("");
    setWaitingForInput(false);
    setCurrentInputNode(null);
    const startNode = findStartNode(nodes, edges);
    if (startNode) {
      setCurrentNodeId(startNode.id);
    }
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (isEmbedded) {
    return (
      <div className="chat-widget-embedded">
        <div className="chat-widget-container">
          <div className="chat-header">
            <div className="chat-title">
              <MessageCircle size={20} />
              <span>Chat Support</span>
            </div>
            {onClose && (
              <button className="close-chat" onClick={onClose}>
                <X size={18} />
              </button>
            )}
          </div>

          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.type}`}>
                <div className="message-content">
                  {message.content}
                  {message.options && (
                    <div className="message-options">
                      {message.options.map((option, index) => (
                        <button
                          key={index}
                          className="option-button"
                          onClick={() => handleOptionSelect(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message bot">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {!chatEnded && !waitingForInput && (
            <div className="chat-input">
              <div style={{ padding: "16px", textAlign: "center", color: "#6b7280" }}>
                Waiting for bot response...
              </div>
            </div>
          )}

          {waitingForInput && !chatEnded && (
            <div className="chat-input">
              <form onSubmit={handleTextInput}>
                <input
                  type={currentInputNode?.data.inputType || "text"}
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="Type your message..."
                  className="input-field"
                  required={currentInputNode?.data.required}
                />
                <button type="submit" className="send-button">
                  <Send size={18} />
                </button>
              </form>
            </div>
          )}

          {chatEnded && (
            <div className="chat-ended">
              <p>Chat session ended</p>
              <button onClick={resetChat} className="restart-button">
                Start New Chat
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-widget">
      {!isOpen && (
        <button className="chat-widget-trigger\" onClick={toggleWidget}>
          <MessageCircle size={24} />
          <span className="notification-badge">1</span>
        </button>
      )}

      {isOpen && (
        <div className={`chat-widget-window ${isMinimized ? 'minimized' : ''}`}>
          <div className="chat-header">
            <div className="chat-title">
              <MessageCircle size={20} />
              <span>Chat Support</span>
            </div>
            <div className="chat-controls">
              <button className="minimize-button" onClick={toggleMinimize}>
                <Minimize2 size={16} />
              </button>
              <button className="close-button" onClick={toggleWidget}>
                <X size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="chat-messages">
                {messages.map((message) => (
                  <div key={message.id} className={`message ${message.type}`}>
                    <div className="message-content">
                      {message.content}
                      {message.options && (
                        <div className="message-options">
                          {message.options.map((option, index) => (
                            <button
                              key={index}
                              className="option-button"
                              onClick={() => handleOptionSelect(option)}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="message-time">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="message bot">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {waitingForInput && !chatEnded && (
                <div className="chat-input">
                  <form onSubmit={handleTextInput}>
                    <input
                      type={currentInputNode?.data.inputType || "text"}
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      placeholder="Type your message..."
                      className="input-field"
                      required={currentInputNode?.data.required}
                    />
                    <button type="submit" className="send-button">
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              )}

              {chatEnded && (
                <div className="chat-ended">
                  <p>Chat session ended</p>
                  <button onClick={resetChat} className="restart-button">
                    Start New Chat
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};