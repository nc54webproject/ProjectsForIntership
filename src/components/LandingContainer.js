import React from "react";
import "../styles/LandingPage.css";
import { ArrowRightLeft, Bot, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

function LandingContainer() {

  const navigate = useNavigate();

  const handleClick = ()=> {
    navigate('/login');
  }

  return (
    <div className="LandingContainer">
      <div className="container-welcome">
        <h1>Build Smarter Chatbot Flows</h1>
        <p>
          Create engaging chatbot experiences with out intuitive flow builder.
          Connect with youe audience on messaging platforms and automate
          customer interactions.
        </p>
        <button onClick={handleClick}>Get Started</button>
      </div>
      <div className="key-features">
        <h1>Key Features</h1>
        <p>
          Our chatbot builder offers a range of powerful features to help you
          create effective and engaging chatbot flows.
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
          <div className="key-feature-items">
            <MessageCircle />
            <span>Intuitive Flow Builder</span>
            <p>
              Easily design chatbot coversations with our drag-and-drop
              interface. No coding required.
            </p>
          </div>
          <div className="key-feature-items">
            <ArrowRightLeft />
            <span>Seamless Integrations</span>
            <p>
              Connect your chatbot to messaging platforms like Messenger and
              Telegram for a unified experience.
            </p>
          </div>
          <div className="key-feature-items">
            <Bot />
            <span>AI-Powered Responses</span>
            <p>
              Leverage AI to generate smart and personalized responses,
              enhancing user engagement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingContainer;
