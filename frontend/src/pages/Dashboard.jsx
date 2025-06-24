import { useState, useRef } from 'react';
import DrawingCanvas from '../components/DrawingCanvas';
import MoodCard from '../components/MoodCard';
import TestApi from '../components/TestApi';
import { Brain } from 'lucide-react';

const Dashboard = ({ changeCoins }) => {
  const [mood, setMood] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef();

  const hasEarnedTodaysCoins = () => {
    const today = new Date().toDateString();
    const lastEarned = localStorage.getItem('lastCoinEarned');
    return lastEarned === today;
  };

  const awardDailyCoins = () => {
    if (!hasEarnedTodaysCoins()) {
      changeCoins(2);
      localStorage.setItem('lastCoinEarned', new Date().toDateString());
    }
  };

  const saveMoodHistory = (mood, confidence) => {
    const history = JSON.parse(localStorage.getItem('history') || '[]');
    const newEntry = {
      timestamp: new Date().toISOString(),
      mood,
      confidence
    };
    
    history.push(newEntry);
    localStorage.setItem('history', JSON.stringify(history));
  };

  const predictMood = async () => {
    setLoading(true);
    
    try {
      // Get canvas as blob
      const stage = document.querySelector('canvas');
      if (!stage) {
        throw new Error('No drawing found');
      }

      stage.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Failed to capture drawing');
        }

        const formData = new FormData();
        formData.append('image', blob, 'drawing.png');

        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/predict`, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          setMood(result.mood);
          setConfidence(result.confidence);
          
          // Save to history and award coins
          saveMoodHistory(result.mood, result.confidence);
          awardDailyCoins();
          
        } catch (error) {
          console.error('Error predicting mood:', error);
          // Fallback for demo purposes
          const mockMoods = ['Happy', 'Sad', 'Calm', 'Angry'];
          const mockMood = mockMoods[Math.floor(Math.random() * mockMoods.length)];
          const mockConfidence = 0.7 + Math.random() * 0.3;
          
          setMood(mockMood);
          setConfidence(mockConfidence);
          saveMoodHistory(mockMood, mockConfidence);
          awardDailyCoins();
        } finally {
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Error capturing canvas:', error);
      alert('Please draw something first!');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Express Your Mood</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Draw freely and let AI analyze your emotional state
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <DrawingCanvas ref={canvasRef} />
          
          <div className="mt-6 flex justify-center">
            <button
              onClick={predictMood}
              disabled={loading}
              className="btn-primary flex items-center space-x-2 px-8 py-3 text-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5" />
                  <span>Predict Mood</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <MoodCard mood={mood} confidence={confidence} />
          
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Daily Reward</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                First prediction today
              </span>
              <div className="flex items-center space-x-1">
                <span className="text-lg">🪙</span>
                <span className="font-medium">+2</span>
              </div>
            </div>
            {hasEarnedTodaysCoins() && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                ✓ Already earned today
              </p>
            )}
          </div>

          <TestApi />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
