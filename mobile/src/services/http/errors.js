export class ApiError extends Error {
  constructor(message, { status = 0, code = 'network_error', body = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.body = body;
  }
}
