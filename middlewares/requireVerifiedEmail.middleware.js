export function requireVerifiedEmail(req, res, next) {
  if (!req.user?.isVerified) return res.status(403).json({ success: false, message: "Verify your campus email before using this feature" });
  next();
}
