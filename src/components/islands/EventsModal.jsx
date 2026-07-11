import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function EventsModal({ events }) {
  const [activeEvent, setActiveEvent] = useState(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveEvent(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (activeEvent) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [activeEvent]);

  return (
    <>
      <div className="bento stagger">
        {events.map((e, idx) => (
          <article 
            key={idx} 
            className="bento__card" 
            onClick={() => setActiveEvent(e)}
            style={{ cursor: 'pointer' }}
          >
            <div className="bento__media">
              <img src={e.image} alt={e.alt} loading="lazy" />
              <div className="phase-card__overlay">
                <span className="phase-card__view">View Details</span>
              </div>
            </div>
            <div className="bento__body">
              <span className="label label--gold">{e.label}</span>
              <h3 className="bento__title" dangerouslySetInnerHTML={{ __html: e.title }}></h3>
              <p className="bento__desc">{e.body[0]}</p>
            </div>
          </article>
        ))}
      </div>

      {activeEvent && (
        <div className="modal-backdrop" onClick={() => setActiveEvent(null)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close" 
              onClick={() => setActiveEvent(null)}
              aria-label="Close"
            >
              <X size={24} />
            </button>
            
            <div className="modal-header">
              <span className="label label--gold">{activeEvent.label}</span>
              <h2 className="display" dangerouslySetInnerHTML={{ __html: activeEvent.title }}></h2>
            </div>
            
            <div className="modal-media">
              <img src={activeEvent.image} alt={activeEvent.alt} />
            </div>
            
            <div className="modal-body">
              {activeEvent.body.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
