import { renderNav } from './components/nav.js';
import { renderAuthControls } from './components/auth.js';
import { renderHome } from './components/home.js';
import { renderPledge } from './components/pledge.js';
import { renderTracker } from './components/tracker.js';
import { renderTips } from './components/tips.js';
import { renderChallenges } from './components/challenges.js';
import { renderStores } from './components/stores.js';
import { renderLeaderboard } from './components/leaderboard.js';
import { renderProfile } from './components/profile.js';
import { renderAdmin } from './components/admin.js';

const routes = {
  '': renderHome,
  '#home': renderHome,
  '#pledge': renderPledge,
  '#tracker': renderTracker,
  '#tips': renderTips,
  '#challenges': renderChallenges,
  '#stores': renderStores,
  '#leaderboard': renderLeaderboard,
  '#profile': renderProfile,
  '#admin': renderAdmin,
  '#about': (root)=>{
    root.innerHTML = `<section class='card'><h2>About EcoLife</h2><p>EcoLife helps you reduce single‑use plastics through tracking, tips, challenges, and community features.</p></section>`;
  }
};

function mount(){
  const main = document.getElementById('app');
  const hash = window.location.hash || '#home';
  renderNav(hash.replace('#',''));
  (routes[hash]||routes['#home'])(main);
}

function setupMenu(){
  const btn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  function setOpen(isOpen){
    sidebar.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('sidebar-open', isOpen);
  }
  btn.addEventListener('click', ()=> setOpen(!sidebar.classList.contains('open')));
  sidebar.addEventListener('click', (e)=>{ if (e.target.tagName === 'A') setOpen(false); });
}

window.addEventListener('hashchange', mount);
window.addEventListener('load', ()=>{
  mount();
  renderAuthControls();
  setupMenu();
});
