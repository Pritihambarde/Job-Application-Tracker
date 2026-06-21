import { useState } from 'react';
import api from '../api/client';
import { useToast } from '../hooks/useToast';

export default function VerifyBanner() {
  const { showToast } = useToast();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    setSending(true);
    try {
      await api.post('/auth/resend-verification');
      setSent(true);
      showToast('Verification email sent — check your inbox.', 'success');
    } catch (err) {
      showToast(err.response?.data?.msg || 'Could not send email. Try again.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="verify-banner">
      <span>
        <strong>Verify your email</strong> to make sure you receive application reminders and account alerts.
      </span>
      <button className="verify-banner-btn" onClick={handleResend} disabled={sending || sent}>
        {sent ? 'Sent ✓' : sending ? 'Sending…' : 'Resend email'}
      </button>
    </div>
  );
}
