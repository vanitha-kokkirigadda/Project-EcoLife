import { supabase } from '../supabase.js';
export async function renderLeaderboard(root){
  root.innerHTML = `<section class="card"><h2>🥇 Leaderboard</h2><table class="table"><thead><tr><th>Rank</th><th>Name</th><th>Eco Points</th></tr></thead><tbody id="lbRows"></tbody></table></section>`;
  const { data } = await supabase.from('leaderboard_full').select('*'); // includes zero-point users
  const rows = document.getElementById('lbRows'); let rank=1;
  (data||[]).forEach(d=> rows.insertAdjacentHTML('beforeend',`<tr><td>${rank++}</td><td>${d.name}</td><td>${d.points}</td></tr>`));
}
