import supabase from "../database/database.js";

async function register_controller(req, res) {
  try {
    const data = req.body;

    // Required fields
    const requiredFields = ["email", "password", "registration_number", "roll_number", "name"];

    // Check for missing or empty fields
    const missingFields = requiredFields.filter(field => !data[field] || data[field].toString().trim() === "");
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing or empty required field(s): ${missingFields.join(", ")}`
      });
    }

    console.log("email:", data.email, "password:", data.password);

    // Sign up user in Supabase Auth
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (signupError) {
      return res.status(400).json({ success: false, error: signupError.message });
    }

    // Assign Supabase Auth user ID to student row
    data["user_id"] = signupData.user?.id;

    // Add current timestamp
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

      // Handle PostgreSQL errors
      switch (insertError.code) {
        case "23505":
          return res.status(409).json({ success: false, error: "Student already exists" });
        case "23502":
          return res.status(400).json({ success: false, error: `Missing required field: ${insertError.details}` });
        case "23503":
          return res.status(400).json({ success: false, error: `Invalid foreign key value: ${insertError.details}` });
        case "23514":
          return res.status(400).json({ success: false, error: `Check constraint failed: ${insertError.details}` });
        case "23P01":
          return res.status(400).json({ success: false, error: "Conflicting entry due to exclusion constraint" });
        case "22001":
          return res.status(400).json({ success: false, error: "Value too long for column" });
        case "22P02":
          return res.status(400).json({ success: false, error: "Invalid input syntax for column" });
        case "40P01":
          return res.status(500).json({ success: false, error: "Deadlock detected, try again" });
        default:
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
