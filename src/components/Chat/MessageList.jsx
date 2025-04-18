import React, { useRef, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getFileAccessUrl } from '../../services/api'; // Ensure this path is correct

// --- Helper Component for Rendering File Messages ---
const FileMessageItem = ({ message, isOwnMessage, onImageClick }) => {
    // State hooks for managing the file access URL
    const [accessUrl, setAccessUrl] = useState(null); // Stores the fetched S3 URL
    const [isLoadingUrl, setIsLoadingUrl] = useState(false); // Tracks if the URL is currently being fetched
    const [errorUrl, setErrorUrl] = useState(null); // Stores any error message related to URL fetching
    const isMounted = useRef(true); // Ref to track if the component is still mounted

    // Get file info directly from message props (adjust fields if backend differs)
    const mimeType = message.content_type || 'application/octet-stream';
    const fileName = message.original_filename || 'Untitled File';

    /**
     * Fetches the pre-signed access URL for the file message from the backend.
     */
    const fetchUrl = useCallback(async (msgId) => {
        // Guard clauses
        if (!msgId) {
            console.warn("FileMessageItem: Cannot fetch URL without message ID.");
            if (isMounted.current) setErrorUrl("File information incomplete.");
            return;
        }
        if (isLoadingUrl) return; // Prevent concurrent fetches

        console.log(`FileMessageItem: Attempting fetch for message ID: ${msgId}`);
        if (isMounted.current) {
            setIsLoadingUrl(true); setErrorUrl(null); setAccessUrl(null);
        }

        try {
            const response = await getFileAccessUrl(msgId); // API call
            if (isMounted.current) {
                if (response.data && response.data.access_url) {
                    setAccessUrl(response.data.access_url); // Store the fetched URL
                    console.log(`FileMessageItem: URL fetched successfully for ${msgId}`);
                } else {
                    console.error(`FileMessageItem: Invalid response structure for ${msgId}:`, response.data);
                    setErrorUrl('Failed to get valid file URL.');
                }
            }
        } catch (err) {
            console.error(`FileMessageItem: Error fetching URL for ${msgId}:`, err.response?.data || err.message);
            if (isMounted.current) {
                setErrorUrl('Could not load file preview/link.');
                if (err.response?.status === 401 || err.response?.status === 403) {
                     setErrorUrl('Unauthorized to view file.');
                }
            }
        } finally {
            if (isMounted.current) setIsLoadingUrl(false);
        }
    }, [isLoadingUrl]); // Dependency prevents re-triggering fetch while loading

    // Effect to manage the isMounted ref lifecycle
    useEffect(() => {
        isMounted.current = true; // Component did mount
        return () => { isMounted.current = false; }; // Component will unmount
    }, []); // Runs once

    // Effect to trigger the URL fetch when necessary
    useEffect(() => {
        // Fetch only if needed (has ID, no URL yet, not loading, no error)
        if (message.id && !accessUrl && !isLoadingUrl && !errorUrl) {
            fetchUrl(message.id);
        }
    }, [message.id, fetchUrl, accessUrl, isLoadingUrl, errorUrl]); // Dependencies

    /**
     * Renders the appropriate preview (image, video, audio) or a download link.
     */
    const renderPreview = () => {
        // Render status messages first
        if (isLoadingUrl) return <p className="file-preview-status">Loading preview...</p>;
        if (errorUrl) return <p className="file-preview-error">{errorUrl}</p>;
        if (!accessUrl) return <p className="file-preview-status">Preparing file link...</p>;

        // Render image preview with onClick handler
        if (mimeType.startsWith('image/')) {
            return (
                <img
                    src={accessUrl}
                    alt={fileName}
                    className="file-preview-image"
                    onClick={() => onImageClick && onImageClick(accessUrl)} // Call passed handler
                    role="button" // Accessibility: indicate it's clickable
                    tabIndex="0" // Accessibility: make it focusable
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onImageClick && onImageClick(accessUrl);}} // Basic keyboard activation
                />
            );
        }
        // Render video preview
        if (mimeType.startsWith('video/')) {
            return (
                <video controls src={accessUrl} className="file-preview-video">
                    <a href={accessUrl} target="_blank" rel="noopener noreferrer">Download Video</a>
                </video>
            );
        }
        // Render audio preview
        if (mimeType.startsWith('audio/')) {
            return (
                <audio controls src={accessUrl} className="file-preview-audio">
                    <a href={accessUrl} target="_blank" rel="noopener noreferrer">Download Audio</a>
                </audio>
            );
        }
        // Default download link
        return (
            <a href={accessUrl} target="_blank" rel="noopener noreferrer" className="file-download-link" download={fileName}>
                Download {fileName}
            </a>
        );
    };

    // JSX structure for the file message item
    return (
        <>
            {/* Conditionally display author name */}
            {!isOwnMessage && (
                <strong className="message-author">
                    {message.author?.username || message.author_id || 'Unknown User'}
                </strong>
            )}
            {/* Display file name and MIME type */}
            <p className="file-info">
                {fileName}
                 <span className="file-mimetype">({mimeType})</span>
            </p>
            {/* Render the preview/link area */}
            {renderPreview()}
            {/* Display timestamp */}
            <small className="message-timestamp">
                {message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
            </small>
        </>
    );
};

