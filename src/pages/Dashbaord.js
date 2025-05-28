import React, { useState } from 'react';
import '../styles/Dashboard.css';
import DashboardHeader from '../components/DashboardHeader';
import DashboardContainer from '../components/DashboardContainer';
import CreateChatModal from '../modal/CreateChatModal';

 function Dashboard() {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const openChatModal = () => setIsChatModalOpen(true);
  const closeChatModal = () => setIsChatModalOpen(false);

  return (
    <div className="Dashboard">
      <DashboardHeader />
      <DashboardContainer onCreateClick={openChatModal} />
      {isChatModalOpen && (
        <CreateChatModal onClose={closeChatModal} />
      )}
    </div>
  );
}

export default Dashboard