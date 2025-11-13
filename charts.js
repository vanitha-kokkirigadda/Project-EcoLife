export function renderChart(canvasId, labels, values){
  const ctx = document.getElementById(canvasId).getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label: 'Items', data: values }] },
    options: { responsive: true, maintainAspectRatio: false, scales:{ y:{ beginAtZero:true } } }
  });
}
