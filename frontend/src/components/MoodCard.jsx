const MoodCard = ({ mood, confidence }) => {
  const moodEmojis = {
    Happy: '😊',
    Sad: '😢', 
    Calm: '😌',
    Angry: '😠'
  };

  const moodColors = {
    Happy: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    Sad: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    Calm: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    Angry: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
  };

  if (!mood) {
    return (
      <div className="card text-center">
        <div className="text-6xl mb-4">🎨</div>
        <h3 className="text-lg font-semibold mb-2">Draw Your Mood</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Express yourself through art and discover your emotional state
        </p>
      </div>
    );
  }

  return (
    <div className="card text-center">
      <div className="text-6xl mb-4">{moodEmojis[mood] || '��'}</div>
      <div className={`inline-block px-4 py-2 rounded-full text-lg font-semibold mb-4 ${moodColors[mood] || 'bg-gray-100 dark:bg-gray-700'}`}>
        {mood}
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>Confidence</span>
          <span>{Math.round(confidence * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${confidence * 100}%` }}
          ></div>
        </div>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Based on your artwork analysis
      </p>
    </div>
  );
};

export default MoodCard;
