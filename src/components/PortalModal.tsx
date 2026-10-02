'use client';

import React from 'react';
import { createPortal } from 'react-dom';

interface PortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PortalModal({ isOpen, onClose }: PortalModalProps) {
  console.log('PortalModal rendered with isOpen:', isOpen);
  
  if (!isOpen) return null;

  console.log('PortalModal rendering modal content with portal');

  const modalContent = (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#0f172a',
          padding: '30px',
          borderRadius: '16px',
          border: '2px solid #3b82f6',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ 
          color: '#f8fafc', 
          marginBottom: '15px',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          ✨ Aura System Help
        </h3>
        <p style={{ 
          color: '#cbd5e1', 
          marginBottom: '20px',
          lineHeight: '1.5'
        }}>
          This modal is rendered using React Portal to bypass any page structure issues.
        </p>
        <div style={{ 
          backgroundColor: '#1e293b', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            <strong>Aura Levels:</strong><br/>
            • 0% - No Aura (Gray)<br/>
            • 50% - Rising Star (Orange)<br/>
            • 100% - Active User (Orange)<br/>
            • 1000% - Influencer (Green)<br/>
            • 10500% - Expert (Red)<br/>
            • 999999% - Legendary (Dark Red)
          </p>
        </div>
        <button 
          onClick={onClose}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            width: '100%'
          }}
        >
          Close Help
        </button>
      </div>
    </div>
  );

  // Use createPortal to render outside the page structure
  return createPortal(modalContent, document.body);
}
