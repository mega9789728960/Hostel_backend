import supabase from "../database/database.js";

async function login_controller(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return res.status(401).json({ success: false, error: error.message });
    }

    // Returns session info including access_token
    return res.json({
      success: true,
      message: "Login successful",
      session: data.session,
      user: data.user,
    });

  } catch (err) {
    console.error("Unexpected error in login:", err);
    return res.status(500).json({ success: false, error: "Unexpected server error" });
  }
}

export default login_controller;
