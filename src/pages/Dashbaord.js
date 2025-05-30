import React from 'react';
import '../styles/Dashboard.css';
import DashboardHeader from '../components/DashboardHeader';
import DashboardContainer from '../components/DashboardContainer';

 function Dashboard() {
  return (
    <div className="Dashboard">
      <DashboardHeader />
      <DashboardContainer/>
    </div>
  );
}

export default Dashboard