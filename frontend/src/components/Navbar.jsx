import { Link, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Palette, History, LogOut, User, Coins } from 'lucide-react';

const Navbar = ({ user, coins }) => {
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Palette className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold">Art Therapy</span>
            </Link>
            
            <div className="hidden md:flex space-x-4">
              <Link
                to="/"
                className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}
              >
                Dashboard
              </Link>
              <Link
                to="/history"
                className={`nav-link ${isActive('/history') ? 'nav-link-active' : ''}`}
              >
                <History className="h-4 w-4" />
                History
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">{coins}</span>
            </div>

            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="text-sm truncate max-w-32">{user?.displayName || user?.email}</span>
            </div>

            <button
              onClick={handleSignOut}
              className="nav-link flex items-center space-x-1"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
