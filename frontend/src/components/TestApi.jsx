import { useState } from 'react';
import { ping } from '../utils/api';
import { Activity } from 'lucide-react';

const TestApi = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await ping();
      setStatus({ success: true, message: response.message });
    } catch (error) {
      setStatus({ success: false, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">API Status</h3>
      
      <button
        onClick={testConnection}
        disabled={loading}
        className="w-full btn-secondary flex items-center justify-center space-x-2 mb-4"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        ) : (
          <Activity className="h-4 w-4" />
        )}
        <span>{loading ? 'Testing...' : 'Test Connection'}</span>
      </button>

      {status && (
        <div className={`p-3 rounded-lg text-sm ${
          status.success 
            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="font-medium">
              {status.success ? '✓' : '✗'}
            </span>
            <span>{status.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestApi;
