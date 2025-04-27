const ctx = document.getElementById('performanceChart').getContext('2d');

const performanceChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Portfolio Value',
      data: [10000, 10500, 11000, 10750, 12354],
      fill: true,
      tension: 0.4,
      borderColor: '#0d6efd',
      backgroundColor: 'rgba(13, 110, 253, 0.1)',
      pointBackgroundColor: '#0d6efd'
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        grid: { display: false }
      },
      y: {
        grid: { color: '#eee' }
      }
    }
  }
});
