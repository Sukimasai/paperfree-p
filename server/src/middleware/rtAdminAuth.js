export const rtAdminAuth = (req, res, next) => {
  const userRole = req.user.role;
  const rtId = req.user.rt_id;

  if (userRole !== "rt_admin") {
    return res
      .status(403)
      .json({ message: "Only RT admins can approve/reject RT requests" });
  }

  next();
};
