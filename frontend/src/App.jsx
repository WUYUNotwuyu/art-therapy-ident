import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import AuthGate from './components/AuthGate';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import useCoins from './hooks/useCoins';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { coins, changeCoins } = useCoins();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved) {
      setIsDarkMode(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <AuthGate user={user}>
            <Navbar 
              user={user} 
              coins={coins} 
              isDarkMode={isDarkMode} 
              setIsDarkMode={setIsDarkMode} 
            />
            <main className="pt-16">
              <Routes>
                <Route path="/" element={<Dashboard changeCoins={changeCoins} />} />
                <Route path="/mood" element={<Dashboard changeCoins={changeCoins} />} />
                <Route path="/history" element={<History />} />
              </Routes>
            </main>
          </AuthGate>
        } />
      </Routes>
    </div>
  );
}

export default App; 