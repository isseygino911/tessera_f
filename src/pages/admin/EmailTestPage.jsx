import { useState } from 'react';
import { api, ApiError } from '@/lib/api.js';

// Sends one plain-text email through the server's SMTP mailbox, to check the
// mail setup works. The server always sends from its own address.
export default function EmailTestPage() {
  const [to, setTo] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setSent(null);
    setError(null);
    try {
      setSent(await api.adminSendTestEmail({ to, message }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="admin-head">
        <p className="eyebrow">Settings</p>
        <h1>Email test</h1>
      </div>

      {error && (
        <p className="form-banner" role="alert">
          {error}
        </p>
      )}

      <div className="admin-modules">
        <form className="admin-modules__main admin-module" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="email-to">Send to</label>
            <input
              id="email-to"
              type="email"
              required
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="email-message">Message</label>
            <textarea
              id="email-message"
              rows={8}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div>
            <button type="submit" className="btn-gold" disabled={sending}>
              {sending ? 'Sending…' : 'Send test email'}
            </button>
          </div>
          {sent && (
            <p role="status" className="form-hint">
              Sent from {sent.from} to {sent.to}.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
