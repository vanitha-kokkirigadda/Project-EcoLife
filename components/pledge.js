import { supabase, currentUser } from '../supabase.js';

export function renderPledge(root){
  root.innerHTML = `
    <section class="card">
      <h2>🙌 Take the Eco Pledge</h2>
      <p>Choose one or more actions you’ll commit to this month.</p>
      <form id="pledgeForm" class="row cols-2" autocomplete="off">
        <label><input type="checkbox" name="pledges" value="carry-bottle"> Carry a reusable water bottle</label>
        <label><input type="checkbox" name="pledges" value="cloth-bag"> Use cloth bags for shopping</label>
        <label><input type="checkbox" name="pledges" value="no-cutlery"> Say no to plastic cutlery</label>
        <label><input type="checkbox" name="pledges" value="refill-station"> Refill household cleaners</label>
        <button class="btn" type="submit">Save Pledge</button>
      </form>
      <div id="pledgeToast" class="toast hidden" role="status">Pledge saved ✅</div>
    </section>`;

  document.getElementById('pledgeForm').onsubmit = async (e)=>{
    e.preventDefault();
    const user = await currentUser(); if(!user){ alert('Sign in to save pledge'); return; }
    const values = [...new FormData(e.target).getAll('pledges')];
    const { error } = await supabase.from('users').update({ pledges: values, updated_at: new Date().toISOString() }).eq('id', user.id);
    if (error){ alert('Error: '+error.message); return; }
    const t = document.getElementById('pledgeToast'); t.classList.remove('hidden'); setTimeout(()=>t.classList.add('hidden'), 2000);
  };
}
