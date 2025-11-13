import { supabase, currentUser } from '../supabase.js';
export async function renderChallenges(root){
  root.innerHTML = `<section class="card"><h2>🎯 Challenges</h2><div id="challengeList" class="row cols-2"></div></section>`;
  const { data } = await supabase.from('challenges').select('*').order('start', { ascending: false }).limit(20);
  const list = document.getElementById('challengeList');
  (data||[]).forEach(c=>{
    list.insertAdjacentHTML('beforeend',`<article class="card"><h3>${c.title}</h3><p>${c.description||''}</p><p class="badge">${new Date(c.start).toLocaleDateString()} → ${new Date(c.end).toLocaleDateString()}</p><button class="btn" data-id="${c.id}">Join</button> <button class="btn secondary" data-complete="${c.id}">Mark Complete</button></article>`);
  });
  list.addEventListener('click', async (e)=>{
    if (e.target.matches('button[data-id]')){
      const user = await currentUser(); if(!user) return alert('Sign in to join');
      const id = e.target.getAttribute('data-id');
      await supabase.from('participants').insert({ challenge_id: id, uid: user.id, progress:0 });
      e.target.textContent='Joined ✅'; e.target.disabled=true;
    }
    if (e.target.matches('button[data-complete]')){
      const user = await currentUser(); if(!user) return alert('Sign in first');
      const id = e.target.getAttribute('data-complete');
      const { error } = await supabase.rpc('complete_challenge', { p_uid: user.id, p_challenge: id, p_points: 50 });
      if (error) return alert(error.message);
      alert('Marked complete and points awarded');
    }
  });
}
