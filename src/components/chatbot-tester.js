'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, XCircle, RefreshCw, Send } from 'lucide-react';
import '../styles/chatbot-tester.css';

export const ChatbotTester = ({ nodes, edges, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  const [userVariables, setUserVariables] = useState({});
  const [currentInput, setCurrentInput] = useState('');
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [currentInputNode, setCurrentInputNode] = useState(null);
  const messagesEndRef = useRef(null);

  // Find the starting node (usually a text message node with no incoming edges)
  useEffect(() => {
    const startNode = findStartNode(nodes, edges);
    if (startNode) {
      setCurrentNodeId(startNode.id);
    }
  }, [nodes, edges]);

  // Process the current node
  useEffect(() => {
    if (!currentNodeId || chatEnded || waitingForInput) return;

    const currentNode = nodes.find((node) => node.id === currentNodeId);
    if (!currentNode) return;

    // Simulate typing effect
    setIsTyping(true);

    const timer = setTimeout(() => {
      setIsTyping(false);
      processNode(currentNode);
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [currentNodeId, nodes, edges, chatEnded, waitingForInput]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Find the starting node (a node with no incoming edges)
  const findStartNode = (nodes, edges) => {
    const targetNodeIds = new Set(edges.map((edge) => edge.target));
    const possibleStartNodes = nodes.filter(
      (node) => !targetNodeIds.has(node.id)
    );
    const textMessageStartNode = possibleStartNodes.find(
      (node) => node.type === 'textMessage'
    );
    return textMessageStartNode || possibleStartNodes[0];
  };

  // Find the next node ID based on the current node and edges
  const findNextNodeId = (currentNodeId, edges) => {
    const outgoingEdges = edges.filter((edge) => edge.source === currentNodeId);
    return outgoingEdges.length > 0 ? outgoingEdges[0].target : null;
  };

  // Process different node types
  const processNode = (node) => {
    switch (node.type) {
      case 'textMessage':
        addBotMessage(node.data.message || 'No message set');
        moveToNextNode(node.id);
        break;

      case 'question':
        addBotMessage(
          node.data.question || 'No question set',
          node.data.options
        );
        break;

      case 'collectInput':
        addBotMessage(node.data.prompt || 'Please enter your response:');
        setWaitingForInput(true);
        setCurrentInputNode(node);
        break;

      case 'delay':
        const duration = (node.data.duration || 2) * 1000;
        setTimeout(() => {
          moveToNextNode(node.id);
        }, duration);
        break;

      case 'tag':
        // Simulate tagging action
        addBotMessage(
          `✅ Tagged user with: ${(node.data.tags || []).join(', ')}`
        );
        moveToNextNode(node.id);
        break;

      case 'broadcast':
        // Simulate broadcast action
        addBotMessage(
          `📢 Broadcasting: ${node.data.message || 'Broadcast message'}`
        );
        moveToNextNode(node.id);
        break;

      case 'apiIntegration':
        // Simulate API call
        addBotMessage('🔄 Making API call...');
        setTimeout(() => {
          addBotMessage('✅ API call successful!');
          moveToNextNode(node.id);
        }, 2000);
        break;

      case 'endChat':
        addBotMessage(node.data.message || 'Chat session ended');
        setChatEnded(true);
        break;

      default:
        moveToNextNode(node.id);
        break;
    }
  };

  const addBotMessage = (content, options = null) => {
    const message = {
      type: 'bot',
      content,
      options,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const addUserMessage = (content) => {
    const message = {
      type: 'user',
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

  // Handle user option selection
  const handleOptionSelect = (option) => {
    addUserMessage(option);

    const currentNode = nodes.find((node) => node.id === currentNodeId);
    if (!currentNode) return;

    const outgoingEdges = edges.filter((edge) => edge.source === currentNodeId);

    if (outgoingEdges.length > 0) {
      const nextNodeId = outgoingEdges[0].target;
      const nextNode = nodes.find((node) => node.id === nextNodeId);

      if (nextNode && nextNode.type === 'router') {
        // Handle router node logic
        const routes = nextNode.data.routes || [];
        const routeIndex = routes.findIndex((route) => route === option);

        if (routeIndex !== -1) {
          const routeEdge = edges.find(
            (edge) =>
              edge.source === nextNodeId &&
              edge.sourceHandle === `route-${routeIndex}`
          );
          if (routeEdge) setCurrentNodeId(routeEdge.target);
        } else {
          const firstRouteEdge = edges.find(
            (edge) =>
              edge.source === nextNodeId &&
              edge.sourceHandle?.startsWith('route-')
          );
          if (firstRouteEdge) setCurrentNodeId(firstRouteEdge.target);
        }
      } else if (nextNode && nextNode.type === 'conditional') {
        // Handle conditional node logic
        const conditionValue = nextNode.data.value;
        const conditionOperator = nextNode.data.operator || 'equals';

        let conditionMet = false;
        switch (conditionOperator) {
          case 'equals':
            conditionMet = option === conditionValue;
            break;
          case 'contains':
            conditionMet = option.includes(conditionValue);
            break;
          case 'starts_with':
            conditionMet = option.startsWith(conditionValue);
            break;
          case 'ends_with':
            conditionMet = option.endsWith(conditionValue);
            break;
          default:
            conditionMet = option === conditionValue;
        }

        const nextEdge = edges.find(
          (edge) =>
            edge.source === nextNodeId &&
            edge.sourceHandle === (conditionMet ? 'true' : 'false')
        );
        if (nextEdge) setCurrentNodeId(nextEdge.target);
      } else {
        // Default case
        setCurrentNodeId(nextNodeId);
      }
    }
  };

  // Handle text input submission
  const handleTextInputSubmit = (e) => {
    e.preventDefault();
    if (!currentInput.trim() || !waitingForInput || !currentInputNode) return;

    addUserMessage(currentInput);

    // Save to variables if specified
    if (currentInputNode.data.variable) {
      setUserVariables((prev) => ({
        ...prev,
        [currentInputNode.data.variable]: currentInput,
      }));
    }

    // Clear input state
    setCurrentInput('');
    setWaitingForInput(false);
    setCurrentInputNode(null);

    // Move to next node
    moveToNextNode(currentInputNode.id);
  };

  // Reset the chat
  const resetChat = () => {
    setMessages([]);
    setChatEnded(false);
    setUserVariables({});
    setCurrentInput('');
    setWaitingForInput(false);
    setCurrentInputNode(null);
    const startNode = findStartNode(nodes, edges);
    if (startNode) setCurrentNodeId(startNode.id);
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        position: 'absolute',
        padding: '5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '80vh',
          width: '100vw',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: 'white',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={20} />
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
              Chatbot Preview
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={resetChat}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <XCircle size={16} />
            </button>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                padding: '8px 12px',
                borderRadius:
                  message.type === 'user'
                    ? '12px 12px 0 12px'
                    : '12px 12px 12px 0',
                backgroundColor:
                  message.type === 'user' ? '#6366f1' : '#f1f5f9',
                color: message.type === 'user' ? 'white' : 'inherit',
              }}
            >
              <div>{message.content}</div>
              {message.options && message.options.length > 0 && (
                <div
                  style={{
                    marginTop: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  {message.options.map((option, optIndex) => (
                    <button
                      key={optIndex}
                      onClick={() => handleOptionSelect(option)}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div
              style={{
                alignSelf: 'flex-start',
                padding: '8px 12px',
                borderRadius: '12px 12px 12px 0',
                backgroundColor: '#f1f5f9',
              }}
            >
              <div style={{ display: 'flex', gap: '4px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#64748b',
                    animation: 'typing 1s infinite',
                  }}
                ></span>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#64748b',
                    animation: 'typing 1s infinite 0.2s',
                  }}
                ></span>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#64748b',
                    animation: 'typing 1s infinite 0.4s',
                  }}
                ></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Text input for collectInput nodes */}
        {waitingForInput && !chatEnded && (
          <div
            style={{
              padding: '16px',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: 'white',
            }}
          >
            <form
              onSubmit={handleTextInputSubmit}
              style={{ display: 'flex', gap: '8px' }}
            >
              <input
                type={currentInputNode?.data.inputType || 'text'}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Type your response..."
                required={currentInputNode?.data.required}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        )}

        {chatEnded && (
          <div
            style={{
              padding: '16px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <p style={{ margin: 0 }}>Chat session ended</p>
            <button
              onClick={resetChat}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <RefreshCw size={16} />
              Restart Chat
            </button>
          </div>
        )}

        {/* Debug info */}
        {Object.keys(userVariables).length > 0 && (
          <div
            style={{
              padding: '8px 16px',
              backgroundColor: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              fontSize: '12px',
              color: '#6b7280',
            }}
          >
            <strong>Variables:</strong> {JSON.stringify(userVariables)}
          </div>
        )}
      </div>
    </div>
  );
};
