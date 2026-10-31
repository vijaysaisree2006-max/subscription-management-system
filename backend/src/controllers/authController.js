// Authentication controller – Supabase only

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();



// Register a new user via Supabase Auth and create matching profile
export const register = async (req, res) => {
  try {
    const { email, password, role = "CUSTOMER", full_name, department, company_name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    // Only ADMIN can assign ADMIN or STAFF roles
    if (role !== "CUSTOMER") {
      if (!req.supabaseUserId) {
        return res.status(403).json({ message: "Only admins can create staff or admin accounts" });
      }
      const callerProfile = await prisma.profile.findUnique({ where: { id: req.supabaseUserId } });
      if (!callerProfile || callerProfile.role !== "ADMIN") {
        return res.status(403).json({ message: "Only admins can create staff or admin accounts" });
      }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name, department, company_name, role } },
    });
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    const user = data.user;
    // Create profile row using service‑role Prisma client
    await prisma.profile.create({
      data: {
        id: user.id,
        email: user.email,
        full_name: full_name || "",
        role,
        department,
        company_name,
      },
    });
    // If email confirmation required, no session token yet
    if (!data.session) {
      return res.status(202).json({ message: "Signup successful, please verify your email before logging in." });
    }
    const token = data.session.access_token;
    res.status(201).json({ token, user: { id: user.id, email: user.email, role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login using Supabase Auth – returns access token if credentials are correct
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return res.status(401).json({ message: error.message });
    }
    if (!data.session) {
      // Should not happen, but handle gracefully
      return res.status(202).json({ message: "Login succeeded, but no active session. Check email verification." });
    }
    const token = data.session.access_token;
    const user = data.user;
    // Ensure role is taken from profiles table
    const profile = await prisma.profile.findUnique({ where: { id: user.id } });
    const role = profile?.role || "CUSTOMER";
    res.json({ token, user: { id: user.id, email: user.email, role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
