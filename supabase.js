export const supabase = window.supabase.createClient(
  'https://yhscxwyoewhbwsgsrrph.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inloc2N4d3lvZXdoYndzZ3NycnBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2Njk1OTIsImV4cCI6MjA3ODI0NTU5Mn0.3EIOvxLEn3EFRbHlXBzRZuSd5Xg7iBHC_5KRZM6BsZw',
  { auth: { persistSession: true, autoRefreshToken: true } }
);
export async function currentUser(){
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
