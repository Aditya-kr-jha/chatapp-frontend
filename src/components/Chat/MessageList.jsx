import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

function MessageList({ messages }) {
  const messagesEndRef = useRef(null); // Ref to the bottom of the message list

  // Function to scroll the message list to the bottom
  const scrollToBottom = () => {
    // Use optional chaining ?. in case the ref isn't attached yet
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  // useEffect hook to scroll down whenever the messages array changes
  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Dependency array: run effect when 'messages' updates

  return (
    // Container for the message list with scrolling
    <div style={{
        height: '400px', // Fixed height
        overflowY: 'auto', // Enable vertical scrolling
        border: '1px solid #eee',
        marginBottom: '10px',
        padding: '10px',
        display: 'flex', // Use flexbox for layout
        flexDirection: 'column' // Stack messages vertically
     }}>
      {/* Display a message if there are no messages */}
      {messages.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#888', marginTop: 'auto', marginBottom: 'auto' }}>
            No messages yet. Start the conversation!
        </p>
      ) : (
        // Map over the messages array and render each message
        messages.map((msg) => (
          <div key={msg.id} style={{
              marginBottom: '8px',
              padding: '8px 12px', // Added more padding
              background: '#f0f0f0', // Slightly different background
              borderRadius: '8px', // More rounded corners
              maxWidth: '80%', // Limit message width
              alignSelf: 'flex-start' // Default alignment (adjust for 'my' messages later)
              // TODO: Add logic to align messages from the current user to the right ('alignSelf: flex-end')
              // This requires knowing the current user's ID.
           }}>
            {/* Display author information (TODO: fetch username based on author_id) */}
            <strong style={{ display: 'block', marginBottom: '3px', color: '#555' }}>
                {msg.author_id || 'Unknown User'} {/* Placeholder */}
            </strong>
            {/* Display message content */}
            <p style={{ margin: '0', wordWrap: 'break-word' }}> {/* Ensure long words wrap */}
                {msg.content}
            </p>
            {/* Display timestamp */}
            <small style={{
                display: 'block', // Put timestamp on new line
                marginTop: '4px',
                color: '#999',
                fontSize: '0.75em',
                textAlign: 'right' // Align timestamp right
             }}>
              {/* Format timestamp nicely */}
              {msg.created_at ? new Date(msg.created_at).toLocaleString() : 'Sending...'}
            </small>
          </div>
        ))
      )}
      {/* Invisible div at the end to target for scrolling */}
      <div ref={messagesEndRef} />
    </div>
  );
}

// PropTypes for type validation
 MessageList.propTypes = {
    messages: PropTypes.arrayOf(PropTypes.shape({ // Expects an array of message objects
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, // Message ID
        content: PropTypes.string.isRequired, // Message text content
        author_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // ID of the author (optional for now)
        created_at: PropTypes.string, // Timestamp (ISO string format expected)
        // Add other expected message properties if needed (e.g., channel_id)
    })).isRequired,
};

export default MessageList;