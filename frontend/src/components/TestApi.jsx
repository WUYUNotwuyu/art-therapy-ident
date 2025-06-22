import { useState } from 'react';

const TestApi = () => {
  const [status, setStatus] = useState('idle');
  const [response, setResponse] = useState(null);

  const testPing = async () => {
    setStatus('loading');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/ping`);
      const data = await res.json();
      setResponse(data);
      setStatus('success');
    } catch (error) {
      setResponse({ error: error.message });
      setStatus('error');
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">API Connection Test</h3>
      
      <button
        onClick={testPing}
        disabled={status === 'loading'}
        className="btn-primary mb-4"
      >
        {status === 'loading' ? 'Testing...' : 'Test API Connection'}
      </button>

      {response && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Response:</h4>
          <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>API URL: {import.meta.env.VITE_API_URL || 'Not configured'}</p>
        <p>Status: <span className={`font-medium ${
          status === 'success' ? 'text-green-600' : 
          status === 'error' ? 'text-red-600' : 
          'text-gray-600'
        }`}>{status}</span></p>
      </div>
    </div>
  );
};

export default TestApi;
