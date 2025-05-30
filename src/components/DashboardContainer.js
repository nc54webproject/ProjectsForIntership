import React, { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import CreateChatModal from "../modal/CreateChatModal";

export default function DashboardContainer() {
  const [chatbots, setChatbots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const navigate = useNavigate();

  const handleEdit = (id) => {
    navigate(`/webchat/${id}`);
  };

  const openChatModal = () => setIsChatModalOpen(true);
  const closeChatModal = () => {
    setIsChatModalOpen(false);
    fetchChatbots();
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
    { title: "Total Bots", value: chatbots.length },
    { title: "Messages Received" },
    { title: "Messages Sent" },
  ];

  return (
    <div className="DashboardContainer">
      <div className="DashCont">
        <h1>Dashboard</h1>
        <p>Overview of your chatbot performance and key metrics.</p>
        <div className="DashPerformanceStat">
          {STATS_OPTIONS.map(({ title, value }) => (
            <div key={title} className="stat-card">
              <p className="stat-title">{title}</p>
              <p className="stat-value">{value || 0}</p>
              {/* <p className="stat-growth">{value || 0}</p> */}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h2>Your Chatbots</h2>
        <div className="table-container">
          {loading ? (
            <p>Loading chatbots...</p>
          ) : chatbots.length === 0 ? (
            <p>No ChatBot Created Yet</p>
          ) : (
            chatbots.map((bot) => (
              <div key={bot.id} className="table-item">
                <p>{bot.title}</p>
                <div className="table-item-button">
                  <button onClick={() => handleEdit(bot.id)}>Edit</button>
                  <button>Copy Link</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            className="Chatbot-create-btn"
            onClick={onCreateClick}
            style={{ cursor: "pointer" }}
          >
            Create New ChatBot
          </button>
        </div>
      </div>
      {isChatModalOpen && <CreateChatModal onClose={closeChatModal} />}
    </div>
  );
}
