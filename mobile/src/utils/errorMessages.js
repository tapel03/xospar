// All user-facing error text lives here. Edit the wording in this file only.
// friendlyError(err, context) turns any error into a short, plain message.
// context: 'login' | 'signup' | 'forgot' | 'otp' | 'resend' | 'reset' | 'save' | 'ai' | 'export' | 'upload' | 'permission' | undefined

export const ERRORS = {
  network: 'No internet connection. Check your connection and try again.',
  timeout: 'The server took too long to answer. Please try again.',
  server: 'Something went wrong on our side. Please try again in a few minutes.',
  tooMany: 'Too many attempts. Please wait a minute and try again.',
  unauthorized: 'Your session has expired. Please sign in again.',
  generic: 'Something went wrong. Please try again.',

  login: {
    401: 'Incorrect email or password.',
    404: 'We could not find an account with that email.',
    403: 'This account is not allowed to sign in. Contact support for help.',
    mfa: 'Enter the code we sent to your email to finish signing in.',
  },
  signup: {
    409: 'An account with this email already exists. Try signing in instead.',
    400: 'Check your details and try again.',
    422: 'Check your details and try again.',
  },
  forgot: {
    404: 'We could not send a code to that email.',
    400: 'Enter a valid email address.',
  },
  otp: {
    400: 'That code is not right. Check it and try again.',
    401: 'That code is not right. Check it and try again.',
    410: 'That code has expired. Tap Resend code to get a new one.',
    404: 'That code is not valid any more. Tap Resend code to get a new one.',
  },
  resend: {
    default: 'We could not send a new code. Please try again.',
  },
  reset: {
    400: 'That password is not accepted. Use at least 8 characters.',
    401: 'Your reset link has expired. Start again from Forgot password.',
    410: 'Your reset link has expired. Start again from Forgot password.',
  },
  save: { default: 'Your last change could not be saved. We will keep trying when you are back online.' },
  ai: { default: 'The mentor could not answer right now. Please try again.' },
  export: { default: 'The export could not be completed. Please try again.' },
  upload: { default: 'That file could not be added. Try a different file.' },
  permission: { default: 'Edgeline does not have permission. Turn it on in your phone settings and try again.' },

  validation: {
    email: 'Enter a valid email address.',
    password: 'Use at least 8 characters for your password.',
    passwordMatch: 'The passwords do not match.',
    code: 'Enter the 6-digit code from your email.',
    required: 'This field is required.',
  },
};

/** Short, plain message for any error. Never shows URLs or stack traces. */
export function friendlyError(err, context) {
  const code = err && err.code;
  const status = err && err.status;

  if (code === 'network_error') return ERRORS.network;
  if (code === 'timeout') return ERRORS.timeout;
  if (status === 429) return ERRORS.tooMany;

  const group = context && ERRORS[context];
  if (group && typeof group === 'object') {
    if (status && group[status]) return group[status];
    if (status && status >= 500) return ERRORS.server;
    if (group.default) return group.default;
  }

  if (status === 401) return ERRORS.unauthorized;
  if (status && status >= 500) return ERRORS.server;

  // A short message written by our own server for a 4xx is safe to show.
  const serverMsg = err && err.body && typeof err.body.message === 'string' ? err.body.message : '';
  if (status && status >= 400 && status < 500 && serverMsg && serverMsg.length <= 140) return serverMsg;

  return ERRORS.generic;
}