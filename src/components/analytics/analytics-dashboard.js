import React, { useState, useEffect } from "react";
import { BarChart3, Users, MessageSquare, TrendingUp, Calendar, Download } from "lucide-react";
import "./analytics-dashboard.css";

export const AnalyticsDashboard = ({ chatbotId }) => {
  const [analyticsData, setAnalyticsData] = useState({
    totalConversations: 0,
    totalMessages: 0,
    activeUsers: 0,
    conversionRate: 0,
    popularPaths: [],
    dailyStats: [],
    userSatisfaction: 0,
  });

  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading analytics data
    const loadAnalytics = async () => {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - in real app, this would come from your analytics service
      setAnalyticsData({
        totalConversations: 1247,
        totalMessages: 8934,
        activeUsers: 892,
        conversionRate: 23.5,
        userSatisfaction: 4.2,
        popularPaths: [
          { path: "Welcome → Product Info → Contact", count: 234, percentage: 18.8 },
          { path: "Welcome → Support → Resolved", count: 189, percentage: 15.2 },
          { path: "Welcome → Pricing → Demo", count: 156, percentage: 12.5 },
          { path: "Welcome → FAQ → End", count: 134, percentage: 10.7 },
        ],
        dailyStats: [
          { date: "2024-01-01", conversations: 45, messages: 234 },
          { date: "2024-01-02", conversations: 52, messages: 287 },
          { date: "2024-01-03", conversations: 38, messages: 198 },
          { date: "2024-01-04", conversations: 67, messages: 345 },
          { date: "2024-01-05", conversations: 71, messages: 389 },
          { date: "2024-01-06", conversations: 59, messages: 312 },
          { date: "2024-01-07", conversations: 63, messages: 298 },
        ],
      });
      
      setLoading(false);
    };

    loadAnalytics();
  }, [chatbotId, timeRange]);

  const exportData = () => {
    const csvData = [
      ["Metric", "Value"],
      ["Total Conversations", analyticsData.totalConversations],
      ["Total Messages", analyticsData.totalMessages],
      ["Active Users", analyticsData.activeUsers],
      ["Conversion Rate", `${analyticsData.conversionRate}%`],
      ["User Satisfaction", analyticsData.userSatisfaction],
    ];

    const csvContent = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chatbot-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="analytics-dashboard">
        <div className="analytics-loading">
          <div className="loading-spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <div className="header-content">
          <h2>Analytics Dashboard</h2>
          <p>Track your chatbot's performance and user engagement</p>
        </div>
        <div className="header-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button onClick={exportData} className="export-button">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="metric-card">
          <div className="metric-icon conversations">
            <MessageSquare size={24} />
          </div>
          <div className="metric-content">
            <h3>Total Conversations</h3>
            <p className="metric-value">{analyticsData.totalConversations.toLocaleString()}</p>
            <span className="metric-change positive">+12.5% from last period</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon users">
            <Users size={24} />
          </div>
          <div className="metric-content">
            <h3>Active Users</h3>
            <p className="metric-value">{analyticsData.activeUsers.toLocaleString()}</p>
            <span className="metric-change positive">+8.3% from last period</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon messages">
            <BarChart3 size={24} />
          </div>
          <div className="metric-content">
            <h3>Total Messages</h3>
            <p className="metric-value">{analyticsData.totalMessages.toLocaleString()}</p>
            <span className="metric-change positive">+15.7% from last period</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon conversion">
            <TrendingUp size={24} />
          </div>
          <div className="metric-content">
            <h3>Conversion Rate</h3>
            <p className="metric-value">{analyticsData.conversionRate}%</p>
            <span className="metric-change negative">-2.1% from last period</span>
          </div>
        </div>
      </div>

      <div className="analytics-charts">
        <div className="chart-card">
          <h3>Daily Conversations</h3>
          <div className="simple-chart">
            {analyticsData.dailyStats.map((stat, index) => (
              <div key={index} className="chart-bar">
                <div 
                  className="bar" 
                  style={{ 
                    height: `${(stat.conversations / Math.max(...analyticsData.dailyStats.map(s => s.conversations))) * 100}%` 
                  }}
                ></div>
                <span className="bar-label">{new Date(stat.date).getDate()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>Popular Conversation Paths</h3>
          <div className="path-list">
            {analyticsData.popularPaths.map((path, index) => (
              <div key={index} className="path-item">
                <div className="path-info">
                  <span className="path-name">{path.path}</span>
                  <span className="path-count">{path.count} users</span>
                </div>
                <div className="path-bar">
                  <div 
                    className="path-fill" 
                    style={{ width: `${path.percentage}%` }}
                  ></div>
                </div>
                <span className="path-percentage">{path.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="satisfaction-card">
        <h3>User Satisfaction</h3>
        <div className="satisfaction-content">
          <div className="satisfaction-score">
            <span className="score">{analyticsData.userSatisfaction}</span>
            <span className="score-max">/5.0</span>
          </div>
          <div className="satisfaction-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span 
                key={star} 
                className={`star ${star <= Math.round(analyticsData.userSatisfaction) ? 'filled' : ''}`}
              >
                ★
              </span>
            ))}
          </div>
          <p className="satisfaction-text">
            Based on {Math.floor(analyticsData.totalConversations * 0.3)} user ratings
          </p>
        </div>
      </div>
    </div>
  );
};