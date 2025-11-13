import { supabase, currentUser } from '../supabase.js';

export async function renderAdmin(root){
  const me = await currentUser();
  if (!me){ root.innerHTML = `<section class="card">⚠️ Sign in required.</section>`; return; }
  const { data: meRow } = await supabase.from('users').select('is_admin,name,email').eq('id', me.id).single();
  if (!meRow?.is_admin){ root.innerHTML = `<section class="card">⛔ Admins only.</section>`; return; }

  root.innerHTML = `
    <section class="card">
      <h2>🛡️ Admin Portal</h2>
      <p>Signed in as <strong>${meRow.name||me.email}</strong></p>

      <div class="row cols-2">
        <div class="card">
          <h3>Users & Leaderboard</h3>
          <table class="table" id="usersTbl">
            <thead><tr><th>Name</th><th>Email</th><th>Points</th><th>Admin</th><th>Actions</th></tr></thead>
            <tbody></tbody>
          </table>
        </div>

        <div class="card">
          <h3>Challenges</h3>
          <form id="chForm" class="row cols-3" autocomplete="off">
            <input name="title" class="input" placeholder="Title" required />
            <input name="points" type="number" class="input" placeholder="Points (e.g. 50)" required />
            <input name="start" type="date" class="input" required />
            <input name="end" type="date" class="input" required />
            <textarea name="description" class="input" placeholder="Description"></textarea>
            <button class="btn" type="submit">Add Challenge</button>
          </form>
          <table class="table" id="chTbl">
            <thead><tr><th>Title</th><th>Start</th><th>End</th><th>Pts</th><th>Actions</th></tr></thead>
            <tbody></tbody>
          </table>
        </div>

        <div class="card">
          <h3>Pledge Options</h3>
          <form id="poForm" class="row cols-3" autocomplete="off">
            <input name="label" class="input" placeholder="New pledge label" required />
            <button class="btn" type="submit">Add Pledge Option</button>
          </form>
          <ul id="poList"></ul>
        </div>

        <div class="card">
          <h3>Tips (User submissions require approval)</h3>
          <form id="tipForm" class="row cols-3" autocomplete="off">
            <input name="title" class="input" placeholder="Title" required />
            <textarea name="body" class="input" placeholder="Tip content" required></textarea>
            <button class="btn" type="submit">Add Tip</button>
          </form>
          <table class="table" id="tipTbl">
            <thead><tr><th>Title</th><th>Author</th><th>Approved</th><th>Actions</th></tr></thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </section>
  `;

  // Users
  const uBody = root.querySelector("#usersTbl tbody");
  const { data: users } = await supabase.from('users').select('id,name,email,eco_points,is_admin').order('created_at',{ascending:false});
  (users||[]).forEach(u=>{
    uBody.insertAdjacentHTML('beforeend',`
      <tr>
        <td>${u.name||'—'}</td>
        <td>${u.email||'—'}</td>
        <td>${u.eco_points||0}</td>
        <td>${u.is_admin?'✅':'—'}</td>
        <td>
          <button class="btn secondary" data-act="reset" data-id="${u.id}">Reset Points</button>
          <button class="btn secondary" data-act="purge" data-id="${u.id}">Delete Data</button>
          <button class="btn" data-act="toggle-admin" data-id="${u.id}">${u.is_admin?'Revoke Admin':'Make Admin'}</button>
        </td>
      </tr>`);
  });
  uBody.addEventListener('click', async (e)=>{
    if (!e.target.matches('button[data-act]')) return;
    const act = e.target.getAttribute('data-act'); const uid = e.target.getAttribute('data-id');
    if (act==='reset'){ await supabase.from('users').update({ eco_points:0, badges:[] }).eq('id', uid); alert('Points reset'); location.reload(); }
    if (act==='purge'){ await supabase.from('logs').delete().eq('uid', uid); await supabase.from('participants').delete().eq('uid', uid); alert('User data deleted'); location.reload(); }
    if (act==='toggle-admin'){ const { data:r } = await supabase.from('users').select('is_admin').eq('id', uid).single(); await supabase.from('users').update({ is_admin: !r.is_admin }).eq('id', uid); alert('Admin toggled'); location.reload(); }
  });

  // Challenges
  const chBody = root.querySelector("#chTbl tbody");
  const { data: challenges } = await supabase.from('challenges').select('id,title,start,end,points').order('start',{ascending:false});
  (challenges||[]).forEach(c=>{
    chBody.insertAdjacentHTML('beforeend',`
      <tr>
        <td>${c.title}</td><td>${new Date(c.start).toLocaleDateString()}</td><td>${new Date(c.end).toLocaleDateString()}</td><td>${c.points||50}</td>
        <td><button class="btn secondary" data-del="${c.id}">Delete</button></td>
      </tr>`);
  });
  root.querySelector('#chForm').onsubmit = async (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    await supabase.from('challenges').insert({
      title: fd.get('title'),
      description: fd.get('description')||null,
      start: new Date(fd.get('start')).toISOString(),
      end: new Date(fd.get('end')).toISOString(),
      points: parseInt(fd.get('points')||'50',10)
    });
    alert('Challenge added'); location.reload();
  };
  chBody.addEventListener('click', async (e)=>{
    if (!e.target.matches('button[data-del]')) return;
    const id = e.target.getAttribute('data-del');
    await supabase.from('challenges').delete().eq('id', id);
    alert('Challenge deleted'); location.reload();
  });

  // Pledge Options
  const poList = root.querySelector('#poList');
  const { data: pledges } = await supabase.from('pledge_options').select('*').order('id');
  (pledges||[]).forEach(p=>{
    poList.insertAdjacentHTML('beforeend', `<li>${p.label} ${p.active?'':'(inactive)'} <button class="btn secondary" data-po="${p.id}">${p.active?'Deactivate':'Activate'}</button></li>`);
  });
  root.querySelector('#poForm').onsubmit = async (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    await supabase.from('pledge_options').insert({ label: (fd.get('label')||'').trim(), active: true });
    alert('Pledge option added'); location.reload();
  };
  poList.addEventListener('click', async (e)=>{
    if (!e.target.matches('button[data-po]')) return;
    const id = e.target.getAttribute('data-po');
    const { data: r } = await supabase.from('pledge_options').select('active').eq('id', id).single();
    await supabase.from('pledge_options').update({ active: !r.active }).eq('id', id);
    alert('Pledge toggled'); location.reload();
  });

  // Tips
  const tipBody = root.querySelector('#tipTbl tbody');
  const { data: tips } = await supabase.from('tips').select('id,title,approved,submitted_by').order('id',{ascending:false});
  (tips||[]).forEach(t=>{
    tipBody.insertAdjacentHTML('beforeend',`
      <tr>
        <td>${t.title}</td><td>${t.submitted_by||'admin'}</td><td>${t.approved?'✅':'—'}</td>
        <td>
          <button class="btn" data-approve="${t.id}">${t.approved?'Unapprove':'Approve'}</button>
          <button class="btn secondary" data-delete="${t.id}">Delete</button>
        </td>
      </tr>`);
  });
  root.querySelector('#tipForm').onsubmit = async (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    await supabase.from('tips').insert({ title: fd.get('title'), body: fd.get('body'), approved: true });
    alert('Tip added'); location.reload();
  };
  tipBody.addEventListener('click', async (e)=>{
    if (e.target.matches('button[data-approve]')){
      const id = e.target.getAttribute('data-approve');
      const { data:r } = await supabase.from('tips').select('approved').eq('id', id).single();
      await supabase.from('tips').update({ approved: !r.approved }).eq('id', id);
      alert('Approval toggled'); location.reload();
    }
    if (e.target.matches('button[data-delete]')){
      const id = e.target.getAttribute('data-delete');
      await supabase.from('tips').delete().eq('id', id);
      alert('Tip deleted'); location.reload();
    }
  });
}
