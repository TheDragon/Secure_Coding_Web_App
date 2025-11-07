import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function ChartCard({ title, labels = [], data = [] }) {
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        borderColor: '#22d3ee',
        backgroundColor: 'rgba(34,211,238,0.2)',
      },
    ],
  };
  return (
    <div className="card">
      <h3>{title}</h3>
      <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
    </div>
  );
}
