// components/FaqModal.js
import React from 'react';
import FaqForm from './FaqForm';

const FaqModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '500px',
        color: '#333',
      }} onClick={e => e.stopPropagation()}>
        <FaqForm isOpen={isOpen} onClose={onClose} />
      </div>
    </div>
  );
};

export default FaqModal;