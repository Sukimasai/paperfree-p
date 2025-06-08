export default function validateApiCaller(req, res, next) {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";
  const allowedHosts = [
    "localhost:4000",
    backendUrl,
    "paperfree-be-606018308357.asia-southeast2.run.app",
  ];

  const hostHeader = req.headers["host"];
  const forwardedHost = req.headers["x-forwarded-host"];
  const forwardedServer = req.headers["x-forwarded-server"];

  const isAllowed =
    allowedHosts.some(
      (allowed) =>
        hostHeader === allowed ||
        forwardedHost === allowed ||
        forwardedServer === allowed ||
        hostHeader?.includes(allowed) ||
        forwardedHost?.includes(allowed)
    ) || process.env.NODE_ENV === "production";

  if (!isAllowed) {
    return res.status(403).json({ message: "Forbidden: Invalid API caller" });
  }

  next();
}
