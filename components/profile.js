import { supabase, currentUser } from '../supabase.js';
export async function renderProfile(root){
  const user = await currentUser(); if(!user){ root.innerHTML='<div class="card">Sign in to view your profile.</div>'; return; }
  const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
  const u = data||{};
  root.innerHTML=`
    <section class="card">
      <h2>👤 Profile</h2>
      <form id="profileForm" class="row cols-2">
        <label>Name<input name="name" class="input" value="${u.name||''}" /></label>
        <label>Email<input name="email" class="input" value="${user.email||''}" disabled /></label>
        <label>City<input name="city" class="input" value="${u.city||''}" /></label>
        <label>Country<input name="country" class="input" value="${u.country||''}" /></label>
        <div style="align-self:end"><button class="btn" type="submit">Save</button></div>
      </form>
      <h3>Insights</h3>
      <ul>
        <li>Eco points: <strong>${u.eco_points||0}</strong></li>
        <li>Badges: ${(u.badges||[]).map(b=>`<span class='badge'>${b}</span>`).join(' ')||'—'}</li>
      </ul>
    </section>`;
  document.getElementById('profileForm').onsubmit = async (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    await supabase.from('users').update({
      name: (fd.get('name')||'').trim(),
      city: (fd.get('city')||'').trim(),
      country: (fd.get('country')||'').trim(),
      updated_at: new Date().toISOString()
    }).eq('id', user.id);
    alert('Profile saved');
  };
}
