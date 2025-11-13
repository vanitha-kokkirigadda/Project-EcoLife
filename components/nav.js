export function renderNav(active = '') {
  const el = document.getElementById('sidebar');
  el.innerHTML = `
    <a href="#home" class="${active==='home'?'active':''}">🏠 Home</a>
    <a href="#pledge" class="${active==='pledge'?'active':''}">🙌 Take Pledge</a>
    <a href="#tracker" class="${active==='tracker'?'active':''}">♻️ Plastic Tracker</a>
    <a href="#tips" class="${active==='tips'?'active':''}">💡 Eco Tips</a>
    <a href="#challenges" class="${active==='challenges'?'active':''}">🎯 Challenges</a>
    <a href="#stores" class="${active==='stores'?'active':''}">📍 Nearby Stores</a>
    <a href="#leaderboard" class="${active==='leaderboard'?'active':''}">🥇 Leaderboard</a>
    <a href="#profile" class="${active==='profile'?'active':''}">👤 Profile</a>
    <a href="#admin" class="${active==='admin'?'active':''}">🛡️ Admin</a>
    <a href="#about" class="${active==='about'?'active':''}">ℹ️ About</a>
  `;
}