// PropTypes for FileMessageItem, including onImageClick
FileMessageItem.propTypes = {
    message: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        author_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        author: PropTypes.shape({ username: PropTypes.string }),
        created_at: PropTypes.string,
        s3_key: PropTypes.string.isRequired, // Expect s3_key for file messages
        original_filename: PropTypes.string,
        content_type: PropTypes.string,
    }).isRequired,
    isOwnMessage: PropTypes.bool.isRequired,
    onImageClick: PropTypes.func, // Function to handle image preview clicks
};
FileMessageItem.defaultProps = {
    onImageClick: null, // Default to null if not provided
};


// --- Main MessageList Component ---
// Accepts messages, currentUser, and the onImageClick handler
function MessageList({ messages, currentUser, onImageClick }) {
    const messagesEndRef = useRef(null); // Ref for auto-scrolling

    // Function to scroll to the bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Effect to scroll down when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        // Container for the list
        <div className="message-list-container">
            {/* Placeholder when no messages */}
            {messages.length === 0 ? (
                <p className="empty-chat-message">
                    No messages yet. Start the conversation or send a file!
                </p>
            ) : (
                // Map over messages
                messages.map((msg) => {
                    // Determine ownership and style
                    const isOwn = currentUser ? (msg.author_id === currentUser.id || msg.author?.id === currentUser.id) : false;
                    const messageClass = isOwn ? 'message-bubble own-message' : 'message-bubble other-message';
                    // Check if it's a file message (using s3_key presence)
                    const isFile = !!msg.s3_key;

                    // Render the message bubble
                    return (
                        <div key={msg.id} className={messageClass}>
                            {isFile ? (
                                // Render FileMessageItem for files, passing down onImageClick
                                <FileMessageItem
                                    message={msg}
                                    isOwnMessage={isOwn}
                                    onImageClick={onImageClick} // Pass the handler
                                />
                            ) : (
                                // Render standard text message content
                                <>
                                    {!isOwn && (
                                        <strong className="message-author">
                                            {msg.author?.username || msg.author_id || 'Unknown User'}
                                        </strong>
                                    )}
                                    <p className="message-content">{msg.content}</p>
                                    <small className="message-timestamp">
                                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                                    </small>
                                </>
                            )}
                        </div>
                    );
                })
            )}
            {/* Scroll target */}
            <div ref={messagesEndRef} />
        </div>
    );
}

// PropTypes for MessageList, including onImageClick
MessageList.propTypes = {
    messages: PropTypes.arrayOf(PropTypes.shape({ // Message shape defined earlier
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        content: PropTypes.string,
        author_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        author: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), username: PropTypes.string }),
        created_at: PropTypes.string,
        s3_key: PropTypes.string,
        original_filename: PropTypes.string,
        content_type: PropTypes.string,
    })).isRequired,
    currentUser: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }),
    onImageClick: PropTypes.func, // Expect the handler function
};

MessageList.defaultProps = {
    currentUser: null,
    onImageClick: null, // Default prop value
};

export default MessageList;