import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Menu, X, Settings, HelpCircle, Calendar } from 'lucide-react';
import { auth, type User as AuthUser } from '../lib/auth';
import trainMICELogo from '../TrainMICE logo.png';

type HeaderProps = {
  onLoginClick: () => void;
  onSignupClick: () => void;
};

export function Header({ onLoginClick, onSignupClick }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);

  useEffect(() => {
    // Get initial session
    auth.getSession().then(({ user }) => {
      setUser(user);
      if (user) {
        fetchUserName(user.id);
      }
    });

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChange((user) => {
      setUser(user);
      if (user) {
        fetchUserName(user.id);
      } else {
        setUserName('');
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserName = async (_userId: string) => {
    // Use fullName from user object directly
    if (user?.fullName) {
      setUserName(user.fullName);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    setUserName('');
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const trainerUrl = import.meta.env.VITE_FRONTEND_URL_TRAINER || '';

  const handleBecomeTrainer = () => {
    if (trainerUrl) {
      window.location.href = trainerUrl;
    }
  };

  return (
    <header className="bg-white/70 backdrop-blur-xl backdrop-saturate-[180%] border-b border-black/10 sticky top-0 z-40 shadow-sm">
      <div className="w-full px-6">
        <div className="flex items-center h-16 relative">
          {/* Logo - Left */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <a href="/" className="flex items-center">
              <img
                src={trainMICELogo}
                alt="TrainMICE Logo"
                className="h-10 w-auto"
              />
            </a>
            {trainerUrl && (
              <button
                onClick={handleBecomeTrainer}
                className="px-3 py-1 text-base font-medium text-yellow-500 hover:text-teal-600 rounded-lg transition-colors"
              >
                Trainer
              </button>
            )}
          </div>

          {/* Navigation Links - Centered */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            <button
              onClick={() => navigate('/')}
              className={`px-4 py-2 text-sm font-medium rounded-lg border border-black/10 transition-all duration-200 hover:-translate-y-0.5 ${isActive('/')
                ? 'bg-yellow-400 text-gray-900 font-semibold shadow-glow-yellow-sm'
                : 'text-gray-700 bg-white/50 backdrop-blur-md hover:bg-white/80'
                }`}
            >
              Courses
            </button>
            <button
              onClick={() => navigate('/public-training')}
              className={`px-4 py-2 text-sm font-medium rounded-lg border border-black/10 transition-all duration-200 hover:-translate-y-0.5 ${isActive('/public-training')
                ? 'bg-yellow-400 text-gray-900 font-semibold shadow-glow-yellow-sm'
                : 'text-gray-700 bg-white/50 backdrop-blur-md hover:bg-white/80'
                }`}
            >
              Public Training
            </button>
            <button
              onClick={() => navigate('/request-custom-course')}
              className={`px-4 py-2 text-sm font-medium rounded-lg border border-black/10 transition-all duration-200 hover:-translate-y-0.5 ${isActive('/request-custom-course')
                ? 'bg-yellow-400 text-gray-900 font-semibold shadow-glow-yellow-sm'
                : 'text-gray-700 bg-white/50 backdrop-blur-md hover:bg-white/80'
                }`}
            >
              Request Custom Courses
            </button>
            <button
              onClick={() => navigate('/contact-us')}
              className={`px-4 py-2 text-sm font-medium rounded-lg border border-black/10 transition-all duration-200 hover:-translate-y-0.5 ${isActive('/contact-us')
                ? 'bg-yellow-400 text-gray-900 font-semibold shadow-glow-yellow-sm'
                : 'text-gray-700 bg-white/50 backdrop-blur-md hover:bg-white/80'
                }`}
            >
              Contact Us
            </button>
            <a
              href="https://klgreens.com/elementor-2847/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-medium rounded-lg border border-black/10 transition-all duration-200 hover:-translate-y-0.5 text-gray-700 bg-white/50 backdrop-blur-md hover:bg-white/80"
            >
              Gallery
            </a>
          </nav>

          {/* User Actions - Right */}
          <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
            {user ? (
              <div className="flex items-center gap-3">
                {/* 1. User Profile Pill */}
                <div className="flex items-center gap-3 pl-4 pr-1 py-1 bg-amber-400 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer">
                  {/* Name */}
                  <span className="font-bold text-white uppercase tracking-wide text-sm select-none">
                    {userName || 'USER'}
                  </span>

                  {/* Avatar Circle */}
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white/50">
                    <img
                      src={`https://ui-avatars.com/api/?name=${userName || 'User'}&background=random&color=fff`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* 2. Menu Button with Dropdown (Yellow Square) */}
                <div className="relative">
                  <button
                    onClick={() => setDesktopMenuOpen(!desktopMenuOpen)}
                    className="w-10 h-10 flex items-center justify-center bg-amber-400 rounded-lg shadow-sm hover:bg-amber-500 text-white transition-colors"
                  >
                    <Menu className="w-6 h-6" />
                  </button>

                  {/* Dropdown Menu */}
                  {desktopMenuOpen && (
                    <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                      {/* Menu Items */}
                      <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors">
                        <User className="w-4 h-4" /> My Profile
                      </button>
                      <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors">
                        <Calendar className="w-4 h-4" /> My Bookings
                      </button>
                      <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors">
                        <Settings className="w-4 h-4" /> Account Settings
                      </button>
                      <hr className="my-1 border-gray-100" />
                      <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors">
                        <HelpCircle className="w-4 h-4" /> Help Center
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setDesktopMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-3 text-red-600 font-medium transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Log Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={onLoginClick}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-md hover:bg-white rounded-lg border border-black/10 transition-all duration-200 hover:-translate-y-0.5"
                >
                  Log In
                </button>
                <button
                  onClick={onSignupClick}
                  className="px-4 py-2 text-sm font-medium text-gray-900 bg-yellow-400 hover:bg-yellow-500 rounded-lg transition-all duration-200 hover:-translate-y-0.5 shadow-glow-yellow-sm hover:shadow-glow-yellow font-semibold"
                >
                  Sign Up
                </button>
              </>
            )}

            {/* Mobile Menu Button - ALWAYS VISIBLE ON MOBILE */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => {
                  navigate('/');
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2 text-left text-sm font-medium rounded-lg ${isActive('/') ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Courses
              </button>
              <button
                onClick={() => {
                  navigate('/public-training');
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2 text-left text-sm font-medium rounded-lg ${isActive('/public-training')
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Public Training
              </button>
              <button
                onClick={() => {
                  navigate('/request-custom-course');
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2 text-left text-sm font-medium rounded-lg ${isActive('/request-custom-course')
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Request Custom Courses
              </button>
              <button
                onClick={() => {
                  navigate('/contact-us');
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2 text-left text-sm font-medium rounded-lg ${isActive('/contact-us')
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Contact Us
              </button>
              <a
                href="https://klgreens.com/elementor-2847/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-left text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Gallery
              </a>
              {trainerUrl && (
                <button
                  onClick={() => {
                    handleBecomeTrainer();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 text-left text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
                >
                  Become Trainer
                </button>
              )}
              {user && (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  Log Out
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
