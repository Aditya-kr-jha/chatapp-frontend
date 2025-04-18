
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllChannels, getMyMemberships, joinChannel, leaveChannel } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ChannelList from './ChannelList'; // We'll create this next

function ChannelDashboard() {
  const [myChannels, setMyChannels] = useState([]);
  const [joinableChannels, setJoinableChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchChannels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all channels and the channels the current user is a member of
      const [allChannelsResponse, myMembershipsResponse] = await Promise.all([
        getAllChannels(), // Fetches all public channels
        getMyMemberships(), // Fetches channels the authenticated user is in
      ]);

      const all = allChannelsResponse.data || [];
      const mine = myMembershipsResponse.data || [];
      // Create a Set of IDs for efficient lookup
      const myChannelIds = new Set(mine.map(c => c.id)); // Assuming channel objects have an 'id'

      // Filter 'all' channels to find those not in 'mine'
      const joinable = all.filter(c => !myChannelIds.has(c.id));

      setMyChannels(mine);
      setJoinableChannels(joinable);
    } catch (err) {
      console.error("Failed to fetch channels:", err);
      setError('Failed to load channels. Please try again.');
      // If unauthorized (token expired/invalid), log out and redirect
      if (err.response?.status === 401) {
          logout();
          navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]); // Add dependencies: logout and navigate

  // Fetch channels when the component mounts or fetchChannels changes
  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  // Handler for joining a channel
  const handleJoin = async (channelId) => {
    setError(null); // Clear previous errors
    try {
      await joinChannel(channelId);
      // Refetch channels to update the lists dynamically
      fetchChannels();
    } catch (err) {
      console.error("Failed to join channel:", err);
      setError(`Failed to join channel. ${err.response?.data?.detail || ''}`);
       if (err.response?.status === 401) logout(); // Logout if unauthorized
    }
  };

  // Handler for leaving a channel
  const handleLeave = async (channelId) => {
     setError(null); // Clear previous errors
    try {
      await leaveChannel(channelId);
      // Refetch channels to update the lists dynamically
      fetchChannels();
    } catch (err) {
      console.error("Failed to leave channel:", err);
      // Provide more specific error if available (e.g., owner cannot leave)
      setError(`Failed to leave channel. ${err.response?.data?.detail || ''}`);
       if (err.response?.status === 401) logout(); // Logout if unauthorized
    }
  };

   // Handler for clicking on a channel the user is a member of
   const handleChannelClick = (channelId) => {
        navigate(`/channel/${channelId}`); // Navigate to the chat view
    };

  // Display loading state
  if (loading) return <p>Loading channels...</p>;

  // Render the dashboard
  return (
    <div>
      <h2>Channel Dashboard</h2>
       {/* Display errors prominently */}
       {error && <p style={{ color: 'red' }}>{error}</p>}
       {/* Logout button */}
       <button onClick={logout} style={{ float: 'right', marginBottom: '10px' }}>Logout</button>
      <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}> {/* Added flexWrap */}
         {/* List of channels the user is a member of */}
         <ChannelList
            title="My Channels"
            channels={myChannels}
            onItemClick={handleChannelClick} // Allow clicking to navigate
            actionButtonLabel="Leave"
            onActionButtonClick={handleLeave} // Button to leave channel
         />
         {/* List of channels the user can join */}
         <ChannelList
            title="Joinable Channels"
            channels={joinableChannels}
            // No click navigation for joinable channels per requirement
            actionButtonLabel="Join"
            onActionButtonClick={handleJoin} // Button to join channel
        />
      </div>
      {/* TODO: Add a UI element to create channels? */}
      {/* Example: <button onClick={() => navigate('/create-channel')}>Create Channel</button> */}
    </div>
  );
}

export default ChannelDashboard;