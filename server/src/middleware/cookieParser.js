export default function cookieParserMiddleware(req, res, next) {
  const cookieHeader = req.headers.cookie;
  req.cookies = {};

  if (cookieHeader) {
    cookieHeader.split(";").forEach((cookie) => {
      const [name, ...rest] = cookie.split("=");
      const trimmedName = name.trim();
      const value = rest.join("=").trim();
      if (trimmedName && value) {
        req.cookies[trimmedName] = decodeURIComponent(value);
      }
    });
  }

  next();
}
