import { supabase, currentUser } from '../supabase.js';

export function renderTracker(root){
  root.innerHTML = `
    <section class="card">
      <h2>♻️ Log Plastic Use</h2>
      <form id="logForm" class="row cols-3" autocomplete="off">
        <div><label>Bottles (count)<input name="bottles" type="number" min="0" class="input" required value="0"/></label></div>
        <div><label>Bags (count)<input name="bags" type="number" min="0" class="input" required value="0"/></label></div>
        <div><label>Cutlery (count)<input name="cutlery" type="number" min="0" class="input" required value="0"/></label></div>
        <div><label>Date<input name="date" type="date" class="input" required/></label></div>
        <div><label>Notes<input name="notes" type="text" maxlength="100" class="input" placeholder="optional"/></label></div>
        <div style="align-self:end"><button class="btn" type="submit">Save Log</button></div>
      </form>

      <h3>Recent Logs</h3>
      <table class="table">
        <thead><tr><th>Date</th><th>Total Items</th><th>Notes</th></tr></thead>
        <tbody id="logRows"></tbody>
      </table>
    </section>
  `;

  const today = new Date().toISOString().slice(0,10);
  document.querySelector('input[name="date"]').value = today;

  document.getElementById('logForm').onsubmit = async (e)=>{
    e.preventDefault();

    const user = await currentUser();
    const fd = new FormData(e.target);

    const rec = {
      bottles: Math.max(0, parseInt(fd.get('bottles')||0)),
      bags: Math.max(0, parseInt(fd.get('bags')||0)),
      cutlery: Math.max(0, parseInt(fd.get('cutlery')||0)),
      notes: (fd.get('notes')||'').slice(0,100),
      date: new Date(fd.get('date')).toISOString()
    };

    // ✅ Calculate total items here (fix for your error)
    rec.total_items = rec.bottles + rec.bags + rec.cutlery;

    // ✅ Guest Mode
    if (!user && localStorage.getItem('guestMode')){
      const list = JSON.parse(localStorage.getItem('guestLogs')||'[]');
      list.unshift({ ...rec, uid: 'guest' });
      localStorage.setItem('guestLogs', JSON.stringify(list));
      loadRecent();
      return;
    }

    if (!user){
      alert("Please Sign In or Use Guest Mode.");
      return;
    }

    rec.uid = user.id;

    // ✅ Insert to Supabase
    const { error } = await supabase.from('logs').insert(rec);
    if (error){ alert('Error: '+error.message); return; }

    // ✅ Award points to user
    await supabase.rpc('add_points', { p_uid: user.id, p_points: 5 });

    // Reset form
    e.target.reset();
    document.querySelector('input[name="date"]').value = today;

    loadRecent();
  };

  async function loadRecent(){
    const user = await currentUser();
    const rows = document.getElementById('logRows');
    rows.innerHTML = '';

    // ✅ Guest Mode
    if (!user && localStorage.getItem('guestMode')){
      (JSON.parse(localStorage.getItem('guestLogs')||'[]').slice(0,10)).forEach(d=>{
        rows.insertAdjacentHTML('beforeend',
          `<tr><td>${new Date(d.date).toLocaleDateString()}</td><td>${d.total_items}</td><td>${d.notes||''}</td></tr>`
        );
      });
      return;
    }

    if (!user) return;

    // ✅ Logged-in users
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('uid', user.id)
      .order('date', { ascending: false })
      .limit(10);

    if (error){ rows.innerHTML = "<tr><td colspan='3'>Error loading logs</td></tr>"; return; }

    (data||[]).forEach(d=>{
      rows.insertAdjacentHTML('beforeend',
        `<tr><td>${new Date(d.date).toLocaleDateString()}</td><td>${d.total_items}</td><td>${d.notes||''}</td></tr>`
      );
    });
  }

  loadRecent();
}