"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ProductsChartProps {
  data: {
    name: string;
    revenue: number;
  }[];
}

export function ProductsChart({ data }: ProductsChartProps) {
  const chartData = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        label: "Revenue ($)",
        data: data.map((item) => item.revenue),
        backgroundColor: [
          "rgba(99, 102, 241, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(192, 132, 252, 0.8)",
          "rgba(216, 180, 254, 0.8)",
        ],
        borderColor: [
          "rgb(99, 102, 241)",
          "rgb(139, 92, 246)",
          "rgb(168, 85, 247)",
          "rgb(192, 132, 252)",
          "rgb(216, 180, 254)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Top 5 Products by Revenue (Last 30 Days)",
        font: {
          size: 16,
          weight: "bold" as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += "$" + context.parsed.y.toFixed(2);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return "$" + value;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
