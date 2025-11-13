export function renderStores(root){
  root.innerHTML = `
    <section class="card">
      <h2>📍 Eco-friendly Stores Near You</h2>
      <div id="map" style="height: 400px; border-radius: 12px;"></div>
    </section>
  `;

  // Initialize map
  const map = L.map('map').setView([20.5937, 78.9629], 5); // Center on India

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18
  }).addTo(map);

  // Example markers (you can pull from Supabase stores table later)
  const stores = [
    { name: "Eco Store - Hyderabad", lat: 17.3850, lon: 78.4867 },
    { name: "Refill Center - Bengaluru", lat: 12.9716, lon: 77.5946 },
    { name: "Zero Waste Shop - Chennai", lat: 13.0827, lon: 80.2707 }
  ];

  stores.forEach(s=>{
    L.marker([s.lat, s.lon]).addTo(map)
      .bindPopup(`<b>${s.name}</b>`);
  });
}