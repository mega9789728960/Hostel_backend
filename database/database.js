import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
"https://fcwajthkxusymctcsmhx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjd2FqdGhreHVzeW1jdGNzbWh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM4MzkyNywiZXhwIjoyMDcxOTU5OTI3fQ.FU_KHE5nLx8xOPoA8b-qxKDb-bNSEs6dhFz2g0gJ-nM"
);

export default supabase;