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
import { Calendar, TrendingUp, BarChart } from 'lucide-react';

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
  const [filter, setFilter] = useState('all');
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('history') || '[]');
    setHistory(savedHistory.reverse());
  }, []);

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(entry => entry.mood === filter);

  const moodCounts = history.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {});

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      localStorage.removeItem('history');
      setHistory([]);
    }
  };

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
          Track your emotional journey through art
        </p>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12">
          <BarChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No mood history yet</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Start drawing to see your mood analysis history here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Recent Analysis</h2>
                <div className="flex space-x-2">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="input text-sm"
                  >
                    <option value="all">All Moods</option>
                    <option value="Happy">Happy</option>
                    <option value="Sad">Sad</option>
                    <option value="Calm">Calm</option>
                    <option value="Angry">Angry</option>
                    <option value="Anxious">Anxious</option>
                    <option value="Excited">Excited</option>
                  </select>
                  <button
                    onClick={clearHistory}
                    className="btn-secondary text-sm"
                  >
                    Clear History
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {filteredHistory.map((entry, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg font-semibold">{entry.mood}</span>
                          <span className="text-sm text-gray-500">
                            {Math.round(entry.confidence * 100)}% confidence
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(entry.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div 
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${entry.confidence * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Mood Summary</h3>
              <div className="space-y-3">
                {Object.entries(moodCounts)
                  .sort(([,a], [,b]) => b - a)
                  .map(([mood, count]) => (
                    <div key={mood} className="flex justify-between items-center">
                      <span className="text-sm">{mood}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div 
                            className="h-2 bg-blue-500 rounded-full"
                            style={{ width: `${(count / history.length) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 w-8">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Statistics</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Total Drawings</span>
                  <span className="font-medium">{history.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Most Common</span>
                  <span className="font-medium">
                    {Object.entries(moodCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Confidence</span>
                  <span className="font-medium">
                    {history.length > 0 
                      ? Math.round((history.reduce((sum, entry) => sum + entry.confidence, 0) / history.length) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
