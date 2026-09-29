import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { api, ApiError } from '@/lib/api.js';
import EmailTestPage from '@/pages/admin/EmailTestPage.jsx';

vi.mock('@/lib/api.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    api: Object.fromEntries(Object.keys(actual.api).map((key) => [key, vi.fn()])),
  };
});

beforeEach(() => {
  vi.mocked(api.adminSendTestEmail).mockReset();
});

describe('EmailTestPage', () => {
  it('renders the "Send to" and "Message" fields and the submit button', () => {
    render(<EmailTestPage />);

    expect(screen.getByLabelText('Send to')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send test email' })).toBeInTheDocument();
  });

  it('sends the entered values and shows a status message on success', async () => {
    vi.mocked(api.adminSendTestEmail).mockResolvedValue({
      from: 'shop@test.local',
      to: 'x@example.com',
    });

    render(<EmailTestPage />);
    fireEvent.change(screen.getByLabelText('Send to'), { target: { value: 'x@example.com' } });
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Hello there' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send test email' }));

    await waitFor(() =>
      expect(api.adminSendTestEmail).toHaveBeenCalledWith({
        to: 'x@example.com',
        message: 'Hello there',
      })
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Sent from shop@test.local to x@example.com.'
    );
  });

  it('shows the ApiError message in an alert when sending fails', async () => {
    vi.mocked(api.adminSendTestEmail).mockRejectedValue(
      new ApiError('Email not sent: Invalid login', 502)
    );

    render(<EmailTestPage />);
    fireEvent.change(screen.getByLabelText('Send to'), { target: { value: 'x@example.com' } });
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Hello there' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send test email' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Email not sent: Invalid login')
    );
  });

  it('shows "Sending…" and disables the button while the request is pending', async () => {
    let resolveSend;
    vi.mocked(api.adminSendTestEmail).mockReturnValue(
      new Promise((resolve) => {
        resolveSend = resolve;
      })
    );

    render(<EmailTestPage />);
    fireEvent.change(screen.getByLabelText('Send to'), { target: { value: 'x@example.com' } });
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Hello there' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send test email' }));

    const button = await screen.findByRole('button', { name: 'Sending…' });
    expect(button).toBeDisabled();

    resolveSend({ from: 'shop@test.local', to: 'x@example.com' });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Send test email' })).not.toBeDisabled()
    );
  });
});
