import React, { useState } from "react";
import { X, Download, Eye, Star } from "lucide-react";
import "../styles/template-gallery.css";

const CHATBOT_TEMPLATES = [
  {
    id: "customer-support",
    name: "Customer Support Bot",
    description: "Handle common customer inquiries and route to human agents when needed",
    category: "Support",
    difficulty: "Beginner",
    rating: 4.8,
    preview: "Welcome! How can I help you today?",
    nodes: [
      {
        id: "start",
        type: "textMessage",
        position: { x: 250, y: 100 },
        data: {
          label: "Welcome Message",
          message: "Hello! I'm here to help you with any questions. How can I assist you today?",
        },
      },
      {
        id: "main-menu",
        type: "question",
        position: { x: 250, y: 250 },
        data: {
          label: "Main Menu",
          question: "What can I help you with?",
          options: ["Product Information", "Order Status", "Technical Support", "Speak to Human"],
        },
      },
      {
        id: "router-1",
        type: "router",
        position: { x: 250, y: 400 },
        data: {
          label: "Route to Department",
          routes: ["Product Information", "Order Status", "Technical Support", "Speak to Human"],
        },
      },
      {
        id: "product-info",
        type: "textMessage",
        position: { x: 50, y: 550 },
        data: {
          label: "Product Info",
          message: "I'd be happy to help with product information. What specific product are you interested in?",
        },
      },
      {
        id: "order-status",
        type: "collectInput",
        position: { x: 200, y: 550 },
        data: {
          label: "Order Number",
          prompt: "Please provide your order number so I can check the status:",
          inputType: "text",
          variable: "order_number",
          required: true,
        },
      },
      {
        id: "tech-support",
        type: "textMessage",
        position: { x: 350, y: 550 },
        data: {
          label: "Tech Support",
          message: "I'll connect you with our technical support team. Please describe your issue:",
        },
      },
      {
        id: "human-handoff",
        type: "textMessage",
        position: { x: 500, y: 550 },
        data: {
          label: "Human Agent",
          message: "I'm connecting you with a human agent. Please wait a moment...",
        },
      },
    ],
    edges: [
      { id: "e1", source: "start", target: "main-menu" },
      { id: "e2", source: "main-menu", target: "router-1" },
      { id: "e3", source: "router-1", target: "product-info", sourceHandle: "route-0" },
      { id: "e4", source: "router-1", target: "order-status", sourceHandle: "route-1" },
      { id: "e5", source: "router-1", target: "tech-support", sourceHandle: "route-2" },
      { id: "e6", source: "router-1", target: "human-handoff", sourceHandle: "route-3" },
    ],
  },
  {
    id: "lead-generation",
    name: "Lead Generation Bot",
    description: "Qualify leads and collect contact information for sales follow-up",
    category: "Sales",
    difficulty: "Intermediate",
    rating: 4.6,
    preview: "Let's find the perfect solution for your business!",
    nodes: [
      {
        id: "start",
        type: "textMessage",
        position: { x: 250, y: 100 },
        data: {
          label: "Welcome",
          message: "Hi! I'm here to help you find the perfect solution for your business. Let's get started!",
        },
      },
      {
        id: "company-size",
        type: "question",
        position: { x: 250, y: 250 },
        data: {
          label: "Company Size",
          question: "What's the size of your company?",
          options: ["1-10 employees", "11-50 employees", "51-200 employees", "200+ employees"],
        },
      },
      {
        id: "collect-name",
        type: "collectInput",
        position: { x: 250, y: 400 },
        data: {
          label: "Name",
          prompt: "Great! What's your name?",
          inputType: "text",
          variable: "user_name",
          required: true,
        },
      },
      {
        id: "collect-email",
        type: "collectInput",
        position: { x: 250, y: 550 },
        data: {
          label: "Email",
          prompt: "What's your business email address?",
          inputType: "email",
          variable: "user_email",
          required: true,
        },
      },
      {
        id: "tag-lead",
        type: "tag",
        position: { x: 250, y: 700 },
        data: {
          label: "Tag as Lead",
          action: "add",
          tags: ["qualified_lead", "sales_follow_up"],
        },
      },
      {
        id: "thank-you",
        type: "textMessage",
        position: { x: 250, y: 850 },
        data: {
          label: "Thank You",
          message: "Thank you! Our sales team will contact you within 24 hours with a personalized proposal.",
        },
      },
    ],
    edges: [
      { id: "e1", source: "start", target: "company-size" },
      { id: "e2", source: "company-size", target: "collect-name" },
      { id: "e3", source: "collect-name", target: "collect-email" },
      { id: "e4", source: "collect-email", target: "tag-lead" },
      { id: "e5", source: "tag-lead", target: "thank-you" },
    ],
  },
  {
    id: "event-registration",
    name: "Event Registration Bot",
    description: "Register attendees for events and send confirmation details",
    category: "Events",
    difficulty: "Beginner",
    rating: 4.7,
    preview: "Register for our upcoming event in just a few steps!",
    nodes: [
      {
        id: "start",
        type: "textMessage",
        position: { x: 250, y: 100 },
        data: {
          label: "Event Welcome",
          message: "Welcome! Ready to register for our upcoming Tech Conference 2024? It'll just take a minute!",
        },
      },
      {
        id: "event-interest",
        type: "question",
        position: { x: 250, y: 250 },
        data: {
          label: "Interest Check",
          question: "Which sessions are you most interested in?",
          options: ["AI & Machine Learning", "Web Development", "Mobile Apps", "All Sessions"],
        },
      },
      {
        id: "collect-name",
        type: "collectInput",
        position: { x: 250, y: 400 },
        data: {
          label: "Full Name",
          prompt: "What's your full name?",
          inputType: "text",
          variable: "attendee_name",
          required: true,
        },
      },
      {
        id: "collect-email",
        type: "collectInput",
        position: { x: 250, y: 550 },
        data: {
          label: "Email",
          prompt: "What's your email address for the confirmation?",
          inputType: "email",
          variable: "attendee_email",
          required: true,
        },
      },
      {
        id: "collect-company",
        type: "collectInput",
        position: { x: 250, y: 700 },
        data: {
          label: "Company",
          prompt: "What company do you work for? (Optional)",
          inputType: "text",
          variable: "attendee_company",
          required: false,
        },
      },
      {
        id: "confirmation",
        type: "textMessage",
        position: { x: 250, y: 850 },
        data: {
          label: "Confirmation",
          message: "🎉 You're registered! Check your email for the confirmation and event details. See you there!",
        },
      },
    ],
    edges: [
      { id: "e1", source: "start", target: "event-interest" },
      { id: "e2", source: "event-interest", target: "collect-name" },
      { id: "e3", source: "collect-name", target: "collect-email" },
      { id: "e4", source: "collect-email", target: "collect-company" },
      { id: "e5", source: "collect-company", target: "confirmation" },
    ],
  },
  {
    id: "feedback-survey",
    name: "Feedback Survey Bot",
    description: "Collect customer feedback and satisfaction ratings",
    category: "Feedback",
    difficulty: "Beginner",
    rating: 4.5,
    preview: "Help us improve by sharing your feedback!",
    nodes: [
      {
        id: "start",
        type: "textMessage",
        position: { x: 250, y: 100 },
        data: {
          label: "Survey Intro",
          message: "Hi! We'd love to hear about your experience with us. This quick survey takes just 2 minutes.",
        },
      },
      {
        id: "satisfaction",
        type: "question",
        position: { x: 250, y: 250 },
        data: {
          label: "Satisfaction Rating",
          question: "How satisfied are you with our service?",
          options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
        },
      },
      {
        id: "rating-router",
        type: "conditional",
        position: { x: 250, y: 400 },
        data: {
          label: "Check Rating",
          condition: "user_input",
          operator: "contains",
          value: "Dissatisfied",
        },
      },
      {
        id: "positive-feedback",
        type: "textMessage",
        position: { x: 100, y: 550 },
        data: {
          label: "Thank You",
          message: "Thank you for the positive feedback! We're glad you're happy with our service.",
        },
      },
      {
        id: "improvement-question",
        type: "collectInput",
        position: { x: 400, y: 550 },
        data: {
          label: "Improvement Suggestions",
          prompt: "We're sorry to hear that. What can we do to improve your experience?",
          inputType: "text",
          variable: "improvement_suggestions",
          required: false,
        },
      },
      {
        id: "final-thanks",
        type: "textMessage",
        position: { x: 250, y: 700 },
        data: {
          label: "Final Thanks",
          message: "Thank you for taking the time to share your feedback. It helps us serve you better!",
        },
      },
    ],
    edges: [
      { id: "e1", source: "start", target: "satisfaction" },
      { id: "e2", source: "satisfaction", target: "rating-router" },
      { id: "e3", source: "rating-router", target: "positive-feedback", sourceHandle: "false" },
      { id: "e4", source: "rating-router", target: "improvement-question", sourceHandle: "true" },
      { id: "e5", source: "positive-feedback", target: "final-thanks" },
      { id: "e6", source: "improvement-question", target: "final-thanks" },
    ],
  },
];

