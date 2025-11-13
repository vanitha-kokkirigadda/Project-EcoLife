import { supabase, currentUser } from '../supabase.js';

export function renderAuthControls(){
  const authState = document.getElementById('authState');

  supabase.auth.onAuthStateChange(paint);
  paint();

  async function paint(){
    const user = await currentUser();

    if (user) {
      authState.innerHTML = `
        <div class="badge">Signed in as <strong>${user.user_metadata?.name || user.email}</strong></div>
        <button id="signOutBtn" class="btn secondary">Sign out</button>
      `;

      // ✅ Attach click AFTER rendering
      setTimeout(()=>{
        document.getElementById('signOutBtn').addEventListener('click', async ()=>{
          console.log("Sign out clicked ✅");
          await supabase.auth.signOut();
          localStorage.removeItem('guestMode');
          location.reload();
        });
      }, 50);

      await supabase.from('users').upsert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || null
      });

    } else {
      authState.innerHTML = `
        <button id="googleBtn" class="btn">Sign in with Google</button>
        <button id="guestBtn" class="btn secondary">Continue as Guest</button>
      `;

      // ✅ Attach buttons AFTER rendering
      setTimeout(()=>{
        document.getElementById('googleBtn').onclick = ()=> supabase.auth.signInWithOAuth({ provider: 'google' });
        document.getElementById('guestBtn').onclick = ()=>{
          localStorage.setItem('guestMode','1');
          alert('Guest mode enabled. Data is local until sign in.');
          location.reload();
        };
      }, 50);
    }
  }
}