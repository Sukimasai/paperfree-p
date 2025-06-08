export const adminAuth = (req, res, next) => {
  const userRole = req.user.role;

  if (userRole !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }

  next();
};
