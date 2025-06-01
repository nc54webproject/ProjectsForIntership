import { ArrowLeft, Save, CheckCircle, AlertCircle } from "lucide-react";

export const FlowControls = ({
  chatbotTitle,
  hasUnsavedChanges,
  saveStatus,
  onBackClick,
  onSaveFlow,
}) => {
  const getSaveButtonContent = () => {
    switch (saveStatus) {
      case "saving":
        return (
          <>
            <div className="spinner"></div>
            <span>Saving...</span>
          </>
        );
      case "saved":
        return (
          <>
            <CheckCircle size={16} />
            <span>Saved!</span>
          </>
        );
      case "error":
        return (
          <>
            <AlertCircle size={16} />
            <span>Error!</span>
          </>
        );
      default:
        return (
          <>
            <Save size={16} />
            <span>Save Flow</span>
          </>
        );
    }
  };

  return (
    <div className="flow-controls">
      <div className="flow-info">
        <span className="flow-title">WebChat Flow Builder</span>
        <span className="chatbot-title">{chatbotTitle || "Untitled WebChat"}</span>
        <div className={`flow-status ${hasUnsavedChanges ? "unsaved" : ""}`}>
          <div className="flow-status-dot"></div>
          <span>{hasUnsavedChanges ? "Unsaved changes" : "All changes saved"}</span>
        </div>
      </div>

      <div className="control-buttons">
        <button className="control-button" onClick={onBackClick}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <button 
          className={`control-button ${saveStatus}`} 
          onClick={onSaveFlow} 
          disabled={saveStatus === "saving"}
        >
          {getSaveButtonContent()}
        </button>
      </div>
    </div>
  );
};