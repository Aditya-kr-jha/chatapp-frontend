import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getMessagesForChannel, sendTextMessage, uploadFileMessage } from '../../services/api'; // Ensure API functions are correctly imported
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ImageModal from './ImageModal'; // Import the modal component
import { useAuth } from '../../contexts/AuthContext';
// Assuming App.css is imported globally in App.js

// --- Configuration ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'; // Use environment variable or default
const wsProtocol = API_BASE_URL.startsWith('https://') ? 'wss://' : 'ws://';
const wsHost = API_BASE_URL.replace(/^https?:\/\//, ''); // Extract hostname and port

function ChatView() {
    const { channelId } = useParams(); // Get channel ID from URL parameters
    const { authToken, logout, user } = useAuth(); // Get authentication context details
    const [messages, setMessages] = useState([]); // State to hold chat messages
    const [channelName, setChannelName] = useState(`Channel ${channelId}`); // Placeholder for channel name
    const [loading, setLoading] = useState(true); // State for initial message loading indicator
    const [error, setError] = useState(null); // State for general errors
    const [isConnected, setIsConnected] = useState(false); // State for WebSocket connection status
    const [uploadError, setUploadError] = useState(null); // State for file upload specific errors
    const [isUploading, setIsUploading] = useState(false); // State to indicate if a file upload is in progress
    const socketRef = useRef(null); // Ref to hold the WebSocket instance
    const navigate = useNavigate(); // Hook for programmatic navigation

    // --- State for Image Modal ---
    const [isImageModalOpen, setIsImageModalOpen] = useState(false); // Is the modal currently visible?
    const [modalImageUrl, setModalImageUrl] = useState(null); // Which image URL to show in the modal

    // --- Handlers for Image Modal ---
    /** Opens the image modal with the provided image URL */
    const openImageModal = useCallback((imageUrl) => {
        if (imageUrl) {
            console.log("ChatView: Opening image modal for:", imageUrl);
            setModalImageUrl(imageUrl);
            setIsImageModalOpen(true);
        } else {
            console.warn("ChatView: Attempted to open image modal without a valid URL.");
        }
    }, []); // No dependencies needed, just sets state

    /** Closes the image modal and clears the URL */
    const closeImageModal = useCallback(() => {
        console.log("ChatView: Closing image modal");
        setIsImageModalOpen(false);
        setModalImageUrl(null); // Clear the URL when closing
    }, []); // No dependencies needed

    // --- Fetch initial messages ---
    const fetchMessages = useCallback(async () => {
        if (!channelId) return;
        setLoading(true);
        setError(null);
        setUploadError(null);
        console.log(`ChatView: Fetching messages for channel ${channelId}`);
        try {
            const response = await getMessagesForChannel(channelId);
            // TODO: Optionally fetch channel details for the name
            const sortedMessages = (response.data || []).sort((a, b) =>
                new Date(a.created_at) - new Date(b.created_at)
            );
            setMessages(sortedMessages);
            console.log(`ChatView: Fetched ${sortedMessages.length} messages.`);
        } catch (err) {
            console.error("ChatView: Failed to fetch messages:", err.response?.data || err.message);
            setError(`Failed to load messages.`);
            if (err.response?.status === 401) { logout(); navigate('/login'); }
            if (err.response?.status === 403 || err.response?.status === 404) { setError("Access denied or channel not found."); }
        } finally {
            setLoading(false);
        }
    }, [channelId, navigate, logout]); // Dependencies

    // --- Effect to Fetch Messages on Mount/Channel Change ---
    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]); // Re-run if fetchMessages changes (due to channelId change)

    // --- WebSocket Connection Logic ---
    useEffect(() => {
        if (!authToken || !channelId) {
            console.log("ChatView: WebSocket prerequisites not met.");
            return; // Don't connect if no token or channel ID
        }

        // Close existing connection if any
        if (socketRef.current) {
            console.log("ChatView: Closing previous WebSocket connection.");
            socketRef.current.close(1000, "New connection requested");
            socketRef.current = null;
            setIsConnected(false);
        }

        // Connect WebSocket
        const wsUrl = `${wsProtocol}${wsHost}/ws/${channelId}?token=${authToken}`;
        console.log("ChatView: Attempting WebSocket connection:", wsUrl);
        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        // Event Handlers
        ws.onopen = () => {
            console.log(`ChatView: WebSocket connected.`);
            setIsConnected(true); setError(null);
        };
        ws.onclose = (event) => {
            console.log(`ChatView: WebSocket disconnected. Code: ${event.code}, Clean: ${event.wasClean}`);
            setIsConnected(false);
            if (socketRef.current === ws) socketRef.current = null;
            if (event.code === 1008) { setError("Connection closed: Not authorized."); logout(); navigate('/login'); }
            else if (!event.wasClean && event.code !== 1000 && event.code !== 1001) { setError("Real-time connection lost."); }
        };
        ws.onerror = (event) => {
            console.error("ChatView: WebSocket error:", event);
            if (!error && !isConnected) setError("Connection error.");
            setIsConnected(false);
            if (socketRef.current === ws) socketRef.current = null;
        };
        ws.onmessage = (event) => {
            try {
                const newMessage = JSON.parse(event.data);
                console.log('ChatView: Received WebSocket message:', newMessage);
                setMessages((prevMessages) => {
                    if (prevMessages.some(msg => msg.id === newMessage.id)) return prevMessages; // Avoid duplicates
                    return [...prevMessages, newMessage].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); // Add and sort
                });
                setUploadError(null); // Clear upload error on receiving any message
            } catch (e) {
                console.error("ChatView: Failed to parse WebSocket message:", event.data, e);
            }
        };

        // Cleanup function
        return () => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                console.log(`ChatView: Closing WebSocket connection during cleanup.`);
                ws.close(1000, "Component unmounting");
            }
            if (socketRef.current === ws) socketRef.current = null;
            setIsConnected(false); // Ensure status is false on unmount/reconnect
        };
    }, [channelId, authToken, navigate, logout]); // Dependencies for WebSocket effect

    // --- Send Handlers ---
    /** Handles sending a text message */
    const handleSendTextMessage = useCallback(async (content) => {
        if (!isConnected || isUploading || !content.trim()) return;
        setError(null); setUploadError(null);
        console.log(`ChatView: Sending text message to channel ${channelId}`);
        try {
            await sendTextMessage(channelId, content); // API call
            // Rely on WebSocket echo
        } catch (err) {
            console.error("ChatView: Failed to send text message:", err.response?.data || err.message);
            setError(`Failed to send. ${err.response?.data?.detail || ''}`);
            if (err.response?.status === 401) { logout(); navigate('/login'); }
        }
    }, [channelId, isUploading, isConnected, logout, navigate]); // Dependencies

    /** Handles sending a file message */
    const handleSendFileMessage = useCallback(async (file) => {
        if (!isConnected || isUploading || !file) return;
        setError(null); setUploadError(null); setIsUploading(true);
        console.log(`ChatView: Uploading file "${file.name}" to channel ${channelId}`);
        try {
            await uploadFileMessage(channelId, file); // API call
             // Rely on WebSocket echo
        } catch (err) {
            console.error("ChatView: Failed to upload file:", err.response?.data || err.message);
            setUploadError(`Upload failed: ${err.response?.data?.detail || err.message || 'Unknown error'}`);
             if (err.response?.status === 401) { logout(); navigate('/login'); }
             if (err.response?.status === 413) { setUploadError("Upload failed: File is too large."); }
        } finally {
            setIsUploading(false); // Clear uploading state
        }
    }, [channelId, isUploading, isConnected, logout, navigate]); // Dependencies

    // --- Render ---
    return (
        // Main container using CSS class
        <div className="chat-view-container">
            {/* Header Section */}
            <div className="chat-header">
                 <Link to="/" className="back-link" title="Back to Channels">&larr; Back</Link>
                 <span className="channel-title">Zync - {channelName}</span>
                 <span className={`chat-status ${isConnected ? 'connected' : 'disconnected'}`}>
                     {isConnected ? 'Connected' : 'Disconnected'}
                 </span>
            </div>

             {/* Status Indicators Section */}
            <div className="chat-indicators">
                {loading && <p className="chat-loading">Loading messages...</p>}
                {error && <p className="chat-error">Error: {error}</p>}
                {uploadError && <p className="chat-upload-error">Upload Error: {uploadError}</p>}
                {isUploading && <p className="chat-uploading">Uploading file...</p>}
            </div>

            {/* Message List Component */}
            {/* Pass down the messages, current user, and the image click handler */}
            <MessageList
                messages={messages}
                currentUser={user}
                onImageClick={openImageModal} // Pass the modal opening function
            />

            {/* Message Input Component */}
            <MessageInput
                onSendMessage={handleSendTextMessage}
                onSendFile={handleSendFileMessage}
                disabled={!isConnected || loading || isUploading} // Disable input based on state
            />

            {/* Image Modal Component */}
            {/* Rendered conditionally based on state */}
            <ImageModal
                isOpen={isImageModalOpen}
                imageUrl={modalImageUrl}
                onClose={closeImageModal} // Pass the closing function
            />
        </div>
    );
}

export default ChatView;
