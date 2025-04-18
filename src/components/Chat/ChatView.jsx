import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
// Removed: import { io } from 'socket.io-client'; // No longer using Socket.IO client
import { getMessagesForChannel, sendMessage } from '../../services/api';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useAuth } from '../../contexts/AuthContext';

// --- Configuration ---
// TODO: Replace with your actual backend base URL parts if different
const API_BASE_URL = 'http://localhost:8000'; // Used for constructing WS URL

// Determine WebSocket protocol based on API_BASE_URL
const wsProtocol = API_BASE_URL.startsWith('https://') ? 'wss://' : 'ws://';
// Extract hostname and port (if any) from API_BASE_URL
const wsHost = API_BASE_URL.replace(/^https?:\/\//, ''); // Remove http(s)://


function ChatView() {
    const { channelId } = useParams(); // Get channelId from URL parameters
    const { authToken, logout } = useAuth(); // Get auth token and logout function
    const [messages, setMessages] = useState([]); // State for messages in the channel
    const [loading, setLoading] = useState(true); // State for loading messages
    const [error, setError] = useState(null); // State for errors
    const [isConnected, setIsConnected] = useState(false); // State for WebSocket connection status
    const socketRef = useRef(null); // Ref to hold the WebSocket instance
    const navigate = useNavigate(); // Hook for navigation

    // --- Fetch initial messages via REST API ---
    const fetchMessages = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getMessagesForChannel(channelId);
            setMessages(response.data || []); // Set messages from API response
        } catch (err) {
            console.error("Failed to fetch messages:", err);
            setError(`Failed to load messages for channel ${channelId}.`);
            if (err.response?.status === 401) { // Handle unauthorized
                logout();
                navigate('/login');
            }
            // Handle case where user might not be a member (backend should ideally return 403/404)
            if (err.response?.status === 403 || err.response?.status === 404) {
                setError("You do not have access to this channel.");
                // Optionally redirect back after a delay
                // setTimeout(() => navigate('/'), 3000);
            }
        } finally {
            setLoading(false);
        }
    }, [channelId, navigate, logout]); // Dependencies for useCallback

    // Fetch messages when component mounts or channelId changes
    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    // --- Native WebSocket Connection Logic ---
    useEffect(() => {
        // Only attempt connection if token and channelId are present
        if (!authToken || !channelId) return;

        // Close any existing WebSocket connection before creating a new one
        if (socketRef.current) {
            console.log("Closing previous WebSocket connection.");
            socketRef.current.close();
            socketRef.current = null; // Clear the ref
            setIsConnected(false); // Update connection status
        }

        // Construct the WebSocket URL: ws(s)://host/ws/{channel_id}?token=...
        const wsUrl = `${wsProtocol}${wsHost}/ws/${channelId}?token=${authToken}`;
        console.log("Attempting to connect WebSocket:", wsUrl);

        // Create new native WebSocket instance
        const ws = new WebSocket(wsUrl);
        socketRef.current = ws; // Store the instance in the ref

        // --- WebSocket Event Handlers ---
        ws.onopen = () => {
            console.log(`WebSocket connected to ${wsUrl}`);
            setIsConnected(true); // Update state on successful connection
            setError(null); // Clear previous errors
        };

        ws.onclose = (event) => {
            console.log(`WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason}, Was Clean: ${event.wasClean}`);
            setIsConnected(false); // Update state on close

            // Check if the current ref instance is the one that closed
            if (socketRef.current === ws) {
                 socketRef.current = null; // Clear ref if this instance closed
            }

            // Handle specific close codes
            if (event.code === 1008) { // Policy Violation (e.g., auth failed)
                setError("Connection closed: Not authorized for this channel.");
                logout(); // Force logout on auth failure
                navigate('/login');
            } else if (!event.wasClean && event.code !== 1000) { // 1000 is normal closure by client
                 // Handle unexpected closure (server restart, network issue)
                 setError("Real-time connection lost unexpectedly. Please refresh the page to reconnect.");
                 // NOTE: No automatic reconnect is implemented here.
            }
        };

        ws.onerror = (event) => {
            // This event often precedes onclose when there's a connection issue
            console.error("WebSocket error observed:", event);
            setError("Failed to establish or maintain real-time connection. Check console.");
            setIsConnected(false); // Ensure disconnected state on error
            if (socketRef.current === ws) {
                 socketRef.current = null; // Clear ref if this instance errored
            }
        };

        // Handle incoming messages from the server
        ws.onmessage = (event) => {
            try {
                const newMessage = JSON.parse(event.data); // Parse the JSON message data
                console.log('Received message via WebSocket:', newMessage);
                // Add the new message to the messages state
                // Ensure the message format matches what MessageList expects
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            } catch (e) {
                console.error("Failed to parse incoming WebSocket message:", event.data, e);
                // Optionally show an error to the user or just log it
            }
        };

        // --- Cleanup function for useEffect ---
        // This runs when the component unmounts or dependencies change
        return () => {
            // Check if the WebSocket instance exists and is open before closing
            if (ws && ws.readyState === WebSocket.OPEN) {
                console.log(`Closing WebSocket connection for channel ${channelId} during cleanup.`);
                ws.close(1000, "Client navigating away or component unmounting"); // 1000 = Normal closure
            }
            // Ensure the ref is cleared if this specific instance is being cleaned up
            if (socketRef.current === ws) {
                socketRef.current = null;
            }
        };
    // Dependencies: reconnect if channelId or authToken changes
    }, [channelId, authToken, navigate, logout]);


    // --- Send Message Handler (uses REST API) ---
    const handleSendMessage = async (content) => {
        if (!content.trim()) return; // Ignore empty messages
        // Disable sending if not connected? Or allow and rely on backend error?
        // For now, allow sending; backend should reject if not member/etc.
        try {
            // POST the message via the REST API
            // The backend's responsibility is to save it AND broadcast via WebSocket
            await sendMessage(channelId, content);
            // We don't add the message to state here; we wait for the WebSocket echo
            // This ensures consistency if the POST fails or the backend modifies the message
        } catch (err) {
            console.error("Failed to send message:", err);
            setError(`Failed to send message. ${err.response?.data?.detail || ''}`);
            if (err.response?.status === 401) { // Handle unauthorized
                logout();
                navigate('/login');
            }
        }
    };

    // --- Render the Chat View ---
    return (
        <div>
            {/* Link to go back to the channel list */}
            <Link to="/"> &larr; Back to Channels</Link>
            <h2>Chat - Channel {channelId}</h2> {/* TODO: Fetch and display channel name */}

            {/* Display WebSocket connection status */}
            <p style={{ color: isConnected ? 'green' : 'red', fontWeight: 'bold' }}>
                Status: {isConnected ? 'Connected (Real-time)' : 'Disconnected'}
             </p>

            {/* Display loading indicator */}
            {loading && <p>Loading messages...</p>}

            {/* Display errors */}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Render the list of messages */}
            <MessageList messages={messages} />

            {/* Render the message input component */}
            {/* Disable input if WebSocket is not connected or messages are still loading */}
            <MessageInput onSendMessage={handleSendMessage} disabled={!isConnected || loading} />
        </div>
    );
}

export default ChatView;