export const TemplateGallery = ({ onClose, onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const categories = ["All", "Support", "Sales", "Events", "Feedback"];

  const filteredTemplates = CHATBOT_TEMPLATES.filter((template) => {
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = (template) => {
    onSelectTemplate(template);
    onClose();
  };

  const handlePreviewTemplate = (template) => {
    setPreviewTemplate(template);
  };

  const closePreview = () => {
    setPreviewTemplate(null);
  };

  if (previewTemplate) {
    return (
      <div className="template-gallery-overlay">
        <div className="template-gallery">
          <div className="template-gallery-header">
            <div className="header-content">
              <h2>Template Preview: {previewTemplate.name}</h2>
              <p>Preview the conversation flow and structure</p>
            </div>
            <button className="close-button" onClick={closePreview}>
              <X size={24} />
            </button>
          </div>

          <div className="template-preview-content">
            <div className="preview-info">
              <div className="preview-meta">
                <span className={`difficulty ${previewTemplate.difficulty.toLowerCase()}`}>
                  {previewTemplate.difficulty}
                </span>
                <span className="node-count">
                  {previewTemplate.nodes.length} nodes
                </span>
                <div className="template-rating">
                  <Star size={16} fill="currentColor" />
                  <span>{previewTemplate.rating}</span>
                </div>
              </div>
              <p className="preview-description">{previewTemplate.description}</p>
            </div>

            <div className="preview-flow">
              <h3>Conversation Flow Preview</h3>
              <div className="flow-steps">
                {previewTemplate.nodes.map((node, index) => (
                  <div key={node.id} className="flow-step">
                    <div className="step-number">{index + 1}</div>
                    <div className="step-content">
                      <div className="step-type">{node.type}</div>
                      <div className="step-label">{node.data.label}</div>
                      {node.data.message && (
                        <div className="step-message">"{node.data.message}"</div>
                      )}
                      {node.data.question && (
                        <div className="step-question">"{node.data.question}"</div>
                      )}
                      {node.data.options && (
                        <div className="step-options">
                          Options: {node.data.options.join(", ")}
                        </div>
                      )}
                      {node.data.prompt && (
                        <div className="step-prompt">"{node.data.prompt}"</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="preview-actions">
              <button className="preview-back-button" onClick={closePreview}>
                Back to Gallery
              </button>
              <button 
                className="use-template-button"
                onClick={() => handleUseTemplate(previewTemplate)}
              >
                <Download size={16} />
                Use This Template
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="template-gallery-overlay">
      <div className="template-gallery">
        <div className="template-gallery-header">
          <div className="header-content">
            <h2>Chatbot Templates</h2>
            <p>Choose from our pre-built templates to get started quickly</p>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="template-gallery-filters">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-filter ${selectedCategory === category ? "active" : ""}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="template-gallery-content">
          <div className="templates-grid">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="template-card">
                <div className="template-card-header">
                  <div className="template-info">
                    <h3>{template.name}</h3>
                    <span className="template-category">{template.category}</span>
                  </div>
                  <div className="template-rating">
                    <Star size={16} fill="currentColor" />
                    <span>{template.rating}</span>
                  </div>
                </div>
                
                <p className="template-description">{template.description}</p>
                
                <div className="template-preview">
                  <div className="preview-message">
                    <div className="message-bubble">
                      {template.preview}
                    </div>
                  </div>
                </div>

                <div className="template-meta">
                  <span className={`difficulty ${template.difficulty.toLowerCase()}`}>
                    {template.difficulty}
                  </span>
                  <span className="node-count">
                    {template.nodes.length} nodes
                  </span>
                </div>

                <div className="template-actions">
                  <button 
                    className="preview-button"
                    onClick={() => handlePreviewTemplate(template)}
                  >
                    <Eye size={16} />
                    Preview
                  </button>
                  <button 
                    className="use-template-button"
                    onClick={() => handleUseTemplate(template)}
                  >
                    <Download size={16} />
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="no-templates">
              <p>No templates found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};