import { Smile, Frown, Meh, Angry, Zap, AlertTriangle } from 'lucide-react';

const MoodCard = ({ mood, confidence }) => {
  const getMoodIcon = (mood) => {
    const iconMap = {
      Happy: Smile,
      Sad: Frown,
      Calm: Meh,
      Angry: Angry,
      Excited: Zap,
      Anxious: AlertTriangle
    };
    return iconMap[mood] || Meh;
  };

  const getMoodColor = (mood) => {
    const colorMap = {
      Happy: 'text-yellow-500',
      Sad: 'text-blue-500',
      Calm: 'text-green-500',
      Angry: 'text-red-500',
      Excited: 'text-orange-500',
      Anxious: 'text-purple-500'
    };
    return colorMap[mood] || 'text-gray-500';
  };

  const getMoodBg = (mood) => {
    const bgMap = {
      Happy: 'bg-yellow-100 dark:bg-yellow-900',
      Sad: 'bg-blue-100 dark:bg-blue-900',
      Calm: 'bg-green-100 dark:bg-green-900',
      Angry: 'bg-red-100 dark:bg-red-900',
      Excited: 'bg-orange-100 dark:bg-orange-900',
      Anxious: 'bg-purple-100 dark:bg-purple-900'
    };
    return bgMap[mood] || 'bg-gray-100 dark:bg-gray-900';
  };

  if (!mood) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Mood Analysis</h3>
        <div className="text-center py-8">
          <Meh className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Draw something to analyze your mood</p>
        </div>
      </div>
    );
  }

  const Icon = getMoodIcon(mood);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Mood Analysis</h3>
      
      <div className={`rounded-lg p-6 ${getMoodBg(mood)} text-center mb-4`}>
        <Icon className={`h-16 w-16 mx-auto mb-4 ${getMoodColor(mood)}`} />
        <h4 className="text-2xl font-bold mb-2">{mood}</h4>
        <div className="flex items-center justify-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Confidence:</span>
          <span className="font-semibold">{Math.round(confidence * 100)}%</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Accuracy</span>
          <span>{Math.round(confidence * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${getMoodColor(mood).replace('text-', 'bg-')}`}
            style={{ width: `${confidence * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default MoodCard;
