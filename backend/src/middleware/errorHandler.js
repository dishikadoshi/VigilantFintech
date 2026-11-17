function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const isDev  = process.env.NODE_ENV !== 'production';

  console.error(`[Error] ${status} — ${err.message}`);
  if (isDev) console.error(err.stack);

  const message = isDev
    ? err.message
    : status >= 500
      ? 'An unexpected error occurred. Please try again.'
      : err.message;

  res.status(status).json({
    success: false,
    message,
    ...(isDev && { stack: err.stack }),
  });
}

module.exports = errorHandler;
