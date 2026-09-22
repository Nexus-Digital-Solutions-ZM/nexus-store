export class AppError extends Error {
  readonly statusCode: number;
  readonly error: string;

  constructor(statusCode: number, error: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}