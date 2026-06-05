export const sendSuccess = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    traceId: res.locals.traceId,
    success: true,
    data,
  });
};

export const sendError = (res, code, message, statusCode = 400) => {
  return res.status(statusCode).json({
    traceId: res.locals.traceId,
    success: false,
    error: { code, message },
  });
};
