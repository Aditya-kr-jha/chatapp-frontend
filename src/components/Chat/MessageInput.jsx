import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
// Assuming App.css is imported globally in App.js

// --- Icons ---
// Ensure these SVG definitions are correct and visible
const PaperclipIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#555" // Explicit size and fill color
    viewBox="0 0 16 16">
    <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z"/>
  </svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
        <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
    </svg>
);


function MessageInput({ onSendMessage, onSendFile, disabled }) {
  const [message, setMessage] = useState(''); // State for text input value
  const [selectedFile, setSelectedFile] = useState(null); // State for the selected file object
  const fileInputRef = useRef(null); // Ref to access the hidden file input element

  // --- Event Handlers ---

  /**
   * Handles the submission of a text message.
   * Prevents submission if disabled, no message, or a file is selected.
   * Calls the onSendMessage prop and clears the input.
   */
  const handleTextSubmit = (e) => {
    // Prevent default form submission behavior (though onClick is used on button)
    if (e) e.preventDefault();
    // Guard conditions
    if (disabled || !message.trim() || selectedFile) {
        console.warn("Text submit prevented:", { disabled, message, selectedFile });
        return;
    }
    console.log("Sending text message:", message.trim());
    onSendMessage(message.trim()); // Call the parent component's handler
    setMessage(''); // Clear the text input
  };

  /**
   * Handles the change event of the hidden file input.
   * Sets the selected file state and clears the text input.
   * Resets the file input value to allow selecting the same file again.
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0]; // Get the first selected file
    if (file) {
      console.log("File selected:", file.name, file.size, file.type);
      setSelectedFile(file);
      setMessage(''); // Clear any typed text message when a file is chosen
    }
    // Reset the input value to allow selecting the same file again if the user cancels and re-selects
    if (fileInputRef.current) {
        fileInputRef.current.value = null;
    }
  };

  /**
   * Handles the submission of a selected file.
   * Prevents submission if disabled or no file is selected.
   * Calls the onSendFile prop and clears the file selection state.
   */
  const handleFileSubmit = () => {
    // Guard conditions
    if (disabled || !selectedFile) {
         console.warn("File submit prevented:", { disabled, selectedFile });
        return;
    }
    console.log("Sending file:", selectedFile.name);
    onSendFile(selectedFile); // Call the parent component's handler
    setSelectedFile(null); // Clear the file selection state after initiating send
  };

  /**
   * Programmatically clicks the hidden file input element.
   */
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Open the file selection dialog
    }
  };

  /**
   * Handles key down events in the textarea, specifically the Enter key.
   * Sends the message/file if Enter is pressed without Shift.
   */
  const handleKeyDown = (e) => {
    // Check if Enter key was pressed without the Shift key
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent adding a newline in the textarea
      if (selectedFile) {
        handleFileSubmit(); // If a file is selected, Enter sends the file
      } else if (message.trim()) {
        handleTextSubmit(); // If text is present (and no file), Enter sends the text
      }
    }
    // Allow Shift+Enter for newlines (default textarea behavior)
  };

  /**
   * Clears the currently selected file state.
   */
  const clearSelectedFile = () => {
    console.log("Clearing selected file.");
    setSelectedFile(null);
  };

  // --- Render Logic ---
  return (
    // Use div wrapper, styles are applied via CSS classes
    <div>
        {/* Selected File Information Bar (only shown if a file is selected) */}
        {selectedFile && (
            <div className="selected-file-info-bar">
                <div className="selected-file-info">
                    {/* Display file name */}
                    <span className="selected-file-name" title={selectedFile.name}>
                        File: {selectedFile.name}
                    </span>
                    {/* Button to clear the selected file */}
                    <button
                        onClick={clearSelectedFile}
                        className="clear-file-button"
                        title="Clear file selection"
                        aria-label="Clear selected file"
                    >
                        &times; {/* Cross symbol */}
                    </button>
                </div>
            </div>
        )}

        {/* Main Input Area containing buttons and textarea */}
        <div className="message-input-area">
            {/* Hidden File Input Element */}
            <input
                type="file"
                ref={fileInputRef} // Attach the ref
                onChange={handleFileChange} // Attach the change handler
                style={{ display: 'none' }} // Keep it hidden
                disabled={disabled} // Disable if the whole input is disabled
                // Optional: Add 'accept' attribute to hint file types
                // accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            />

            {/* File Upload Button (triggers the hidden input) */}
            <button
                type="button" // Important: Not type="submit"
                onClick={triggerFileInput} // Attach click handler
                // Disable if the component is disabled OR if a file is already selected
                disabled={disabled || !!selectedFile}
                title="Attach file"
                className="message-input-file-button" // Apply CSS class
                aria-label="Attach file"
            >
                <PaperclipIcon /> {/* Display the icon */}
            </button>

            {/* Textarea for typing messages */}
            <textarea
                value={message} // Controlled component: value from state
                onChange={(e) => setMessage(e.target.value)} // Update state on change
                onKeyDown={handleKeyDown} // Handle Enter key press
                placeholder={disabled ? "Connecting..." : (selectedFile ? "File selected" : "Type a message...")} // Dynamic placeholder
                // Disable if the component is disabled OR if a file is selected (prevent typing text with file)
                disabled={disabled || !!selectedFile}
                rows="1" // Start with 1 row, CSS might allow expansion
                className="message-input-textarea" // Apply CSS class
                aria-label="Message input"
            />

            {/* Send Button (dynamically sends file or text) */}
            <button
                type="button" // Important: Not type="submit"
                // Determine action based on whether a file is selected
                onClick={selectedFile ? handleFileSubmit : handleTextSubmit}
                // Disable logic: component disabled, OR (no file selected AND no trimmed text message)
                disabled={disabled || (!selectedFile && !message.trim())}
                className="message-input-send-button" // Apply CSS class
                title={selectedFile ? "Send File" : "Send Message"} // Dynamic tooltip
                aria-label={selectedFile ? "Send File" : "Send Message"}
            >
                <SendIcon /> {/* Display the send icon */}
            </button>
        </div>
    </div>
  );
}

// PropTypes for type validation and documentation
MessageInput.propTypes = {
    /** Function to call when sending a text message */
    onSendMessage: PropTypes.func.isRequired,
    /** Function to call when sending a file */
    onSendFile: PropTypes.func.isRequired,
    /** Flag to disable the entire input area (buttons and textarea) */
    disabled: PropTypes.bool,
};

// Default props if needed
MessageInput.defaultProps = {
    disabled: false,
};

export default MessageInput;