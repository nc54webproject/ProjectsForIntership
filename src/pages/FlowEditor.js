import React, { useCallback, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { nanoid } from 'nanoid';
import { Handle, Position } from 'reactflow';

const CustomNode = ({ data, id }) => {
  const getColor = () => {
    switch (data.nodeType) {
      case 'message': return 'bg-blue-100';
      case 'input': return 'bg-green-100';
      case 'condition': return 'bg-yellow-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className={`p-3 rounded shadow-md border ${getColor()}`}>  
      <strong>{data.nodeType?.toUpperCase()}</strong>
      <div className="mt-1 text-sm">{data.label}</div>
      <textarea
        className="mt-2 w-full text-sm p-1 border rounded"
        placeholder="Enter content..."
        value={data.content || ''}
        onChange={(e) => data.setContent(id, e.target.value)}
      />
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

const nodeTypes = { customNode: CustomNode };

const initialNodes = [
  { id: '1', type: 'customNode', data: { label: 'Start Node', nodeType: 'message', content: 'Welcome!', setContent: () => {} }, position: { x: 250, y: 5 } },
];
const initialEdges = [];

function FlowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState([]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const updateNodeContent = (id, content) => {
    setNodes((nds) => nds.map((node) => node.id === id ? { ...node, data: { ...node.data, content, setContent: updateNodeContent } } : node));
  };

  const addNode = (type = 'customNode', label = 'New Node', nodeType = 'message') => {
    const newNode = { id: nanoid(), type, data: { label, nodeType, content: '', setContent: updateNodeContent }, position: { x: Math.random() * 400, y: Math.random() * 400 } };
    setNodes((nds) => [...nds, newNode]);
  };

  const saveFlow = () => {
    const cleaned = nodes.map(({ data, ...rest }) => ({ ...rest, data: { label: data.label, nodeType: data.nodeType, content: data.content } }));
    console.log('Flow to save:', JSON.stringify({ nodes: cleaned, edges }, null, 2));
  };

  // Execution: traverse flow based on chat input
  const executeFlow = (input) => {
    let currentId = '1';
    let botResponse = '';
    while (currentId) {
      const node = nodes.find((n) => n.id === currentId);
      if (!node) break;
      const { nodeType, content } = node.data;
      if (nodeType === 'message') {
        botResponse += content + '\n';
        const nextEdge = edges.find((e) => e.source === currentId);
        currentId = nextEdge?.target;
      } else if (nodeType === 'input') {
        // user input node: skip to next
        const nextEdge = edges.find((e) => e.source === currentId);
        currentId = nextEdge?.target;
      } else if (nodeType === 'condition') {
        const outgoing = edges.filter((e) => e.source === currentId);
        const match = outgoing.find((e) => {
          try { return new Function('input', `return ${e.label}`)(input);
          } catch { return false; }
        });
        currentId = match?.target;
      } else break;
    }
    return botResponse.trim();
  };

  const handleSend = () => {
    const userMsg = chatInput;
    const botMsg = executeFlow(userMsg);
    setChatLog((log) => [...log, { sender: 'user', text: userMsg }, { sender: 'bot', text: botMsg }]);
    setChatInput('');
  };

  return (
    <div className="flex h-screen">
      <div className="w-2/3">
        <div className="p-4 flex gap-2">
          <button onClick={() => addNode('customNode', 'Welcome Message', 'message')} className="px-4 py-2 bg-blue-500 text-white rounded">+ Message</button>
          <button onClick={() => addNode('customNode', 'User Input', 'input')} className="px-4 py-2 bg-green-500 text-white rounded">+ Input</button>
          <button onClick={() => addNode('customNode', 'Check Condition', 'condition')} className="px-4 py-2 bg-yellow-500 text-white rounded">+ Condition</button>
          <button onClick={saveFlow} className="px-4 py-2 bg-gray-800 text-white rounded">Save Flow</button>
        </div>
        <ReactFlowProvider>
          <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} fitView>
            <MiniMap />
            <Controls />
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
      <div className="w-1/3 border-l p-4 flex flex-col">
        <div className="flex-1 overflow-auto">
          {chatLog.map((msg, idx) => (
            <div key={idx} className={msg.sender === 'user' ? 'text-right' : 'text-left'}>
              <p className="inline-block py-1 px-2 my-1 rounded bg-gray-200">{msg.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-2 flex">
          <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 border rounded p-2" placeholder="Type a message..." />
          <button onClick={handleSend} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded">Send</button>
        </div>
      </div>
    </div>
  );
}

export default FlowBuilder;
