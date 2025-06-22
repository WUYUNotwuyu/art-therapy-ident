import { useState, useEffect } from 'react';

const HistoryTable = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      } catch (error) {
        console.error('Error parsing history:', error);
      }
    }
  }, []);

  const moodEmojis = {
    Happy: '😊',
    Sad: '😢',
    Calm: '😌', 
    Angry: '😠'
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (history.length === 0) {
    return (
      <div className="card text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-semibold mb-2">No History Yet</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Start drawing to track your mood over time
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Mood History</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 px-4">Date</th>
              <th className="text-left py-2 px-4">Mood</th>
              <th className="text-left py-2 px-4">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry, index) => (
              <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(entry.timestamp)}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{moodEmojis[entry.mood] || '😐'}</span>
                    <span className="font-medium">{entry.mood}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${entry.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {Math.round(entry.confidence * 100)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryTable;
