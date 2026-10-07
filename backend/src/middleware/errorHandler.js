const { errorResponse } = require('../utils/apiResponse');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.error('Error stack:', err);
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = err.expose || process.env.NODE_ENV === 'development'
    ? err.message || 'Internal Server Error'
    : 'Internal Server Error';

  const errorCode = err.name ? err.name.toUpperCase().replace(/\s+/g, '_') : 'INTERNAL_SERVER_ERROR';

  return errorResponse(res, message, statusCode, errorCode);
};

module.exports = errorHandler;
