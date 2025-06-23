import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Moon, Sun, Coins, LogOut, Palette, BarChart3 } from 'lucide-react';

const Navbar = ({ user, coins, isDarkMode, setIsDarkMode }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      if (!auth) {
        // Firebase not configured, just nav to login
        navigate('/login');
        return;
      }
      
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      {!auth && (
        <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white text-center py-1 text-sm z-50">
          🚧 Demo Mode - Firebase not configured
        </div>
      )}
      <nav className={`fixed ${!auth ? 'top-7' : 'top-0'} left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-40`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Palette className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl">ArtTherapy</span>
            </Link>
            
            <div className="hidden md:flex space-x-4">
              <Link 
                to="/mood" 
                className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Palette className="h-4 w-4" />
                <span>Draw</span>
              </Link>
              <Link 
                to="/history" 
                className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                <span>History</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
              <Coins className="h-4 w-4" />
              <span className="font-medium">{coins}</span>
            </div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <div className="flex items-center space-x-3">
              <img
                src={user?.photoURL || '/api/placeholder/32/32'}
                alt={user?.displayName || 'User'}
                className="w-8 h-8 rounded-full"
              />
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
    </>
  );
};

export default Navbar;
