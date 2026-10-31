// Profile middleware – loads the user profile after Supabase token verification
import prisma from "../config/database.js";

export const loadProfile = async (req, res, next) => {
  // The authenticate middleware must have set req.supabaseUserId
  if (!req.supabaseUserId) {
    return res.status(401).json({ message: "Missing Supabase user ID" });
  }
  try {
    const profile = await prisma.profile.findUnique({ where: { id: req.supabaseUserId } });
    if (!profile) {
      return res.status(404).json({ message: "User profile not found" });
    }
    req.profile = profile; // attach for role/authorization middleware
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while loading profile" });
  }
};
