import supabase from "../database/database.js";

async function register_controller(req, res) {
  try {
    const data = req.body;

    // Basic validation
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

    // Add current timestamp for created_at and updated_at
    const now = new Date().toISOString();
    data["created_at"] = now;
    data["updated_at"] = now;

    // Insert into students table
    const { data: newUser, error: insertError } = await supabase
      .from("students")
      .insert([data])
      .select();

    if (insertError) {
      // Rollback Auth user
      await supabase.auth.admin.deleteUser(signupData.user.id).catch(() => {});

      // Handle different PostgreSQL errors
      switch (insertError.code) {
        case "23505": // Unique violation
          return res.status(409).json({ success: false, error: "Student already exists" });

        case "23502": // Not null violation
          return res.status(400).json({ success: false, error: `Missing required field: ${insertError.details}` });

        case "23503": // Foreign key violation
          return res.status(400).json({ success: false, error: `Invalid foreign key value: ${insertError.details}` });

        case "23514": // Check constraint violation
          return res.status(400).json({ success: false, error: `Check constraint failed: ${insertError.details}` });

        case "23P01": // Exclusion constraint violation
          return res.status(400).json({ success: false, error: "Conflicting entry due to exclusion constraint" });

        case "22001": // String too long
          return res.status(400).json({ success: false, error: "Value too long for column" });

        case "22P02": // Invalid input syntax
          return res.status(400).json({ success: false, error: "Invalid input syntax for column" });

        case "40P01": // Deadlock
          return res.status(500).json({ success: false, error: "Deadlock detected, try again" });

        default: // Other errors
          return res.status(500).json({ success: false, error: insertError.message || "Database error" });
      }
    }

    return res.json({ success: true, user: newUser });
  } catch (err) {
    console.error("Unexpected error in register:", err);

    // Rollback Auth user if unexpected error occurs
    if (err?.user_id) {
      await supabase.auth.admin.deleteUser(err.user_id).catch(() => {});
    }

    return res.status(500).json({ success: false, error: "Unexpected server error" });
  }
}

export default register_controller;
