import { useState, useRef } from 'react';
import DrawingCanvas from '../components/DrawingCanvas';
import MoodCard from '../components/MoodCard';
import TestApi from '../components/TestApi';
import { predictMood } from '../utils/api';
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

  const handlePredictMood = async () => {
    setLoading(true);
    
    try {
      const stage = document.querySelector('canvas');
      if (!stage) {
        throw new Error('No drawing found');
      }

      stage.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Failed to capture drawing');
        }

        try {
          const result = await predictMood(blob);
          setMood(result.mood);
          setConfidence(result.confidence);
          
          saveMoodHistory(result.mood, result.confidence);
          awardDailyCoins();
          
          console.log('Mood predicted successfully:', result.mood);
        } catch (error) {
          console.error('Error predicting mood:', error);
          alert('Failed to analyze your drawing. Please try again.');
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
              onClick={handlePredictMood}
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
