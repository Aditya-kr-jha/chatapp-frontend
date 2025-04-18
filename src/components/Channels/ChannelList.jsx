import React from 'react';
import PropTypes from 'prop-types';
// Assuming App.css is imported globally

// Add actionButtonClass prop
function ChannelList({ title, channels, onItemClick, actionButtonLabel, onActionButtonClick, actionButtonClass }) {
  return (
    // Use CSS classes instead of inline styles for the container
    <div className="channel-list-container">
      {/* Use a class for the title */}
      <h3 className="channel-list-title">{title}</h3>

      {/* Display message if empty */}
      {channels.length === 0 ? (
        <p className="channel-list-empty">No channels available.</p>
      ) : (
        // Use class for the list itself
        <ul className="channel-list">
          {channels.map((channel) => (
            // Use class for list items
            <li key={channel.id} className="channel-list-item">
              {/* Channel name span with class */}
              <span
                className="channel-name" // Apply class
                onClick={onItemClick ? () => onItemClick(channel.id) : undefined}
                style={{ cursor: onItemClick ? 'pointer' : 'default' }} // Keep cursor style inline for conditional logic
                title={channel.name} // Show full name on hover
              >
                {channel.name}
              </span>

              {/* Action button */}
              {actionButtonLabel && onActionButtonClick && (
                // Add base button class and conditional class (e.g., 'danger')
                <button
                    className={`channel-action-button ${actionButtonClass || ''}`} // Combine classes
                    onClick={() => onActionButtonClick(channel.id)}
                >
                  {actionButtonLabel}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Updated PropTypes
ChannelList.propTypes = {
    title: PropTypes.string.isRequired,
    channels: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string.isRequired,
    })).isRequired,
    onItemClick: PropTypes.func,
    actionButtonLabel: PropTypes.string,
    onActionButtonClick: PropTypes.func,
    actionButtonClass: PropTypes.string, // Optional class for the button (e.g., 'danger', 'secondary')
};

// Default prop for button class
ChannelList.defaultProps = {
    actionButtonClass: 'primary', // Default to primary button style
};


export default ChannelList;