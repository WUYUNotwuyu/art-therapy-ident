import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js/auto';
import { Line } from 'react-chartjs-2';
import HistoryTable from '../components/HistoryTable';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const History = () => {
  const [history, setHistory] = useState([]);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        const sortedHistory = parsed.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setHistory(sortedHistory);
        
        // Prepare chart data
        const labels = sortedHistory.map(entry => 
          new Date(entry.timestamp).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })
        );
        
        const moodScores = sortedHistory.map(entry => {
          // Convert mood to numeric score for charting
          const scores = { Happy: 4, Calm: 3, Sad: 1, Angry: 2 };
          return scores[entry.mood] || 2.5;
        });

        const confidenceData = sortedHistory.map(entry => entry.confidence * 100);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Mood Score',
              data: moodScores,
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              yAxisID: 'y',
            },
            {
              label: 'Confidence %',
              data: confidenceData,
              borderColor: 'rgb(16, 185, 129)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4,
              yAxisID: 'y1',
            },
          ],
        });
      } catch (error) {
        console.error('Error parsing history:', error);
      }
    }
  }, []);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Mood Trends Over Time',
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        min: 1,
        max: 4,
        ticks: {
          callback: function(value) {
            const labels = { 1: 'Sad', 2: 'Angry', 3: 'Calm', 4: 'Happy' };
            return labels[value] || '';
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        min: 0,
        max: 100,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      },
    },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mood History</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your emotional journey over time
        </p>
      </div>

      {history.length === 0 ? (
        <div className="card text-center">
          <div className="text-6xl mb-4">📈</div>
          <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Start creating art to see your mood trends
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {chartData && (
            <div className="card">
              <Line data={chartData} options={chartOptions} />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {history.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Sessions
              </div>
            </div>
            
            <div className="card text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {history.length > 0 ? Math.round(history.reduce((acc, h) => acc + h.confidence, 0) / history.length * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avg. Confidence
              </div>
            </div>
            
            <div className="card text-center">
              <div className="text-2xl mb-2">
                {history.length > 0 ? (() => {
                  const moodCounts = history.reduce((acc, h) => {
                    acc[h.mood] = (acc[h.mood] || 0) + 1;
                    return acc;
                  }, {});
                  const mostCommon = Object.entries(moodCounts).sort(([,a], [,b]) => b - a)[0];
                  const emojis = { Happy: '😊', Sad: '😢', Calm: '😌', Angry: '😠' };
                  return emojis[mostCommon[0]] || '😐';
                })() : '😐'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Most Common
              </div>
            </div>
          </div>

          <HistoryTable />
        </div>
      )}
    </div>
  );
};

export default History;
