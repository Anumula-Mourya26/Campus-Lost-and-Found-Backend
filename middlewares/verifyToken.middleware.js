import jwt from "jsonwebtoken";
import { UserModel } from "../models/User.model.js";

export async function verifyToken(req, res, next) {
  const accessToken = req.cookies?.accessToken;
  if (!accessToken) return res.status(401).json({ success: false, message: "Please login to continue" });
  try {
    const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
    // Load current role/desk assignments so revoked staff permissions take effect immediately.
    const user = await UserModel.findById(decodedToken.id).select("role isVerified assignedDeskIds");
    if (!user) return res.status(401).json({ success: false, message: "Account not found. Please login again" });
    req.user = { id: user._id.toString(), role: user.role, isVerified: user.isVerified, assignedDeskIds: user.assignedDeskIds.map((id) => id.toString()) };
    next();
  } catch (err) {
    if (err.statusCode) return next(err);
    return res.status(401).json({ success: false, message: "Session expired. Please login again" });
  }
}
