import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiMenu, FiX, FiZap, FiSun, FiMoon, FiLogOut, FiFileText } from 'react-icons/fi';
import Button from '../ui/Button';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Editor', icon: <FiFileText className="mr-2" /> },
    { to: '/history', label: 'History', icon: <FiZap className="mr-2" /> },
  ];

  const authLinks = (
    <div className="flex items-center space-x-2">
      <div className="hidden md:flex items-center text-sm text-gray-700 dark:text-gray-300 mr-4">
        <span className="truncate max-w-[160px]">{user?.email}</span>
        {user?.isPro && (
          <span className="ml-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full whitespace-nowrap">
            PRO
          </span>
        )}
        <span className="ml-2 text-gray-500 dark:text-gray-400 whitespace-nowrap">
          ({user?.dailyUsageCount || 0}/5)
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="h-9 w-9 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="hidden md:flex items-center h-9 px-3.5 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <FiLogOut className="mr-1.5" /> Sign out
      </Button>
    </div>
  );

  const guestLinks = (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="h-9 w-9 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => navigate('/login')} 
        className="h-9 px-4"
      >
        Log in
      </Button>
      <Button 
        variant="default" 
        size="sm" 
        onClick={() => navigate('/register')} 
        className="h-9 px-4"
      >
        Sign up
      </Button>
    </div>
  );

  const mobileMenu = isOpen && (
    <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="px-2 pt-2 pb-3 space-y-1">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            onClick={() => setIsOpen(false)}
          >
            <div className="flex items-center">
              <span className="mr-2">{link.icon}</span>
              {link.label}
            </div>
          </Link>
        ))}
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
          >
            <div className="flex items-center">
              <FiLogOut className="mr-2" />
              Sign out
            </div>
          </button>
        ) : (
          <>
            <button
              onClick={() => {
                navigate('/login');
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              Log in
            </button>
            <button
              onClick={() => {
                navigate('/register');
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-base font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md"
            >
              Create account
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <FiZap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                <span className="ml-2 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  AI Writer
                </span>
              </Link>
              <div className="hidden md:block ml-10">
                <div className="flex items-center space-x-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden md:block">
              {isAuthenticated ? authLinks : guestLinks}
            </div>

            <div className="flex md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <FiX className="block h-6 w-6" />
                ) : (
                  <FiMenu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenu}
      </nav>
      
      {/* Add padding to account for fixed navbar */}
      <div className="pt-14"></div>
    </>
  );
};

export default Navbar;
