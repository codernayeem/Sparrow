import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Bell, 
  MessageCircle, 
  User, 
  Users, 
  Menu, 
  X, 
  Plus, 
  LogOut 
} from 'lucide-react';
import CreatePost from '../../pages/createpost/CreatePost';

const Sidebar = ({ user, onLogout, refreshTrigger }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/notifications/unread-count');
        if (response.ok) {
          const data = await response.json();
          setUnreadNotifications(data.unreadCount);
        }
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };

    if (user) {
      fetchUnreadCount();
      // Refresh count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user, refreshTrigger]);
  
  const menuItems = [
    {
      name: 'Home',
      icon: <Home className="w-7 h-7" />,
      path: '/dashboard',
      active: location.pathname === '/dashboard'
    },
    {
      name: 'Notifications',
      icon: <Bell className="w-7 h-7" />,
      path: '/notifications',
      active: location.pathname === '/notifications',
      badge: unreadNotifications > 0 ? unreadNotifications.toString() : null
    },
    {
      name: 'Messages',
      icon: <MessageCircle className="w-7 h-7" />,
      path: '/messages',
      active: location.pathname === '/messages'
    },
    {
      name: 'Profile',
      icon: <User className="w-7 h-7" />,
      path: '/profile',
      active: location.pathname === '/profile' || location.pathname.startsWith('/profile/')
    },
    {
      name: 'People',
      icon: <Users className="w-7 h-7" />,
      path: '/people',
      active: location.pathname === '/people'
    }
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center">
          <img src="/logo.png" alt="Sparrow Logo" className="w-8 h-8 mr-3" />
          <a href="/dashboard">
            <h1 className="text-xl font-bold text-blue-600 heading">Sparrow</h1>
          </a>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-full md:w-20 lg:w-80 xl:w-80 bg-white flex flex-col h-screen transition-transform duration-300 ease-in-out md:sticky md:top-0 border-r border-gray-200 md:shadow-sm`}>
        {/* Logo - Desktop only */}
        <div className="hidden md:block p-6">
          <a href="/dashboard" className="flex items-center">
            <div className="flex items-center">
              <img src="/logo.png" alt="Sparrow Logo" className="w-8 h-8 mr-3" />
              <h1 className="text-xl font-bold text-blue-600 hidden lg:block heading">Sparrow</h1>
            </div>
          </a>
        </div>

        {/* Mobile header */}
        <div className="md:hidden p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/logo.png" alt="Sparrow Logo" className="w-8 h-8 mr-3" />
            <h1 className="text-xl font-bold text-blue-600 heading">Sparrow</h1>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 pt-4 px-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-full transition-all duration-200 group ${
                item.active
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <div className={`${item.active ? 'text-blue-600' : 'text-gray-700 group-hover:text-gray-900'}`}>
                  {item.icon}
                </div>
                <span className="ml-5 text-lg font-medium md:hidden lg:block">{item.name}</span>
              </div>
              {item.badge && (
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center md:hidden lg:flex">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
          
          {/* Post Button */}
          <div className="pt-6">
            <button
              onClick={() => setShowCreatePostModal(true)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-full transition-colors duration-200 text-base md:hidden lg:block shadow-lg"
            >
              Post
            </button>
            <button
              onClick={() => setShowCreatePostModal(true)}
              className="hidden md:block lg:hidden w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto transition-colors duration-200 shadow-lg"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 mt-auto">
          <div className="flex items-center justify-between p-3 rounded-full hover:bg-gray-100 transition-colors duration-200">
            {/* Profile Section - Clickable */}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center flex-1 text-left"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                {user?.profileImg ? (
                  <img
                    src={user.profileImg}
                    alt={user.fullName}
                    className="w-10 h-10 object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user?.fullName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-3 md:hidden lg:block text-left">
                <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">{user?.fullName}</p>
                <p className="text-sm text-gray-500 truncate max-w-[120px]">@{user?.username}</p>
              </div>
            </button>

            {/* Logout Button */}
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to logout?')) {
                  onLogout();
                }
              }}
              className="md:hidden lg:block p-2 rounded-full hover:bg-red-50 transition-colors duration-200 group"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-500 transition-colors" />
            </button>
          </div>

          {/* Mobile Logout Button */}
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to logout?')) {
                onLogout();
              }
            }}
            className="hidden md:block lg:hidden w-full mt-2 flex items-center justify-center p-2 rounded-full hover:bg-red-50 transition-colors duration-200 group"
          >
            <svg className="w-5 h-5 text-gray-500 group-hover:text-red-500 transition-colors mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm text-gray-500 group-hover:text-red-500 font-medium">Logout</span>
          </button>
        </div>
    </div>

    {/* Create Post Modal */}
    {showCreatePostModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 heading">Create Post</h2>
            <button
              onClick={() => setShowCreatePostModal(false)}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors duration-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            <CreatePost
              onPostCreated={() => {
                setShowCreatePostModal(false);
                // Optionally refresh the page or show a success message
                window.location.reload();
              }}
            />
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Sidebar;