'use strict';

import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DataPoint {
  label: string;
  value: number;
}

interface DataVisualizationProps {
  data: {
    timeSeries: DataPoint[];
    categories: DataPoint[];
    comparison: DataPoint[];
    distribution: DataPoint[];
  };
}

export default function DataVisualization({ data }: DataVisualizationProps) {
  const [activeChart, setActiveChart] = useState<'line' | 'bar' | 'pie' | 'doughnut'>('line');
  const [animate, setAnimate] = useState(true);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'First Timer Analytics',
      },
    },
    animation: animate ? {
      duration: 2000,
      easing: 'easeInOutQuart',
    } : false,
  };

  const timeSeriesData = {
    labels: data.timeSeries.map(d => d.label),
    datasets: [
      {
        label: 'First Timers Over Time',
        data: data.timeSeries.map(d => d.value),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const categoryData = {
    labels: data.categories.map(d => d.label),
    datasets: [
      {
        label: 'Categories',
        data: data.categories.map(d => d.value),
        backgroundColor: [
          'rgba(59, 130, 246, 0.5)',
          'rgba(16, 185, 129, 0.5)',
          'rgba(245, 158, 11, 0.5)',
          'rgba(239, 68, 68, 0.5)',
        ],
      },
    ],
  };

  const renderChart = () => {
    switch (activeChart) {
      case 'line':
        return <Line options={chartOptions} data={timeSeriesData} />;
      case 'bar':
        return <Bar options={chartOptions} data={timeSeriesData} />;
      case 'pie':
        return <Pie options={chartOptions} data={categoryData} />;
      case 'doughnut':
        return <Doughnut options={chartOptions} data={categoryData} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Chart Type Selector */}
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          {(['line', 'bar', 'pie', 'doughnut'] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                setAnimate(true);
                setActiveChart(type);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeChart === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={() => setAnimate(!animate)}
          className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          {animate ? 'Disable' : 'Enable'} Animations
        </button>
      </div>

      {/* Chart Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeChart}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          {renderChart()}
        </motion.div>
      </AnimatePresence>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.comparison.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-4 rounded-lg shadow"
          >
            <h4 className="text-sm font-medium text-gray-500">{item.label}</h4>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{item.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 