import supabase from "../database/database.js";

async function register_controller(req, res) {
  try {
    const data = req.body;

    if (!data.email || !data.password) {
      return res.status(400).json({ success: false, error: "Email and password required" });
    }

    console.log("email:", data.email, "password:", data.password);

    // Sign up user in Supabase Auth
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password, // plain password, Supabase will hash it
    });

    if (signupError) {
      return res.status(400).json({ success: false, error: signupError.message });
    }

    // Assign Supabase Auth user ID to student row
    data["user_id"] = signupData.user?.id;

    // Insert into students table
    const { data: newUser, error: insertError } = await supabase
      .from("students")
      .insert([data])
      .select(); // return inserted row

    if (insertError) {
      // ⚠ Rollback Auth user if insert fails
      await supabase.auth.admin.deleteUser(signupData.user.id).catch(() => {});
      return res.status(400).json({ success: false, error: insertError.message });
    }

    return res.json({ success: true, user: newUser });
  } catch (err) {
    console.error("Unexpected error in register:", err);
    return res.status(500).json({ success: false, error: "Unexpected server error" });
  }
}

export default register_controller;
