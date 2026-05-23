'use client';

import React from 'react';

interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SimpleModal({ isOpen, onClose }: SimpleModalProps) {
  console.log('SimpleModal rendered with isOpen:', isOpen);
  
  if (!isOpen) return null;

  console.log('SimpleModal rendering modal content');

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#1e293b',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #475569',
          maxWidth: '400px',
          width: '90%'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ color: '#f8fafc', marginBottom: '10px' }}>Aura Help</h3>
        <p style={{ color: '#cbd5e1', marginBottom: '15px' }}>
          This is a simple test modal to verify rendering works.
        </p>
        <button 
          onClick={onClose}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
