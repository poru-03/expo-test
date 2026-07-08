import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ContactModal() {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    const opener = (e) => {
      const t = e.target.closest && e.target.closest('[data-open-contact]');
      if (t) { e.preventDefault(); setOpen(true); }
    };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('click', opener);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('click', opener);
      document.removeEventListener('keydown', esc);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  const onSubmit = (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    const name = f.name.value.trim();
    const contact = f.contact.value.trim();
    const message = f.message.value.trim();
    if (!name || !contact || !message) {
      setNote('Please fill in your name, a contact, and a message.');
      return;
    }
    const subject = `Exposition — feature request from ${name}`;
    const body = `${message}\n\n— ${name}${f.designation.value ? ', ' + f.designation.value : ''}\n${contact}${f.web.value ? '\n' + f.web.value : ''}`;
    window.location.href = `mailto:exposition.uok@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setNote('Thank you for reaching out! Your mail client should open — we\'ll get back to you soon.');
  };

  return (
    <div className="modal" data-open={open} role="dialog" aria-modal="true" aria-label="Get in touch">
      <div className="modal__scrim" onClick={() => setOpen(false)} />
      <div className="modal__panel">
        <button className="modal__close" onClick={() => setOpen(false)} aria-label="Close" type="button"><X size={18} /></button>
        <span className="label label--gold" style={{ display: 'block', marginBottom: 12 }}>Get in Touch</span>
        <h2 className="display" style={{ fontSize: 'clamp(26px,3.4vw,40px)', marginBottom: 26 }}>
          We'd love to feature <em>you</em>
        </h2>
        <form className="form" onSubmit={onSubmit} noValidate>
          <div className="form__row">
            <div className="field">
              <label htmlFor="m-name">Your Name</label>
              <input id="m-name" name="name" type="text" placeholder="Enter your full name" required />
            </div>
            <div className="field">
              <label htmlFor="m-desg">Your Designation</label>
              <input id="m-desg" name="designation" type="text" placeholder="e.g., CEO, Engineer" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="m-web">LinkedIn / Website</label>
            <input id="m-web" name="web" type="text" placeholder="Profile or personal website URL" />
          </div>
          <div className="field">
            <label htmlFor="m-contact">Contact Info</label>
            <input id="m-contact" name="contact" type="text" placeholder="Email address or phone number" required />
          </div>
          <div className="field">
            <label htmlFor="m-message">Message</label>
            <textarea id="m-message" name="message" rows={4} placeholder="Tell us about yourself and what insights you'd like to share…" required></textarea>
          </div>
          <button className="btn btn--fill" type="submit">Send Message</button>
          {note && <p className="form__note">{note}</p>}
        </form>
      </div>
    </div>
  );
}
