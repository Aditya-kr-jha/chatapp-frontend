import React from 'react';
import PropTypes from 'prop-types';

function ChannelList({ title, channels, onItemClick, actionButtonLabel, onActionButtonClick }) {
  return (
    // Basic styling for the list container
    <div style={{ border: '1px solid #ccc', padding: '15px', margin: '10px', width: '45%', minWidth: '300px' }}> {/* Added minWidth */}
      <h3>{title}</h3>
      {/* Display a message if the list is empty */}
      {channels.length === 0 ? (
        <p>No channels available.</p>
      ) : (
        // Render the list of channels
        <ul>
          {channels.map((channel) => (
            <li key={channel.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px', padding: '5px 0' }}>
              {/* Channel name - clickable if onItemClick is provided */}
              <span
                onClick={onItemClick ? () => onItemClick(channel.id) : undefined}
                style={{
                    cursor: onItemClick ? 'pointer' : 'default',
                    flexGrow: 1,
                    marginRight: '10px',
                    overflow: 'hidden', // Prevent long names breaking layout
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                 }}
                 title={channel.name} // Show full name on hover
              >
                {channel.name} {/* Assuming channel object has 'name' */}
              </span>
              {/* Action button (Join/Leave) - displayed if label and click handler are provided */}
              {actionButtonLabel && onActionButtonClick && (
                <button onClick={() => onActionButtonClick(channel.id)} style={{ flexShrink: 0 }}> {/* Prevent button shrinking */}
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

// PropTypes for type checking and defining component API
ChannelList.propTypes = {
    title: PropTypes.string.isRequired, // The heading for the list
    channels: PropTypes.arrayOf(PropTypes.shape({ // Expects an array of channel objects
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, // Channel ID (string or number)
        name: PropTypes.string.isRequired, // Channel name
        // Add other expected channel properties if needed
    })).isRequired,
    onItemClick: PropTypes.func, // Optional: Function called when channel name is clicked (passes channelId)
    actionButtonLabel: PropTypes.string, // Optional: Text for the action button (e.g., "Join", "Leave")
    onActionButtonClick: PropTypes.func, // Optional: Function called when action button is clicked (passes channelId)
};

export default ChannelList;