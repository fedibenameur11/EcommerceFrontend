import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import authService from '@/services/api/authService';

vi.mock('@/services/api/authService', () => ({
  default: {
    forgotPassword: vi.fn(),
    verifyResetCode: vi.fn(),
    resetPassword: vi.fn(),
  },
}));

const mocked = vi.mocked(authService);

function LoginStub() {
  const location = useLocation();
  return <p>Page de connexion : {(location.state as { message?: string } | null)?.message}</p>;
}

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/forgot-password']}>
      <Routes>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/login" element={<LoginStub />} />
      </Routes>
    </MemoryRouter>
  );

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends a code, verifies it, then resets the password and goes back to login', async () => {
    const user = userEvent.setup();
    mocked.forgotPassword.mockResolvedValue(undefined);
    mocked.verifyResetCode.mockResolvedValue({ resetToken: 'token-123' });
    mocked.resetPassword.mockResolvedValue(undefined);
    renderPage();

    await user.type(screen.getByLabelText('Email'), 'jean@exemple.com');
    await user.click(screen.getByRole('button', { name: 'Envoyer le code' }));
    expect(mocked.forgotPassword).toHaveBeenCalledWith('jean@exemple.com');

    await user.type(await screen.findByLabelText('Code de vérification'), '123456');
    await user.click(screen.getByRole('button', { name: 'Vérifier le code' }));
    expect(mocked.verifyResetCode).toHaveBeenCalledWith({ email: 'jean@exemple.com', code: '123456' });

    await user.type(await screen.findByLabelText(/Nouveau mot de passe/), 'motdepasse1');
    await user.type(screen.getByLabelText('Confirmer le mot de passe'), 'motdepasse1');
    await user.click(screen.getByRole('button', { name: 'Réinitialiser le mot de passe' }));

    expect(mocked.resetPassword).toHaveBeenCalledWith({
      email: 'jean@exemple.com',
      resetToken: 'token-123',
      newPassword: 'motdepasse1',
    });
    expect(await screen.findByText(/Votre mot de passe a été réinitialisé/)).toBeInTheDocument();
  });

  it('shows the API error and stays on the code step when the code is wrong', async () => {
    const user = userEvent.setup();
    mocked.forgotPassword.mockResolvedValue(undefined);
    mocked.verifyResetCode.mockRejectedValue({
      response: { status: 400, data: { message: 'Code invalide ou expiré.' } },
    });
    renderPage();

    await user.type(screen.getByLabelText('Email'), 'jean@exemple.com');
    await user.click(screen.getByRole('button', { name: 'Envoyer le code' }));
    await user.type(await screen.findByLabelText('Code de vérification'), '000000');
    await user.click(screen.getByRole('button', { name: 'Vérifier le code' }));

    expect(await screen.findByText('Code invalide ou expiré.')).toBeInTheDocument();
    expect(screen.queryByLabelText(/Nouveau mot de passe/)).not.toBeInTheDocument();
  });

  it('refuses a confirmation that does not match without calling the API', async () => {
    const user = userEvent.setup();
    mocked.forgotPassword.mockResolvedValue(undefined);
    mocked.verifyResetCode.mockResolvedValue({ resetToken: 'token-123' });
    renderPage();

    await user.type(screen.getByLabelText('Email'), 'jean@exemple.com');
    await user.click(screen.getByRole('button', { name: 'Envoyer le code' }));
    await user.type(await screen.findByLabelText('Code de vérification'), '123456');
    await user.click(screen.getByRole('button', { name: 'Vérifier le code' }));

    await user.type(await screen.findByLabelText(/Nouveau mot de passe/), 'motdepasse1');
    await user.type(screen.getByLabelText('Confirmer le mot de passe'), 'autrechose1');
    await user.click(screen.getByRole('button', { name: 'Réinitialiser le mot de passe' }));

    await waitFor(() =>
      expect(screen.getByText('Les deux mots de passe ne correspondent pas.')).toBeInTheDocument()
    );
    expect(mocked.resetPassword).not.toHaveBeenCalled();
  });
});
