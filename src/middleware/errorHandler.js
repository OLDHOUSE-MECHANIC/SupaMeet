import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  const traceId = res.locals.traceId;
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'Something went wrong';

  logger.error({
    traceId,
    code,
    message,
    stack: err.stack,
  });

  return res.status(statusCode).json({
    traceId,
    success: false,
    error: { code, message },
  });
};

export default errorHandler;
