import React, { useState } from 'react';
import '../styles/Modal.css';
import { X } from 'lucide-react';
import { TextField, Button } from '@mui/material';
import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function CreateChatModal({ onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type,setType] = useState('Web Chat');
  const [loading, setLoading] = useState(false);

  const handleSubmit =async () => {

    setLoading(true);
    const user = auth.currentUser;

    try {
        await addDoc(collection(db, "webchat"), {
            title,
            description,
            userId: user.uid,
            createdAt: new Date(),
          });
          alert("WebChat created successfully!");
          onClose();
    } catch (error) {
        console.error("Error creating WebChat:", error);
        alert("Failed to create WebChat. Check console.");
    }finally {
        setLoading(false);
      }

  }

  return (
    <div className="CreateChatModal">
      <div className="chat-container">
        <div style={{ display: 'flex',width:"100%", justifyContent: 'flex-end' }}>
          <X onClick={onClose} style={{ cursor: 'pointer' }} />
        </div>
        <h1>Create WebChat Bot</h1>
        <TextField
          fullWidth
          variant="outlined"
          margin="normal"
          value={type}
          onChange={(e) => setType(e.target.value)}
          disabled
        />
        <TextField
          fullWidth
          label="Title"
          variant="outlined"
          margin="normal"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          fullWidth
          label="Description"
          variant="outlined"
          margin="normal"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!title || !description}
          style={{ marginTop: '1rem' }}
        >
         {loading ? "Creating..." : "Create"}
        </Button>
      </div>
    </div>
  );
}