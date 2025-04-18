import React from 'react';
import PropTypes from 'prop-types';

// Simple modal component for displaying images
function ImageModal({ isOpen, imageUrl, onClose }) {
  // If the modal is not open, render nothing
  if (!isOpen || !imageUrl) {
    return null;
  }

  // Prevent clicks inside the content area from closing the modal
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    // Backdrop: covers the screen, clicking it closes the modal
    <div className="image-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      {/* Content area: holds the image and close button */}
      <div className="image-modal-content" onClick={handleContentClick}>
        {/* Close Button */}
        <button
            className="image-modal-close-button"
            onClick={onClose}
            aria-label="Close image view"
        >
          &times; {/* Simple 'x' symbol */}
        </button>
        {/* The enlarged image */}
        <img
            src={imageUrl}
            alt="Enlarged view"
            className="image-modal-image"
        />
      </div>
    </div>
  );
}

ImageModal.propTypes = {
  /** Controls whether the modal is visible */
  isOpen: PropTypes.bool.isRequired,
  /** The URL of the image to display */
  imageUrl: PropTypes.string,
  /** Function to call when the modal should be closed */
  onClose: PropTypes.func.isRequired,
};

ImageModal.defaultProps = {
  imageUrl: null,
};

export default ImageModal;