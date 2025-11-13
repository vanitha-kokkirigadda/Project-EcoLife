import { supabase } from '../supabase.js';
export async function renderTips(root){
  root.innerHTML = `<section class="card"><h2>💡 Eco Tips</h2><div id="tipsList" class="row"></div></section>`;
  const { data } = await supabase.from('tips').select('*').order('priority', { ascending: false }).limit(50);
  const list = document.getElementById('tipsList');
  (data||[]).forEach(t=>{
    list.insertAdjacentHTML('beforeend',`<article class="card"><h3>${t.title}</h3><p>${t.body}</p></article>`);
  });
}
