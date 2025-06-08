export const kelurahanAdminAuth = (req, res, next) => {
  const userRole = req.user.role;
  const kelurahanId = req.user.kelurahan_id;

  if (userRole !== "kelurahan_admin") {
    return res
      .status(403)
      .json({
        message: "Only Kelurahan admins can approve/reject Kelurahan requests",
      });
  }

  next();
};
