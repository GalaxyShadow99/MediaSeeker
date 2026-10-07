/**
 * Standardized Success Response Helper
 */
const successResponse = (res, data, message = 'Success', statusCode = 200, pagination = null) => {
  const payload = {
    success: true,
    message,
    data,
  };

  if (pagination) {
    payload.pagination = pagination;
  }

  return res.status(statusCode).json(payload);
};

/**
 * Standardized Error Response Helper
 */
const errorResponse = (res, message = 'An error occurred', statusCode = 500, errorCode = 'SERVER_ERROR') =>
  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
    },
  });

module.exports = {
  successResponse,
  errorResponse,
};
