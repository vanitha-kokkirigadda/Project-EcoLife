import { supabase, currentUser } from '../supabase.js';
import { renderChart } from '../charts.js';

export async function renderHome(root){
  root.innerHTML = `
    <section class="card">
      <h2>Welcome to EcoLife – Let’s reduce plastic together!</h2>
      <p>Track your single‑use plastics, learn simple swaps, and earn badges.</p>
      <div class="row cols-3">
        <div class="kpi"><span>Plastic‑free score</span><strong id="kpiScore">—%</strong></div>
        <div class="kpi"><span>Weekly reduction</span><strong id="kpiWeek">—%</strong></div>
        <div class="kpi"><span>Eco points</span><strong id="kpiPoints">0</strong></div>
      </div>
    </section>
    <section class="card">
      <h3>Your weekly footprint</h3>
      <div style="height:260px"><canvas id="footprintChart"></canvas></div>
    </section>
  `;

  const user = await currentUser();
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate()-7);

  let logs = [];
  if (!user && localStorage.getItem('guestMode')){
    logs = JSON.parse(localStorage.getItem('guestLogs')||'[]').filter(x=> new Date(x.date) >= weekAgo);
  } else if (user){
    const { data } = await supabase.from('logs').select('*').eq('uid', user.id).gte('date', weekAgo.toISOString()).order('date');
    logs = data||[];
  }

  let total=0; const days={};
  (logs).forEach(d=>{ const dt = new Date(d.date); const k = dt.toDateString(); const t = (d.total_items ?? (d.bottles+d.bags+d.cutlery)); total += t; days[k]=(days[k]||0)+t; });
  renderChart('footprintChart', Object.keys(days), Object.values(days));

  const score = Math.max(0, 100 - Math.min(100, total*2));
  document.getElementById('kpiScore').textContent = score+"%";

  if (user){
    const twoWeeks = new Date(); twoWeeks.setDate(twoWeeks.getDate()-14);
    const { data: prevLogs } = await supabase.from('logs').select('bottles,bags,cutlery,date').eq('uid', user.id).gte('date', twoWeeks.toISOString()).lt('date', weekAgo.toISOString());
    const prevTotal = (prevLogs||[]).reduce((s,d)=> s + d.bottles + d.bags + d.cutlery, 0);
    const improvement = prevTotal>0 ? Math.round(((prevTotal-total)/prevTotal)*100) : 0;
    document.getElementById('kpiWeek').textContent = (improvement>=0?'+':'')+improvement+"%";
    const { data: u } = await supabase.from('users').select('eco_points').eq('id', user.id).single();
    document.getElementById('kpiPoints').textContent = u?.eco_points || 0;
  }
}
