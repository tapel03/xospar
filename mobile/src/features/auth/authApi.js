import { http } from '../../services/http/client';
import { userApi } from '../../services/userApi';
import { featureFlags } from '../../app/config';

// Length of the one-time code. The UI kit shows 4 digits; 6 is safer. Change it here to change every screen.
export const OTP_LENGTH = 6;
export const TERMS_VERSION = '2026-10-27';

// With EXPO_PUBLIC_USE_BACKEND=false the screens run on sample behaviour: any login works and the code is 123456.
const demo = !featureFlags.useBackend;
const SAMPLE_CODE = '123456';
const wait = (ms = 450) => new Promise((r) => setTimeout(r, ms));

/**
 * Everything the auth screens ask of OUR backend. The server does the real checks:
 * it must hash passwords, expire codes, limit attempts, and answer /forgot the same way
 * whether or not the email exists.
 */
export const authApi = {
  /** -> { token } or, when two-step sign-in is on, { mfaRequired: true, challenge } */
  async login(email, password) {
    if (demo) { await wait(); return { mfaRequired: true, challenge: 'demo' }; }
    return userApi.login(email, password);
  },

  /** Upgrades the current device session to an account. -> { token? } */
  async register(payload) {
    if (demo) { await wait(); return { ok: true }; }
    return http.post('/v1/auth/register', payload);
  },

  async forgot(email) {
    if (demo) { await wait(); return { ok: true }; }
    return http.post('/v1/auth/forgot', { email }, { auth: false });
  },

  /** purpose: 'signup' | 'mfa' | 'reset'. -> { token } for signup and mfa, { resetToken } for reset */
  async verifyOtp({ target, code, purpose, challenge }) {
    if (demo) {
      await wait();
      if (code !== SAMPLE_CODE) throw new Error(`Wrong code. In sample mode use ${SAMPLE_CODE}.`);
      return { token: 'sample-token', resetToken: 'sample-reset' };
    }
    return http.post('/v1/auth/otp/verify', { target, code, purpose, challenge });
  },

  async resendOtp({ target, purpose, challenge }) {
    if (demo) { await wait(300); return { ok: true }; }
    return http.post('/v1/auth/otp/resend', { target, purpose, challenge }, { auth: false });
  },

  async resetPassword(resetToken, password) {
    if (demo) { await wait(); return { ok: true }; }
    return http.post('/v1/auth/reset', { resetToken, password }, { auth: false });
  },
};