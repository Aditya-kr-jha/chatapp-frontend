import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllChannels, getMyMemberships, joinChannel, leaveChannel } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ChannelList from './ChannelList';
// Assuming App.css is imported globally

function ChannelDashboard() {
  const [myChannels, setMyChannels] = useState([]);
  const [joinableChannels, setJoinableChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { logout, user } = useAuth(); // Get user if needed for greeting
  const navigate = useNavigate();

  // Callback to fetch channels
  const fetchChannels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [allChannelsResponse, myMembershipsResponse] = await Promise.all([
        getAllChannels(),
        getMyMemberships(),
      ]);

      const all = allChannelsResponse.data || [];
      const mine = myMembershipsResponse.data || [];
      const myChannelIds = new Set(mine.map(c => c.id));
      const joinable = all.filter(c => !myChannelIds.has(c.id));

      setMyChannels(mine);
      setJoinableChannels(joinable);
    } catch (err) {
      console.error("Failed to fetch channels:", err);
      setError('Failed to load channels. Please try again.');
      if (err.response?.status === 401) {
          logout();
          navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]); // Dependencies

  // Fetch channels on mount
  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  // Handler for joining a channel
  const handleJoin = useCallback(async (channelId) => {
    setError(null);
    try {
      await joinChannel(channelId);
      fetchChannels(); // Refetch to update lists
    } catch (err) {
      console.error("Failed to join channel:", err);
      setError(`Failed to join channel. ${err.response?.data?.detail || ''}`);
      if (err.response?.status === 401) logout();
    }
  }, [fetchChannels, logout]); // Added fetchChannels, logout

  // Handler for leaving a channel
  const handleLeave = useCallback(async (channelId) => {
    setError(null);
    try {
      await leaveChannel(channelId);
      fetchChannels(); // Refetch to update lists
    } catch (err) {
      console.error("Failed to leave channel:", err);
      setError(`Failed to leave channel. ${err.response?.data?.detail || ''}`);
      if (err.response?.status === 401) logout();
    }
  }, [fetchChannels, logout]); // Added fetchChannels, logout

   // Handler for navigating to a joined channel
   const handleChannelClick = useCallback((channelId) => {
        navigate(`/channel/${channelId}`);
   }, [navigate]); // Added navigate

  // Render loading state within the container structure for consistency
  if (loading) {
    return (
        <div className="dashboard-container"> {/* Use dashboard-container */}
            <div className="dashboard-header"> {/* Header structure */}
                 <h2>Channel Dashboard</h2>
                 {/* Optionally show logout even when loading */}
                 {/* <button onClick={logout} className="logout-button">Logout</button> */}
            </div>
            <p style={{ textAlign: 'center', margin: '2rem 0', color: 'var(--text-light)' }}>
                Loading channels...
            </p>
        </div>
    );
  }

  // Render the main dashboard
  return (
    // Apply the dashboard-container class for consistent styling
    <div className="dashboard-container">

        {/* Header Section */}
        <div className="dashboard-header">
            <h2>Channel Dashboard</h2>
            {/* Use the existing logout-button class from App.css */}
            <button onClick={logout} className="logout-button">
                Logout
            </button>
        </div>

        {/* Display errors using the consistent error message style */}
        {error && <p className="error-message">{error}</p>}

        {/* Wrapper for the channel list sections */}
        {/* Use flexbox for layout, but remove inline styles */}
        <div className="channel-sections-wrapper">
            {/* "My Channels" List */}
            <ChannelList
                title="My Channels"
                channels={myChannels}
                onItemClick={handleChannelClick}
                actionButtonLabel="Leave"
                onActionButtonClick={handleLeave}
                actionButtonClass="danger" // Use danger style for leaving
            />

            {/* "Joinable Channels" List */}
            <ChannelList
                title="Joinable Channels"
                channels={joinableChannels}
                // No onItemClick for joinable channels
                actionButtonLabel="Join"
                onActionButtonClick={handleJoin}
                actionButtonClass="primary" // Use primary style for joining (optional, default is primary)
            />
        </div>

        {/* Optional: Add a "Create Channel" button or link here */}
        {/*
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button onClick={() => navigate('/create-channel')}>Create New Channel</button>
        </div>
        */}
    </div>
  );
}

export default ChannelDashboard;