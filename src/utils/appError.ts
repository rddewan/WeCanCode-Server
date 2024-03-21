class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  /**
   * Constructor for creating a new Error instance.
   *
   * @param {string} message - the error message
   * @param {number} statusCode - the status code of the error
   */
  constructor(message: string, statusCode: number)  {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error .captureStackTrace(this, this.constructor);
  }
}

export default AppError;
