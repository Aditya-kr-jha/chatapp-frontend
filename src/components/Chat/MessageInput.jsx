import React, { useState } from 'react';
import PropTypes from 'prop-types';

function MessageInput({ onSendMessage, disabled }) {
  const [message, setMessage] = useState(''); // State to hold the input value

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission (page reload)
    // Ignore submission if disabled or message is empty/whitespace only
    if (disabled || !message.trim()) return;

    onSendMessage(message.trim()); // Call the handler passed via props
    setMessage(''); // Clear the input field after sending
  };

  // Handle pressing Enter key in the input field
  const handleKeyDown = (e) => {
      // Check if Enter key was pressed without the Shift key
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault(); // Prevent adding a newline
          handleSubmit(e); // Submit the form
      }
      // Allow Shift+Enter for newlines (default textarea behavior)
  };


  return (
    // Use a form element for accessibility and standard practices
    <form onSubmit={handleSubmit} style={{ display: 'flex', marginTop: '10px' }}>
      {/* Use a textarea for potentially multi-line messages */}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown} // Handle Enter key press
        placeholder={disabled ? "Connecting..." : "Type your message (Shift+Enter for newline)..."}
        disabled={disabled} // Disable input based on props (e.g., while disconnected)
        rows="2" // Start with 2 rows, can expand
        style={{
            flexGrow: 1, // Take up available space
            marginRight: '8px', // Spacing before button
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            resize: 'none', // Prevent manual resizing by user
            fontFamily: 'inherit', // Use the same font as the rest of the app
            fontSize: '1em',
            lineHeight: '1.4'
         }}
      />
      {/* Submit button */}
      <button
        type="submit"
        disabled={disabled || !message.trim()} // Disable if disconnected or input is empty
        style={{ padding: '10px 15px' }} // Adjust padding
      >
        Send
      </button>
    </form>
  );
}

// PropTypes for validation
MessageInput.propTypes = {
    onSendMessage: PropTypes.func.isRequired, // Function to call when sending a message
    disabled: PropTypes.bool, // Flag to disable the input and button
};

export default MessageInput;