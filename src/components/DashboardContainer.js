import React, { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import CreateChatModal from "../modal/CreateChatModal";
import { TemplateGallery } from "./template-system/template-gallery";
import { BookTemplate as Template, BarChart3, MessageSquare, Copy, ExternalLink } from "lucide-react";

export default function DashboardContainer() {
  const [chatbots, setChatbots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);

  const navigate = useNavigate();

  const handleEdit = (id) => {
    navigate(`/webchat/${id}`);
  };

  const handleAnalytics = (id) => {
    navigate(`/webchat/${id}?view=analytics`);
  };

  const handleCopyLink = (id) => {
    const chatUrl = `${window.location.origin}/chat/${id}`;
    navigator.clipboard.writeText(chatUrl);
    alert("Chat link copied to clipboard!");
  };

  const handlePreview = (id) => {
    const chatUrl = `${window.location.origin}/chat/${id}`;
    window.open(chatUrl, '_blank');
  };

  const openChatModal = () => setIsChatModalOpen(true);
  const closeChatModal = () => {
    setIsChatModalOpen(false);
    fetchChatbots();
  };

  const openTemplateGallery = () => setShowTemplateGallery(true);
  const closeTemplateGallery = () => setShowTemplateGallery(false);

  const handleSelectTemplate = async (template) => {
    // Create a new chatbot with the template
    try {
      const user = auth.currentUser;
      const { addDoc, collection } = await import("firebase/firestore");
      
      const newChatbot = {
        title: `${template.name} (Copy)`,
        description: template.description,
        userId: user.uid,
        createdAt: new Date(),
        flowData: {
          nodes: template.nodes,
          edges: template.edges,
          nodeCount: template.nodes.length,
          edgeCount: template.edges.length,
        }
      };

      const docRef = await addDoc(collection(db, "webchat"), newChatbot);
      alert("Template applied successfully!");
      navigate(`/webchat/${docRef.id}`);
    } catch (error) {
      console.error("Error creating chatbot from template:", error);
      alert("Failed to create chatbot from template.");
    }
  };

  const onCreateClick = openChatModal;

  const fetchChatbots = async () => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, "webchat"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const bots = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChatbots(bots);
    } catch (error) {
      console.error("Error fetching webchat bots:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatbots();
  }, []);

  const STATS_OPTIONS = [
    { 
      title: "Total Bots", 
      value: chatbots.length,
      icon: <MessageSquare size={20} />,
      color: "#3b82f6"
    },
    { 
      title: "Total Conversations", 
      value: chatbots.reduce((acc, bot) => acc + (bot.analytics?.totalConversations || 0), 0),
      icon: <BarChart3 size={20} />,
      color: "#10b981"
    },
    { 
      title: "Active Bots", 
      value: chatbots.filter(bot => bot.isActive).length,
      icon: <MessageSquare size={20} />,
      color: "#f59e0b"
    },
    { 
      title: "Avg. Response Rate", 
      value: "87%",
      icon: <BarChart3 size={20} />,
      color: "#8b5cf6"
    },
  ];

  return (
    <div className="DashboardContainer">
      <div className="DashCont">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Overview of your chatbot performance and key metrics.</p>
          </div>
          <div className="dashboard-actions">
            <button 
              className="template-gallery-btn"
              onClick={openTemplateGallery}
            >
              <Template size={16} />
              Browse Templates
            </button>
          </div>
        </div>
        
        <div className="DashPerformanceStat">
          {STATS_OPTIONS.map(({ title, value, icon, color }) => (
            <div key={title} className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: color }}>
                {icon}
              </div>
              <div className="stat-content">
                <p className="stat-title">{title}</p>
                <p className="stat-value">{value || 0}</p>
                <span className="stat-change positive">+12% from last month</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chatbots-section">
        <div className="section-header">
          <h2>Your Chatbots</h2>
          <button
            className="Chatbot-create-btn primary"
            onClick={onCreateClick}
          >
            <MessageSquare size={16} />
            Create New ChatBot
          </button>
        </div>
        
        <div className="chatbots-grid">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading chatbots...</p>
            </div>
          ) : chatbots.length === 0 ? (
            <div className="empty-state">
              <MessageSquare size={48} />
              <h3>No ChatBots Created Yet</h3>
              <p>Get started by creating your first chatbot or browse our templates.</p>
              <div className="empty-actions">
                <button className="Chatbot-create-btn primary" onClick={onCreateClick}>
                  Create New ChatBot
                </button>
                <button className="template-gallery-btn" onClick={openTemplateGallery}>
                  <Template size={16} />
                  Browse Templates
                </button>
              </div>
            </div>
          ) : (
            chatbots.map((bot) => (
              <div key={bot.id} className="chatbot-card">
                <div className="chatbot-header">
                  <div className="chatbot-info">
                    <h3>{bot.title}</h3>
                    <p>{bot.description || "No description provided"}</p>
                  </div>
                  <div className="chatbot-status">
                    <span className={`status-badge ${bot.isActive ? 'active' : 'inactive'}`}>
                      {bot.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="chatbot-stats">
                  <div className="stat-item">
                    <span className="stat-label">Nodes</span>
                    <span className="stat-value">{bot.flowData?.nodeCount || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Connections</span>
                    <span className="stat-value">{bot.flowData?.edgeCount || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Created</span>
                    <span className="stat-value">
                      {bot.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                    </span>
                  </div>
                </div>

                <div className="chatbot-actions">
                  <button 
                    className="action-btn primary"
                    onClick={() => handleEdit(bot.id)}
                  >
                    Edit Flow
                  </button>
                  <button 
                    className="action-btn secondary"
                    onClick={() => handleCopyLink(bot.id)}
                  >
                    <Copy size={14} />
                    Copy Link
                  </button>
                  <button 
                    className="action-btn secondary"
                    onClick={() => handlePreview(bot.id)}
                  >
                    <ExternalLink size={14} />
                    Preview
                  </button>
                  <button 
                    className="action-btn secondary"
                    onClick={() => handleAnalytics(bot.id)}
                  >
                    <BarChart3 size={14} />
                    Analytics
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isChatModalOpen && <CreateChatModal onClose={closeChatModal} />}
      {showTemplateGallery && (
        <TemplateGallery 
          onClose={closeTemplateGallery} 
          onSelectTemplate={handleSelectTemplate}
        />
      )}
    </div>
  );
}