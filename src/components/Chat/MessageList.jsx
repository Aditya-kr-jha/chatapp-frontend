import React, { useRef, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getFileAccessUrl } from '../../services/api'; // Ensure this path is correct

// --- Helper Component for Rendering File Messages ---
const FileMessageItem = ({ message, isOwnMessage, onImageClick }) => {
    const [accessUrl, setAccessUrl] = useState(null);
    const [isLoadingUrl, setIsLoadingUrl] = useState(false);
    const [errorUrl, setErrorUrl] = useState(null);
    const isMounted = useRef(true);

    const mimeType = message.content_type || 'application/octet-stream';
    const fileName = message.original_filename || 'Untitled File';

    const fetchUrl = useCallback(async (msgId) => {
        if (!msgId) {
            if (isMounted.current) setErrorUrl("File information incomplete.");
            return;
        }
        if (isLoadingUrl) return;

        if (isMounted.current) { setIsLoadingUrl(true); setErrorUrl(null); setAccessUrl(null); }

        try {
            const response = await getFileAccessUrl(msgId);
            if (isMounted.current) {
                if (response.data && response.data.access_url) {
                    setAccessUrl(response.data.access_url);
                } else {
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
    }, [isLoadingUrl]);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    useEffect(() => {
        if (message.id && !accessUrl && !isLoadingUrl && !errorUrl) {
            fetchUrl(message.id);
        }
    }, [message.id, fetchUrl, accessUrl, isLoadingUrl, errorUrl]);

    const renderPreview = () => {
        if (isLoadingUrl) return <p className="file-preview-status">Loading preview...</p>;
        if (errorUrl) return <p className="file-preview-error">{errorUrl}</p>;
        if (!accessUrl) return <p className="file-preview-status">Preparing file link...</p>;

        if (mimeType.startsWith('image/')) {
            return (
                <img
                    src={accessUrl} alt={fileName} className="file-preview-image"
                    onClick={() => onImageClick && onImageClick(accessUrl)}
                    role="button" tabIndex="0"
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onImageClick && onImageClick(accessUrl);}}
                />
            );
        }
        if (mimeType.startsWith('video/')) {
            return <video controls src={accessUrl} className="file-preview-video"><a href={accessUrl} target="_blank" rel="noopener noreferrer">Download Video</a></video>;
        }
        if (mimeType.startsWith('audio/')) {
            return <audio controls src={accessUrl} className="file-preview-audio"><a href={accessUrl} target="_blank" rel="noopener noreferrer">Download Audio</a></audio>;
        }
        return <a href={accessUrl} target="_blank" rel="noopener noreferrer" className="file-download-link" download={fileName}>Download {fileName}</a>;
    };

    return (
        <>
            {/* --- FIXED: Always render author --- */}
            <strong className="message-author">
                {message.author?.username || message.author_id || 'Unknown User'}
            </strong>
            <p className="file-info">
                {fileName} <span className="file-mimetype">({mimeType})</span>
            </p>
            {renderPreview()}
            <small className="message-timestamp">
                {message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
            </small>
        </>
    );
};

FileMessageItem.propTypes = {
    message: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        author_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        author: PropTypes.shape({ username: PropTypes.string }),
        created_at: PropTypes.string,
        s3_key: PropTypes.string.isRequired,
        original_filename: PropTypes.string,
        content_type: PropTypes.string,
    }).isRequired,
    isOwnMessage: PropTypes.bool.isRequired, // Keep prop even if not used for author visibility
    onImageClick: PropTypes.func,
};
FileMessageItem.defaultProps = { onImageClick: null };


// --- Main MessageList Component ---
function MessageList({ messages, currentUser, onImageClick }) {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
    useEffect(() => { scrollToBottom(); }, [messages]);

    return (
        <div className="message-list-container">
            {messages.length === 0 ? (
                <p className="empty-chat-message">No messages yet. Start the conversation or send a file!</p>
            ) : (
                messages.map((msg) => {
                    const isOwn = currentUser ? (msg.author_id === currentUser.id || msg.author?.id === currentUser.id) : false;
                    const messageClass = isOwn ? 'message-bubble own-message' : 'message-bubble other-message';
                    const isFile = !!msg.s3_key;

                    return (
                        <div key={msg.id} className={messageClass}>
                            {isFile ? (
                                <FileMessageItem message={msg} isOwnMessage={isOwn} onImageClick={onImageClick} />
                            ) : (
                                <>
                                    {/* --- FIXED: Always render author --- */}
                                    <strong className="message-author">
                                        {msg.author?.username || msg.author_id || 'Unknown User'}
                                    </strong>
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
            <div ref={messagesEndRef} />
        </div>
    );
}

MessageList.propTypes = {
    messages: PropTypes.arrayOf(PropTypes.shape({
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
    onImageClick: PropTypes.func,
};
MessageList.defaultProps = { currentUser: null, onImageClick: null };

export default MessageList;