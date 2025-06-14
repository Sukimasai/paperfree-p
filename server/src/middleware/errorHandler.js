export default function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Server Error" });
}
